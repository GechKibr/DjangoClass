from django.urls import path
from . import views
// there is un created class inside views.py file
urlpatterns = [
    # path('cases/', views.CaseListCreate.as_view()),
    # path('cases/<int:pk>/', views.CaseDetail.as_view()),
    # path('cases/<int:pk>/comments/', views.CaseComments.as_view()),
    path('cases/<int:pk>/attachments/', views.CaseAttachments.as_view()),
    path('cases/<int:pk>/add_comment/', views.AddComment.as_view()),
    path('cases/<int:pk>/update_status/', views.UpdateStatus.as_view()),
    path('cases/recent/', views.RecentCases.as_view()),
    path('stats/summary/', views.SystemStats.as_view()),
]
