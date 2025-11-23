"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static


# -------------------------
# ViewSets (for DRF router)
# -------------------------
from cases.views import CaseViewSet, CommentViewSet, AttachmentViewSet

# -------------------------
# Accounts class-based views
# -------------------------
from accounts.views import (
    RegisterUserView, LoginUserView, LogoutUserView, CurrentUserView,
    UserProfileView, UserProfileDetailView, ChangePasswordView,
    AdminUserListView, AdminUserDetailView
)

# -------------------------
# DRF router
# -------------------------
router = routers.DefaultRouter()
router.register(r'cases', CaseViewSet, basename='cases')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'attachments', AttachmentViewSet, basename='attachments')
# router.register(r'register',RegisterUserView, basename='register')
# -------------------------
# URL patterns
# -------------------------
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API root

    # DRF router endpoints
    path('api/v1/', include(router.urls)),

    # Accounts endpoints...
    path('api/v1/accounts/register/', RegisterUserView.as_view(), name='register'),
    path('api/v1/accounts/login/', LoginUserView.as_view(), name='login'),
    path('api/v1/accounts/logout/', LogoutUserView.as_view(), name='logout'),
    path('api/v1/accounts/me/', CurrentUserView.as_view(), name='current-user'),
    path('api/v1/accounts/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/v1/accounts/profile/details/', UserProfileDetailView.as_view(), name='user-profile-detail'),
    path('api/v1/accounts/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/v1/accounts/admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('api/v1/accounts/admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),

    path('api/v1/dashboard/', include('dashboard.urls')),   # Dashboard app URLs have  4 endpoints
    path('api/v1/public/', include('api_public.urls')),   # Public API app URLs have 3 endpoints
]

# 🔹 Media (Attachments)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)




