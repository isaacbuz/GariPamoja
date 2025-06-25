from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='user-logout'),
    path('auth/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('profile/kyc/', views.KYCVerificationView.as_view(), name='kyc-verification'),
    path('profile/kyc/status/', views.KYCStatusView.as_view(), name='kyc-status'),
    
    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/verify/', views.UserVerificationView.as_view(), name='user-verify'),
    path('users/<int:pk>/suspend/', views.UserSuspensionView.as_view(), name='user-suspend'),
    
    # Password management
    path('auth/password/reset/', views.PasswordResetView.as_view(), name='password-reset'),
    path('auth/password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('auth/password/change/', views.PasswordChangeView.as_view(), name='password-change'),
    
    # Email verification
    path('auth/email/verify/', views.EmailVerificationView.as_view(), name='email-verify'),
    path('auth/email/resend/', views.EmailResendView.as_view(), name='email-resend'),
    
    # User statistics
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('stats/activity/', views.UserActivityView.as_view(), name='user-activity'),
] 