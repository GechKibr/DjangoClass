from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, BlacklistedToken


# -------------------------
# Inline profile for User
# -------------------------
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


# -------------------------
# Custom User Admin
# -------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username", "email", "first_name", "last_name",
        "user_type", "is_verified", "is_staff", "is_active"
    )
    list_filter = ("user_type", "is_verified", "is_staff", "is_active", "created_at")
    search_fields = ("username", "email", "first_name", "last_name", "employee_id")
    ordering = ("-created_at",)
    
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email", "phone_number")}),
        ("Professional Info", {"fields": ("user_type", "department", "employee_id")}),
        ("Permissions", {
            "fields": (
                "is_verified", "is_active", "is_staff", "is_superuser",
                "groups", "user_permissions"
            )
        }),
        ("Important Dates", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "user_type"),
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    inlines = (UserProfileInline,)


# -------------------------
# UserProfile Admin
# -------------------------
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "badge_number", "rank", "date_of_birth")
    list_filter = ("rank",)
    search_fields = ("user__username", "user__email", "badge_number")
    raw_id_fields = ("user",)
    readonly_fields = ("user",)  # Prevent changing linked user


# -------------------------
# BlacklistedToken Admin
# -------------------------
@admin.register(BlacklistedToken)
class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ("token", "blacklisted_at")
    list_filter = ("blacklisted_at",)
    search_fields = ("token",)
    readonly_fields = ("token", "blacklisted_at")


# -------------------------
# Customize Admin Site
# -------------------------
admin.site.site_header = "Corruption Reporting System Administration"
admin.site.site_title = "CRS Admin"
admin.site.index_title = "Welcome to the Corruption Reporting System Admin"
