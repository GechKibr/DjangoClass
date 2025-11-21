from rest_framework import serializers
from cases.models import Case

class PublicCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = ['title', 'description', 'location', 'severity', 'is_anonymous', 'tracking_id']
        read_only_fields = ['tracking_id']

class PublicCaseStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = ['tracking_id', 'status', 'title', 'created_at', 'updated_at']
        read_only_fields = ['tracking_id', 'status', 'title', 'created_at', 'updated_at']
