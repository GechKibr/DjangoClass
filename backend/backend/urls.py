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

# ViewSets
from cases.views import CaseViewSet, CommentViewSet, AttachmentViewSet

# Optional: Swagger API Docs
# from rest_framework import permissions
# from drf_yasg.views import get_schema_view
# from drf_yasg import openapi

# Router configuration
router = routers.DefaultRouter()
router.register(r'cases', CaseViewSet, basename='cases')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'attachments', AttachmentViewSet, basename='attachments')


urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔹 API Version 1
    path('api/v1/', include(router.urls)),

    # 🔹 Accounts (Auth, Registration, Login)
    path('api/v1/accounts/', include('accounts.urls')),

    # 🔹 Dashboard (Admin Analytics)
    path('api/v1/dashboard/', include('dashboard.urls')),

    # 🔹 Public API (no authentication required)
    path('api/v1/public/', include('api_public.urls')),
]

# 🔹 Media (Attachments)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

