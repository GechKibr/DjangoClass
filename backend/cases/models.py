from django.db import models
from django.conf import settings


class Case(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('under_review', 'Under Review'),
        ('investigation', 'Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new')

    location = models.CharField(max_length=255, blank=True, null=True)
    severity = models.CharField(max_length=50, blank=True, null=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="assigned_cases",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.status}"




class Attachment(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="attachments")
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    file = models.FileField(upload_to='evidence/')
    mime_type = models.CharField(max_length=255, blank=True)
    file_hash = models.CharField(max_length=128, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)



class Comment(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    visibility = models.CharField(
        max_length=20,
        choices=[('public', 'Public'), ('private', 'Private')],
        default='private'
    )
    created_at = models.DateTimeField(auto_now_add=True)



class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    class Meta:
        ordering = ['-timestamp']




