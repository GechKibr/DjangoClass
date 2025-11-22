import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class User(AbstractUser):
    """
    Custom user model supporting multiple roles:
    - admin, case_manager, investigator, analyst, public, anonymous
    """
    USER_TYPE_CHOICES = (
        ('admin', 'System Administrator'),
        ('case_manager', 'Case Manager'),
        ('investigator', 'Investigator'),
        ('analyst', 'Data Analyst'),
        ('public', 'Public User'),
        ('anonymous', 'Anonymous User'),
    )

    email = models.EmailField(unique=True, null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='public')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    employee_id = models.CharField(max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    can_report_anonymously = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # For anonymous users: generate unique username automatically
    def save(self, *args, **kwargs):
        if self.user_type == 'anonymous' and not self.username:
            self.username = f"anon_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class UserProfile(models.Model):
    """
    Profile details for all users.
    Includes extra fields for officers and optional fields for public users.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    # Officer-specific fields
    badge_number = models.CharField(max_length=50, blank=True, null=True)
    rank = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class BlacklistedToken(models.Model):
    """
    For storing JWT or DRF tokens that are revoked/blacklisted.
    """
    token = models.CharField(max_length=500)
    blacklisted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Token blacklisted at {self.blacklisted_at}"


# Optional helper for anonymous users
def create_anonymous_user():
    """
    Utility function to create a dummy anonymous user in DB.
    """
    return User.objects.create(user_type='anonymous', is_verified=False)
