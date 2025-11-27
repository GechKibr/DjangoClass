from rest_framework import serializers
from cases.models import Case, Category, InvolvedParty


class PublicInvolvedPartySerializer(serializers.ModelSerializer):
    """Serializer for involved parties in public case submission"""
    class Meta:
        model = InvolvedParty
        fields = ['party_type', 'name', 'position', 'department']


class PublicCaseSerializer(serializers.ModelSerializer):
    """
    Serializer used when the public submits a new corruption case.
    This excludes any user-identifiable info and enforces safe defaults.
    """
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    involved_parties = PublicInvolvedPartySerializer(many=True, write_only=True, required=False)
    
    # Optional reporter info for non-anonymous submissions
    reporter_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    reporter_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    reporter_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Case
        fields = [
            'id',
            'title',
            'description',
            'location',
            'severity',
            'is_anonymous',
            'tracking_id',
            'created_at',
            'category_id',
            'involved_parties',
            'reporter_name',
            'reporter_email',
            'reporter_phone',
        ]
        read_only_fields = ['id', 'tracking_id', 'created_at']

    def create(self, validated_data):
        """
        Automatically marks the case as public and generates tracking_id.
        Handles involved parties creation.
        """
        involved_parties_data = validated_data.pop('involved_parties', [])
        # Remove reporter info fields as they're not in the model
        validated_data.pop('reporter_name', None)
        validated_data.pop('reporter_email', None)
        validated_data.pop('reporter_phone', None)
        
        validated_data['is_public'] = True
        case = super().create(validated_data)
        
        # Create involved parties
        for party_data in involved_parties_data:
            InvolvedParty.objects.create(case=case, **party_data)
        
        return case

    def validate_severity(self, value):
        """
        Example validation: ensure severity is within acceptable range.
        """
        if value and value not in ["low", "medium", "high", "critical"]:
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
