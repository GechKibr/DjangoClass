from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from cases.models import Case


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = {
            "total_cases": Case.objects.count(),
            "pending": Case.objects.filter(status="pending").count(),
            "in_progress": Case.objects.filter(status="in_progress").count(),
            "resolved": Case.objects.filter(status="resolved").count(),
            "rejected": Case.objects.filter(status="rejected").count(),
            "latest_cases": list(
                Case.objects.order_by("-created_at")[:5].values(
                    "id", "title", "status", "tracking_id", "created_at"
                )
            ),
        }

        return Response(data)


class CasesPerMonthView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        queryset = (
            Case.objects
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(case_count=Count("id"))
            .order_by("month")
        )

        formatted = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "count": item["case_count"]
            }
            for item in queryset
        ]

        return Response(formatted)
