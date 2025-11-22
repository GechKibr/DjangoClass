from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    # -------------------------
    # Public Authentication
    # -------------------------
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),

    # -------------------------
    # User Profile & Account
    # -------------------------
    path('profile/', views.user_profile, name='user-profile'),
    path('profile/details/', views.user_profile_detail, name='user-profile-detail'),
    path('change-password/', views.change_password, name='change-password'),
    path('me/', views.current_user, name='current-user'),

    # -------------------------
    # Admin User Management
    # -------------------------
    path('admin/users/', views.admin_user_list, name='admin-user-list'),
    path('admin/users/<int:pk>/', views.admin_user_detail, name='admin-user-detail'),
]
