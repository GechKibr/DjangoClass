from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.DashboardSummaryView.as_view()),
    path('cases-per-month/', views.CasesPerMonthView.as_view()),
]
