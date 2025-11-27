from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count
from cases.models import Case, Category, Attachment

from .serializers import (
    PublicCaseSerializer,
    PublicCaseListSerializer,
    PublicCaseDetailSerializer,
    PublicCaseStatusSerializer
)


class PublicCaseCreateView(APIView):
    """
    Public users submit corruption cases.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PublicCaseSerializer(data=request.data)
        if serializer.is_valid():
            case = serializer.save()
            return Response(
                {
                    "message": "Case submitted successfully",
                    "id": case.id,
                    "tracking_id": str(case.tracking_id),
                    "case": PublicCaseDetailSerializer(case).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicCaseListView(APIView):
    """
    Lists all cases that are NOT deleted.
    (Public version, hides reporter)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cases = Case.objects.filter(is_deleted=False)
        serializer = PublicCaseListSerializer(cases, many=True)
        return Response(serializer.data)


class PublicCaseDetailView(APIView):
    """
    Detail view but hides reporter data.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            case = Case.objects.get(pk=pk, is_deleted=False)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)

        return Response(PublicCaseDetailSerializer(case).data)


class PublicCaseStatusView(APIView):
    """
    Track case using tracking_id.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, tracking_id):
        try:
            case = Case.objects.get(tracking_id=tracking_id)
        except Case.DoesNotExist:
            return Response({"error": "Invalid tracking ID"}, status=404)

        return Response(PublicCaseStatusSerializer(case).data)


class PublicStatsView(APIView):
    """
    Basic stats for public dashboard.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        stats = {
            "total_cases": Case.objects.filter(is_deleted=False).count(),
            "open_cases": Case.objects.filter(status="open").count(),
            "closed_cases": Case.objects.filter(status="closed").count(),
            "by_severity": Case.objects.values("severity").annotate(total=Count("severity")),
        }
        return Response(stats)


class PublicCategoryListView(APIView):
    """
    List all active categories for public case submission.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.filter(is_active=True, is_deleted=False).order_by('name')
        data = [{"id": cat.id, "name": cat.name, "description": cat.description} for cat in categories]
        return Response(data)


class PublicAttachmentUploadView(APIView):
    """
    Public users upload attachments for their cases.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        case_id = request.data.get('case')
        files = request.FILES.getlist('files')
        
        if not case_id:
            return Response({"error": "case field is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not files:
            return Response({"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            case = Case.objects.get(pk=case_id, is_deleted=False)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)
        
        attachments = []
        for file in files:
            attachment = Attachment.objects.create(
                case=case,
                uploader=None,  # Public submission has no authenticated user
                file=file,
                mime_type=file.content_type
            )
            attachments.append({
                "id": attachment.id,
                "filename": attachment.file.name,
                "mime_type": attachment.mime_type
            })
        
        return Response({
            "message": f"{len(files)} file(s) uploaded successfully",
            "attachments": attachments
        }, status=status.HTTP_201_CREATED)
