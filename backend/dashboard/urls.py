from django.urls import path
from .views import (
    DashboardSummaryView,
    CasesPerMonthView,
    CaseStatusCountView,
    ReporterStatsView
)

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='summary'),
    path('cases-per-month/', CasesPerMonthView.as_view(), name='cases-per-month'),
    path('status-count/', CaseStatusCountView.as_view(), name='status-count'),
    path('reporter-stats/', ReporterStatsView.as_view(), name='reporter-stats'),
]
