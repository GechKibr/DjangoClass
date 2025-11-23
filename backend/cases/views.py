
from rest_framework import viewsets, permissions
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

    # ----------------- UTIL: make validated_data JSON-safe ---------------- #
    def _make_json_safe(self, data):
        safe = {}
        for key, value in data.items():

            # Model instance (User, Case, etc.)
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
        qs = Case.objects.filter(is_deleted=False).order_by("-created_at")

        user = self.request.user
        params = self.request.query_params

        # Filter: status
        if params.get("status"):
            qs = qs.filter(status=params["status"])

        # Filter: severity
        if params.get("severity"):
            qs = qs.filter(severity=params["severity"])

        # Show only cases assigned to current user
        if params.get("assigned_to") == "me":
            qs = qs.filter(assigned_to=user)

        # Hide anonymous cases from non-reporters
        qs = qs.exclude(Q(is_anonymous=True) & ~Q(reporter=user))

        return qs

    # ---------------------------- CREATE ---------------------------- #
    def perform_create(self, serializer):
        case = serializer.save(reporter=self.request.user)
        AuditLog.log(
            self.request.user,
            "case_created",
            case=case,
            details=self._make_json_safe(serializer.validated_data)
        )

    # ---------------------------- UPDATE ---------------------------- #
    def perform_update(self, serializer):
        old_status = serializer.instance.status
        case = serializer.save()

        # Log status change
        if case.status != old_status:
            AuditLog.log(
                self.request.user,
                "status_changed",
                case=case,
                details={"old": old_status, "new": case.status}
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
            details={"id": instance.id}
        )

    # ---------------------------- ACTIONS ---------------------------- #

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        case = self.get_object()
        assigned_to_id = request.data.get("assigned_to")

        if not assigned_to_id:
            return Response({"error": "assigned_to field required"}, status=400)

        case.assigned_to_id = assigned_to_id
        case.save()

        AuditLog.log(
            request.user,
            "case_assigned",
            case=case,
            details={"assigned_to": assigned_to_id}
        )

        return Response({"message": "Case assigned successfully"}, status=200)

    @action(detail=True, methods=["post"])
    def change_status(self, request, pk=None):
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

        return Response({"message": "Status updated successfully"}, status=200)


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

        # Hide private comments
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
            details={"comment_id": comment.id}
        )


# ---------------------------------------------------------------------- #
#                              ATTACHMENTS                               #
# ---------------------------------------------------------------------- #

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
