from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from cases.models import Case
from django.db.models import Count
from django.db.models.functions import TruncMonth

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_cases = Case.objects.count()
        open_cases = Case.objects.filter(status="open").count()
        closed_cases = Case.objects.filter(status="closed").count()

        return Response({
            "total_cases": total_cases,
            "open_cases": open_cases,
            "closed_cases": closed_cases
        })
        

class CasesPerMonthView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = (
            Case.objects
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Count("id"))
            .order_by("month")
        )

        return Response(data)


class CaseStatusCountView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = (
            Case.objects
            .values("status")
            .annotate(total=Count("id"))
        )
        return Response(data)


class ReporterStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = (
            Case.objects
            .values("reporter__username")
            .annotate(total_cases=Count("id"))
            .order_by("-total_cases")
        )

        return Response(data)
