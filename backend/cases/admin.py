from django.contrib import admin
from .models import Case, Comment, Attachment, AuditLog


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'severity', 'assigned_to', 'created_at')
    list_filter = ('status', 'severity', 'assigned_to', 'created_at')
    search_fields = ('title', 'description', 'tracking_id')
    ordering = ('-created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'case', 'author', 'visibility', 'created_at')
    list_filter = ('visibility', 'created_at')
    search_fields = ('content',)
    ordering = ('-created_at',)


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'case', 'uploader', 'file', 'uploaded_at')
    search_fields = ('file',)
    ordering = ('-uploaded_at',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'case', 'timestamp')
    search_fields = ('action', 'details')
    list_filter = ('action', 'timestamp')
    ordering = ('-timestamp',)
