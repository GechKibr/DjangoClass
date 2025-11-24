from rest_framework import serializers
from .models import Case, Comment, Attachment, Category, InvolvedParty  # Add InvolvedParty to imports


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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active']


class InvolvedPartySerializer(serializers.ModelSerializer):
    class Meta:
        model = InvolvedParty
        fields = ['id', 'party_type', 'name', 'position', 'department']


class CaseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    reporter_name = serializers.CharField(source="reporter.username", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)

    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    involved_parties = InvolvedPartySerializer(many=True, read_only=True)  # Add this line

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
            "is_public",
            "status",
            "severity",
            "location",
            "assigned_to",
            "assigned_to_name",
            "created_at",
            "updated_at",
            "comments",
            "attachments",
            'category', 
            'category_id',
            'involved_parties',  # Add this field
        ]
        read_only_fields = [
            "tracking_id",
            "created_at",
            "updated_at",
        ]