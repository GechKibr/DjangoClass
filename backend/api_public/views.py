from django.shortcuts import render
from rest_framework import generics, permissions
from cases.models import Case
from .serializers import PublicCaseSerializer, PublicCaseStatusSerializer

# Create your views here.

class PublicCaseSubmitView(generics.CreateAPIView):
    """
    API view for public users to submit a corruption case.
    Returns the created case details including a tracking ID.
    """
    queryset = Case.objects.all()
    serializer_class = PublicCaseSerializer
    permission_classes = [permissions.AllowAny]


class PublicCaseTrackView(generics.RetrieveAPIView):
    """
    API view for public users to track the status of a case using its tracking ID.
    """
    queryset = Case.objects.all()
    serializer_class = PublicCaseStatusSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'tracking_id'
