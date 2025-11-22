from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q

from .models import Case, Comment, Attachment, AuditLog
from .serializers import (
    CaseSerializer,
    CommentSerializer,
    AttachmentSerializer,
)


class IsAuthenticatedOrReadOnly(permissions.IsAuthenticatedOrReadOnly):
    """Allow reads by anyone, but changes only by authenticated users."""
    pass


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Case.objects.filter(is_deleted=False).order_by("-created_at")

        user = self.request.user
        params = self.request.query_params

        # Filter by status
        status_param = params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        # Filter by severity
        severity_param = params.get("severity")
        if severity_param:
            qs = qs.filter(severity=severity_param)

        # Show only cases assigned to current user
        if params.get("assigned_to") == "me":
            qs = qs.filter(assigned_to=user)

        # Prevent showing details of anonymous cases to other users
        qs = qs.exclude(Q(is_anonymous=True) & ~Q(reporter=user))

        return qs

    def perform_create(self, serializer):
        case = serializer.save()
        AuditLog.log(self.request.user, "case_created", case=case, details=serializer.validated_data)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        case = serializer.save()

        # Log status changes only
        if case.status != old_status:
            AuditLog.log(
                self.request.user,
                "status_changed",
                case=case,
                details={"old": old_status, "new": case.status}
            )

        AuditLog.log(self.request.user, "case_updated", case=case)

    def perform_destroy(self, instance):
        instance.delete()  # Soft delete
        AuditLog.log(self.request.user, "case_deleted", case=instance)

    # -------- Custom Actions -------- #

    # /api/cases/<id>/assign/
    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        case = self.get_object()
        user = request.user

        assigned_to_id = request.data.get("assigned_to")
        if not assigned_to_id:
            return Response({"error": "assigned_to field required"}, status=400)

        case.assign_to_id = assigned_to_id
        case.assign_to(request.user)  # Uses helper method

        return Response({"message": "Case assigned successfully"}, status=200)

    # /api/cases/<id>/change-status/
    @action(detail=True, methods=["post"])
    def change_status(self, request, pk=None):
        case = self.get_object()
        new_status = request.data.get("status")

        if new_status not in dict(Case.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=400)

        case.update_status(request.user, new_status)
        return Response({"message": "Status updated successfully"}, status=200)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Comment.objects.select_related("author", "case").order_by("-created_at")
        case_id = self.request.query_params.get("case")

        if case_id:
            qs = qs.filter(case_id=case_id)

        # Only show private comments to their authors or staff
        if not self.request.user.is_staff:
            qs = qs.exclude(
                Q(visibility="private") & ~Q(author=self.request.user)
            )

        return qs

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        AuditLog.log(self.request.user, "comment_created", case=comment.case)


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Attachment.objects.select_related("case").order_by("-uploaded_at")

        case_id = self.request.query_params.get("case")
        if case_id:
            qs = qs.filter(case_id=case_id)

        return qs

    def perform_create(self, serializer):
        attachment = serializer.save(uploader=self.request.user)
        AuditLog.log(
            self.request.user,
            "attachment_uploaded",
            case=attachment.case,
            details={"file": attachment.file.name}
        )
