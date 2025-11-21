from django.urls import path
from .views import DashboardSummaryView, CasesPerMonthView

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("cases-per-month/", CasesPerMonthView.as_view(), name="cases-per-month"),
]
