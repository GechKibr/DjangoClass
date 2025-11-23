from rest_framework import serializers
from cases.models import Case


class PublicCaseSerializer(serializers.ModelSerializer):
    """
    Serializer used when the public submits a new corruption case.
    This excludes any user-identifiable info and enforces safe defaults.
    """

    class Meta:
        model = Case
        fields = [
            'title',
            'description',
            'location',
            'severity',
            'is_anonymous',
            'tracking_id',
            'created_at',
        ]
    read_only_fields = ['tracking_id', 'created_at']

    def create(self, validated_data):
        """
        Automatically marks the case as public and generates tracking_id.
        """
        validated_data['is_public'] = True
        return super().create(validated_data)

    def validate_severity(self, value):
        """
        Example validation: ensure severity is within acceptable range.
        """
        if value not in ["low", "medium", "high", "critical"]:
            raise serializers.ValidationError("Invalid severity level.")
        return value


class PublicCaseListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for publicly visible case listings.
    Does NOT include reporter details or sensitive data.
    """
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id',
            'tracking_id',
            'title',
            'short_description',
            'location',
            'severity',
            'status',
            'created_at',
        ]
        read_only_fields = fields

    def get_short_description(self, obj):
        """
        Generate a 100-char preview of the case description.
        """
        return obj.description[:100] + "..." if len(obj.description) > 100 else obj.description


class PublicCaseDetailSerializer(serializers.ModelSerializer):
    """
    Detailed public view of a single case.
    Ensures NO private reporter information is exposed.
    """

    class Meta:
        model = Case
        fields = [
            'tracking_id',
            'title',
            'description',
            'location',
            'severity',
            'status',
            'is_anonymous',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class PublicCaseStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for tracking a case by its tracking_id.
    Used by anonymous users to check updates.
    """

    class Meta:
        model = Case
        fields = [
            'tracking_id',
            'status',
            'title',
            'description',
            'severity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields
