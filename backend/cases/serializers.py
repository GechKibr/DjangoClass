from rest_framework import serializers
from .models import Case, Comment, Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source="uploader.username", read_only=True)

    class Meta:
        model = Attachment
        fields = [
            "id",
            "case",
            "file",
            "mime_type",
            "file_hash",
            "uploader",
            "uploader_name",
            "uploaded_at",
        ]
        read_only_fields = ["uploader", "uploaded_at"]


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "case",
            "author",
            "author_name",
            "content",
            "visibility",
            "created_at",
        ]
        read_only_fields = ["author", "created_at"]


class CaseSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source="reporter.username", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)

    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = [
            "id",
            "tracking_id",
            "title",
            "description",

            "reporter",
            "reporter_name",
            "is_anonymous",

            "status",
            "severity",
            "location",

            "assigned_to",
            "assigned_to_name",

            "created_at",
            "updated_at",

            "comments",
            "attachments",
        ]

        read_only_fields = [
            "tracking_id",
            "created_at",
            "updated_at",
        ]
