from django.contrib import admin
from .models import Case, Attachment, Comment, AuditLog

admin.site.register(Case)
admin.site.register(Attachment)
admin.site.register(Comment)
admin.site.register(AuditLog)
