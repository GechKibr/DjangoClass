from django.urls import path
from . import views

urlpatterns = [
    path('submit-case/', views.PublicCaseSubmitView.as_view()),
    path('track/<str:tracking_id>/', views.PublicCaseTrackView.as_view()),
]
