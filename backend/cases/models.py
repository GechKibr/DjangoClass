import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


# ---------------------------
# Abstract Models
# ---------------------------

class TimeStampedModel(models.Model):
    """Adds created_at and updated_at timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """Soft delete system used across all case objects"""
    is_deleted = models.BooleanField(default=False)

    def delete(self, using=None, keep_parents=False):
        """Soft delete instead of destroying data"""
        self.is_deleted = True
        self.save(update_fields=["is_deleted"])

    class Meta:
        abstract = True


class Category(TimeStampedModel, SoftDeleteModel):
    """Category for corruption cases"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


# ---------------------------
# InvolvedParty Model (MOVE THIS BEFORE Case)
# ---------------------------

class InvolvedParty(TimeStampedModel):
    """Model to track parties involved in corruption cases"""
    
    PARTY_TYPES = [
        ('government_office', 'Government Office'),
        ('public_official', 'Public Official'),
        ('private_company', 'Private Company'),
        ('individual', 'Individual'),
        ('other', 'Other'),
    ]
    
    # Use string reference to avoid circular dependency
    case = models.ForeignKey(
        'Case',  # Use string reference instead of direct class
        on_delete=models.CASCADE, 
        related_name="involved_parties"
    )
    party_type = models.CharField(max_length=50, choices=PARTY_TYPES)
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Involved parties"
    
    def __str__(self):
        return f"{self.name} ({self.get_party_type_display()})"


# ---------------------------
# Main Case Model
# ---------------------------

class Case(TimeStampedModel, SoftDeleteModel):
    """Corruption reporting case model"""

    STATUS_CHOICES = [
        ('new', 'New'),
        ('under_review', 'Under Review'),
        ('investigation', 'Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
        ('closed', 'Closed'),
    ]

    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    # ---------------------------
    # Core Case Fields
    # ---------------------------
    title = models.CharField(max_length=255)
    description = models.TextField()

    tracking_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reported_cases"
    )

    is_anonymous = models.BooleanField(default=False)

    # NEW FIELD for Public API
    is_public = models.BooleanField(
        default=False,
        help_text="If true, case is visible in public API (without personal data)."
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='new',
        db_index=True
    )

    location = models.CharField(max_length=255, blank=True, null=True)
    severity = models.CharField(
        max_length=50,
        choices=SEVERITY_CHOICES,
        null=True,
        blank=True
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="assigned_cases",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cases"
    )
    
    # ---------------------------
    # String Representation
    # ---------------------------
    def __str__(self):
        return f"{self.title} ({self.status})"

    # ---------------------------
    # Permission Logic
    # ---------------------------
    def can_view(self, user):
        """Visibility logic for authenticated users."""
        if self.is_deleted:
            return False

        if self.is_anonymous and user != self.reporter:
            return False

        return True

    # ---------------------------
    # Public API Safe Output
    # ---------------------------
    @property
    def public_summary(self):
        """Sanitized information to show to the public"""
        return {
            "tracking_id": self.tracking_id,
            "title": self.title,
            "description": self.description[:200] + "...",
            "location": self.location,
            "severity": self.severity,
            "status": self.status,
            "created_at": self.created_at,
        }

    # ---------------------------
    # Helper methods for workflow
    # ---------------------------
    def assign_to(self, user):
        """Assign case to investigation officer"""
        old = self.assigned_to
        self.assigned_to = user
        self.status = "investigation"
        self.save()

        AuditLog.log(
            user,
            action="case_assigned",
            case=self,
            details={"previous_officer": old.id if old else None}
        )

    def update_status(self, user, status):
        """Update case status"""
        old_status = self.status
        self.status = status
        self.save()

        AuditLog.log(
            user,
            action="case_status_changed",
            case=self,
            details={"old": old_status, "new": status}
        )


# ---------------------------
# Attachments
# ---------------------------

class Attachment(TimeStampedModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="attachments")
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    file = models.FileField(upload_to="evidence/")
    mime_type = models.CharField(max_length=255, blank=True)
    file_hash = models.CharField(max_length=128, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for Case {self.case.tracking_id}"


# ---------------------------
# Comments
# ---------------------------

class Comment(TimeStampedModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()

    visibility = models.CharField(
        max_length=20,
        choices=[("public", "Public"), ("private", "Private")],
        default="private"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.case}"


# ---------------------------
# Audit Log
# ---------------------------

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    class Meta:
        ordering = ["-timestamp"]

    @staticmethod
    def log(user, action, case=None, details=None):
        return AuditLog.objects.create(
            user=user,
            action=action,
            case=case,
            details=details or {}
        )