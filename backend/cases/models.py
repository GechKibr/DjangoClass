import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Abstract model for created_at / updated_at fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """Soft delete capability so cases never get lost"""
    is_deleted = models.BooleanField(default=False)

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save(update_fields=["is_deleted"])

    class Meta:
        abstract = True


class Case(TimeStampedModel, SoftDeleteModel):
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

    title = models.CharField(max_length=255)
    description = models.TextField()

    tracking_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reported_cases"
    )

    is_anonymous = models.BooleanField(default=False)

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

    def __str__(self):
        return f"{self.title} ({self.status})"

    # 💡 Helper: check permissions
    def can_view(self, user):
        if self.is_anonymous and user != self.reporter:
            return False
        return True

    # 💡 Helper: assign officer
    def assign_to(self, user):
        self.assigned_to = user
        self.status = "investigation"
        self.save()
        AuditLog.log(user, "assigned_case", case=self, details={"assigned_to": user.id})

    # 💡 Helper: change status
    def update_status(self, user, status):
        old = self.status
        self.status = status
        self.save()
        AuditLog.log(user, "case_status_changed", case=self, details={
            "old_status": old,
            "new_status": status
        })


class Attachment(TimeStampedModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="attachments")
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    file = models.FileField(upload_to='evidence/')
    mime_type = models.CharField(max_length=255, blank=True)
    file_hash = models.CharField(max_length=128, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for Case {self.case.tracking_id}"

    class Meta:
        indexes = [
            models.Index(fields=["uploaded_at"]),
        ]


class Comment(TimeStampedModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()

    visibility = models.CharField(
        max_length=20,
        choices=[('public', 'Public'), ('private', 'Private')],
        default='private'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.case}"


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} - {self.timestamp}"

    @staticmethod
    def log(user, action, case=None, details=None):
        return AuditLog.objects.create(
            user=user,
            action=action,
            case=case,
            details=details or {}
        )
