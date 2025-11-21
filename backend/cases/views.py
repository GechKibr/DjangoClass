from rest_framework import viewsets
from .models import Case, Comment, Attachment
from .serializers import CaseSerializer, CommentSerializer, AttachmentSerializer

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all().order_by('-created_at')
    serializer_class = CaseSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all().order_by('-uploaded_at')
    serializer_class = AttachmentSerializer
