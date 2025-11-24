from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Case, Comment, Attachment, AuditLog, Category,InvolvedParty
from .serializers import (
    CaseSerializer,
    CommentSerializer,
    AttachmentSerializer,
    CategorySerializer,
    InvolvedPartySerializer,
)


class IsAuthenticatedOrReadOnly(permissions.IsAuthenticatedOrReadOnly):
    """Allow reads by anyone, but changes only by authenticated users."""
    pass


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Category management for corruption cases
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return active categories ordered by name"""
        return Category.objects.filter(is_active=True).order_by('name')
    
    def perform_destroy(self, instance):
        """Soft delete category instead of actual deletion"""
        instance.is_active = False
        instance.save()
        
        AuditLog.log(
            self.request.user,
            "category_deleted",
            details={"category_id": instance.id, "category_name": instance.name}
        )


class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API for categories (read-only)
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Return active categories for public access"""
        return Category.objects.filter(is_active=True).order_by('name')


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # ----------------- UTIL: make validated_data JSON-safe ---------------- #
    def _make_json_safe(self, data):
        safe = {}
        for key, value in data.items():

            # Model instance (User, Case, Category, etc.)
            if hasattr(value, "pk"):
                safe[key] = value.pk

            # QuerySet → list of ids
            elif hasattr(value, "all"):
                safe[key] = list(value.values_list("id", flat=True))

            else:
                safe[key] = value

        return safe

    # ------------------------------ QUERYSET ------------------------------ #
    def get_queryset(self):
        qs = Case.objects.filter(is_deleted=False).select_related(
            'reporter', 'assigned_to', 'category'
        ).prefetch_related(
            'attachments', 'comments'
        ).order_by("-created_at")

        user = self.request.user
        params = self.request.query_params

        # Filter: status
        if params.get("status"):
            qs = qs.filter(status=params["status"])

        # Filter: severity
        if params.get("severity"):
            qs = qs.filter(severity=params["severity"])

        # Filter: category
        if params.get("category"):
            qs = qs.filter(category_id=params["category"])

        # Filter: location
        if params.get("location"):
            qs = qs.filter(location__icontains=params["location"])

        # Show only cases assigned to current user
        if params.get("assigned_to") == "me":
            qs = qs.filter(assigned_to=user)

        # Show only cases reported by current user
        if params.get("reported_by") == "me":
            qs = qs.filter(reporter=user)

        # Search in title and description
        if params.get("search"):
            search_term = params["search"]
            qs = qs.filter(
                Q(title__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(location__icontains=search_term)
            )

        # Hide anonymous cases from non-reporters and non-staff
        if not user.is_staff:
            qs = qs.exclude(Q(is_anonymous=True) & ~Q(reporter=user))

        return qs

    # ---------------------------- CREATE ---------------------------- #
    def create(self, request, *args, **kwargs):
        """Handle case creation with file uploads"""
        # Handle file uploads separately
        files = request.FILES.getlist('evidence_files')
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        case = serializer.save(reporter=request.user)
        
        # Create attachments for uploaded files
        for file in files:
            Attachment.objects.create(
                case=case,
                uploader=request.user,
                file=file,
                mime_type=file.content_type
            )

        AuditLog.log(
            request.user,
            "case_created",
            case=case,
            details=self._make_json_safe(serializer.validated_data)
        )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """Default create behavior - overridden by create method above"""
        case = serializer.save(reporter=self.request.user)

    # ---------------------------- UPDATE ---------------------------- #
    def perform_update(self, serializer):
        old_status = serializer.instance.status
        old_assigned_to = serializer.instance.assigned_to
        case = serializer.save()

        # Log status change
        if case.status != old_status:
            AuditLog.log(
                self.request.user,
                "status_changed",
                case=case,
                details={"old": old_status, "new": case.status}
            )

        # Log assignment change
        if case.assigned_to != old_assigned_to:
            AuditLog.log(
                self.request.user,
                "case_assigned",
                case=case,
                details={
                    "old_assigned_to": old_assigned_to.id if old_assigned_to else None,
                    "new_assigned_to": case.assigned_to.id if case.assigned_to else None
                }
            )

        AuditLog.log(
            self.request.user,
            "case_updated",
            case=case,
            details=self._make_json_safe(serializer.validated_data)
        )

    # ---------------------------- DELETE ---------------------------- #
    def perform_destroy(self, instance):
        instance.delete()  # soft delete
        AuditLog.log(
            self.request.user,
            "case_deleted",
            case=instance,
            details={"id": instance.id, "title": instance.title}
        )

    # ---------------------------- CUSTOM ACTIONS ---------------------------- #

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        """Assign case to specific officer"""
        case = self.get_object()
        assigned_to_id = request.data.get("assigned_to")

        if not assigned_to_id:
            return Response({"error": "assigned_to field required"}, status=400)

        old_assigned_to = case.assigned_to
        case.assigned_to_id = assigned_to_id
        case.status = "investigation"
        case.save()

        AuditLog.log(
            request.user,
            "case_assigned",
            case=case,
            details={
                "old_assigned_to": old_assigned_to.id if old_assigned_to else None,
                "new_assigned_to": assigned_to_id
            }
        )

        return Response({
            "message": "Case assigned successfully",
            "assigned_to": assigned_to_id,
            "status": case.status
        }, status=200)

    @action(detail=True, methods=["post"])
    def change_status(self, request, pk=None):
        """Change case status with validation"""
        case = self.get_object()
        new_status = request.data.get("status")

        if new_status not in dict(Case.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=400)

        old_status = case.status
        case.status = new_status
        case.save()

        AuditLog.log(
            request.user,
            "status_changed",
            case=case,
            details={"old": old_status, "new": new_status}
        )

        return Response({
            "message": "Status updated successfully",
            "old_status": old_status,
            "new_status": new_status
        }, status=200)

    @action(detail=True, methods=["post"])
    def add_attachment(self, request, pk=None):
        """Add attachment to case"""
        case = self.get_object()
        files = request.FILES.getlist('files')
        
        if not files:
            return Response({"error": "No files provided"}, status=400)

        attachments = []
        for file in files:
            attachment = Attachment.objects.create(
                case=case,
                uploader=request.user,
                file=file,
                mime_type=file.content_type
            )
            attachments.append(AttachmentSerializer(attachment).data)

        AuditLog.log(
            request.user,
            "attachments_added",
            case=case,
            details={"file_count": len(files), "files": [f.name for f in files]}
        )

        return Response({
            "message": f"{len(files)} file(s) uploaded successfully",
            "attachments": attachments
        }, status=201)

    @action(detail=True, methods=["get"])
    def timeline(self, request, pk=None):
        """Get audit timeline for a case"""
        case = self.get_object()
        audit_logs = AuditLog.objects.filter(case=case).order_by('-timestamp')
        
        timeline_data = []
        for log in audit_logs:
            timeline_data.append({
                "timestamp": log.timestamp,
                "user": log.user.username if log.user else "System",
                "action": log.action,
                "details": log.details
            })
        
        return Response({
            "case_id": case.id,
            "case_title": case.title,
            "timeline": timeline_data
        })

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get case statistics"""
        user = request.user
        qs = self.get_queryset()
        
        # Basic stats
        total_cases = qs.count()
        cases_by_status = qs.values('status').annotate(count=models.Count('id'))
        cases_by_severity = qs.values('severity').annotate(count=models.Count('id'))
        cases_by_category = qs.values('category__name').annotate(count=models.Count('id'))
        
        # User-specific stats
        my_reported_cases = qs.filter(reporter=user).count()
        my_assigned_cases = qs.filter(assigned_to=user).count()
        
        stats = {
            "total_cases": total_cases,
            "cases_by_status": list(cases_by_status),
            "cases_by_severity": list(cases_by_severity),
            "cases_by_category": list(cases_by_category),
            "my_reported_cases": my_reported_cases,
            "my_assigned_cases": my_assigned_cases,
        }
        
        return Response(stats)

    @action(detail=False, methods=["get"])
    def public_cases(self, request):
        """Get public cases for display (read-only, no auth required)"""
        public_cases = Case.objects.filter(
            is_deleted=False,
            is_public=True,
            is_anonymous=False  # Don't show anonymous cases publicly
        ).select_related('category').order_by('-created_at')[:50]  # Limit for performance
        
        public_data = []
        for case in public_cases:
            public_data.append({
                "tracking_id": str(case.tracking_id),
                "title": case.title,
                "description": case.description[:200] + "..." if len(case.description) > 200 else case.description,
                "location": case.location,
                "category": case.category.name if case.category else None,
                "status": case.status,
                "severity": case.severity,
                "created_at": case.created_at,
                "updated_at": case.updated_at
            })
        
        return Response(public_data)


class InvolvedPartyViewSet(viewsets.ModelViewSet):
    serializer_class = InvolvedPartySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = InvolvedParty.objects.select_related('case').order_by('name')
        
        case_id = self.request.query_params.get('case')
        if case_id:
            qs = qs.filter(case_id=case_id)
            
        return qs

    def perform_create(self, serializer):
        party = serializer.save()
        AuditLog.log(
            self.request.user,
            "involved_party_added",
            case=party.case,
            details={
                "party_name": party.name,
                "party_type": party.party_type
            }
        )



# ---------------------------------------------------------------------- #
#                                COMMENTS                               #
# ---------------------------------------------------------------------- #

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Comment.objects.select_related("author", "case").order_by("-created_at")

        case_id = self.request.query_params.get("case")
        if case_id:
            qs = qs.filter(case_id=case_id)

        # Hide private comments from non-authors and non-staff
        if not self.request.user.is_staff:
            qs = qs.exclude(
                Q(visibility="private") & ~Q(author=self.request.user)
            )

        return qs

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        AuditLog.log(
            self.request.user,
            "comment_created",
            case=comment.case,
            details={
                "comment_id": comment.id,
                "visibility": comment.visibility,
                "content_preview": comment.content[:50] + "..." if len(comment.content) > 50 else comment.content
            }
        )

    @action(detail=True, methods=["post"])
    def change_visibility(self, request, pk=None):
        """Change comment visibility"""
        comment = self.get_object()
        
        # Only author or staff can change visibility
        if comment.author != request.user and not request.user.is_staff:
            return Response({"error": "Not authorized to change visibility"}, status=403)
        
        new_visibility = request.data.get("visibility")
        if new_visibility not in ['public', 'private']:
            return Response({"error": "Invalid visibility value"}, status=400)
        
        old_visibility = comment.visibility
        comment.visibility = new_visibility
        comment.save()

        AuditLog.log(
            request.user,
            "comment_visibility_changed",
            case=comment.case,
            details={
                "comment_id": comment.id,
                "old_visibility": old_visibility,
                "new_visibility": new_visibility
            }
        )

        return Response({
            "message": "Visibility updated successfully",
            "visibility": new_visibility
        })


# ---------------------------------------------------------------------- #
#                              ATTACHMENTS                               #
# ---------------------------------------------------------------------- #

class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Attachment.objects.select_related("case", "uploader").order_by("-uploaded_at")

        case_id = self.request.query_params.get("case")
        if case_id:
            qs = qs.filter(case_id=case_id)

        # Only show attachments for cases the user can view
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(
                Q(case__is_anonymous=False) | 
                Q(case__reporter=user) |
                Q(case__assigned_to=user)
            )

        return qs

    def perform_create(self, serializer):
        attachment = serializer.save(uploader=self.request.user)
        AuditLog.log(
            self.request.user,
            "attachment_uploaded",
            case=attachment.case,
            details={
                "file": attachment.file.name,
                "mime_type": attachment.mime_type,
                "file_size": attachment.file.size
            }
        )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Download attachment file"""
        attachment = self.get_object()
        
        # Check if user has permission to view the case
        if not attachment.case.can_view(request.user):
            return Response({"error": "Not authorized to access this file"}, status=403)
        
        # In a real implementation, you'd serve the file here
        # For now, return file info
        return Response({
            "filename": attachment.file.name,
            "mime_type": attachment.mime_type,
            "uploaded_at": attachment.uploaded_at,
            "uploader": attachment.uploader.username if attachment.uploader else "Unknown"
        })