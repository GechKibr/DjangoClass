from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet, CommentViewSet, AttachmentViewSet
router = DefaultRouter()
router.register(r'cases', CaseViewSet, basename='cases')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'attachments', AttachmentViewSet, basename='attachments')

urlpatterns = [
    path('', include(router.urls)),
]
