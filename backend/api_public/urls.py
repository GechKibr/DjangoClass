from django.urls import path
from .views import (
    PublicCaseListView,
    PublicCaseDetailView,
    PublicCaseCreateView,
    PublicCaseStatusView,
    PublicStatsView,
    PublicCategoryListView,
    PublicAttachmentUploadView,
)

app_name = "api_public"

urlpatterns = [
    # ----------------------------------------------------
    # Public Categories
    # ----------------------------------------------------
    path(
        'categories/',
        PublicCategoryListView.as_view(),
        name='public-category-list'
    ),

    # ----------------------------------------------------
    # Public Case Submission + Listing
    # ----------------------------------------------------
    path(
        'cases/',
        PublicCaseListView.as_view(),
        name='public-case-list'
    ),

    path(
        'cases/create/',
        PublicCaseCreateView.as_view(),
        name='public-case-create'
    ),

    # ----------------------------------------------------
    # Public Case Detail (only if marked as is_public)
    # ----------------------------------------------------
    path(
        'cases/<int:pk>/',
        PublicCaseDetailView.as_view(),
        name='public-case-detail'
    ),

    # ----------------------------------------------------
    # Track Case Status by Tracking ID
    # ----------------------------------------------------
    path(
        'cases/track/<str:tracking_id>/',
        PublicCaseStatusView.as_view(),
        name='public-case-status'
    ),

    # ----------------------------------------------------
    # Public Attachments Upload
    # ----------------------------------------------------
    path(
        'attachments/',
        PublicAttachmentUploadView.as_view(),
        name='public-attachment-upload'
    ),

    # ----------------------------------------------------
    # General Public Statistics
    # ----------------------------------------------------
    path(
        'stats/',
        PublicStatsView.as_view(),
        name='public-stats'
    ),
]
