from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Payment processing endpoints
    path('process/', views.PaymentProcessView.as_view(), name='payment-process'),
    path('process/booking/<int:booking_id>/', views.BookingPaymentProcessView.as_view(), name='booking-payment-process'),
    path('process/subscription/', views.SubscriptionPaymentProcessView.as_view(), name='subscription-payment-process'),
    
    # Payment status and details
    path('status/<str:payment_id>/', views.PaymentStatusView.as_view(), name='payment-status'),
    path('details/<str:payment_id>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('history/', views.PaymentHistoryView.as_view(), name='payment-history'),
    
    # Payment methods management
    path('methods/', views.PaymentMethodListView.as_view(), name='payment-methods'),
    path('methods/add/', views.PaymentMethodAddView.as_view(), name='payment-method-add'),
    path('methods/<int:pk>/', views.PaymentMethodDetailView.as_view(), name='payment-method-detail'),
    path('methods/<int:pk>/update/', views.PaymentMethodUpdateView.as_view(), name='payment-method-update'),
    path('methods/<int:pk>/delete/', views.PaymentMethodDeleteView.as_view(), name='payment-method-delete'),
    path('methods/<int:pk>/set-default/', views.PaymentMethodSetDefaultView.as_view(), name='payment-method-set-default'),
    
    # Payment refunds
    path('refunds/', views.RefundListView.as_view(), name='refund-list'),
    path('refunds/create/', views.RefundCreateView.as_view(), name='refund-create'),
    path('refunds/<str:refund_id>/', views.RefundDetailView.as_view(), name='refund-detail'),
    path('refunds/<str:refund_id>/status/', views.RefundStatusView.as_view(), name='refund-status'),
    
    # Payment webhooks
    path('webhooks/mpesa/', views.MPESAWebhookView.as_view(), name='mpesa-webhook'),
    path('webhooks/paypal/', views.PayPalWebhookView.as_view(), name='paypal-webhook'),
    path('webhooks/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('webhooks/airtel-money/', views.AirtelMoneyWebhookView.as_view(), name='airtel-money-webhook'),
    
    # Payment analytics
    path('analytics/', views.PaymentAnalyticsView.as_view(), name='payment-analytics'),
    path('analytics/revenue/', views.PaymentRevenueView.as_view(), name='payment-revenue'),
    path('analytics/transactions/', views.PaymentTransactionsView.as_view(), name='payment-transactions'),
    
    # Payment settings
    path('settings/', views.PaymentSettingsView.as_view(), name='payment-settings'),
    path('settings/update/', views.PaymentSettingsUpdateView.as_view(), name='payment-settings-update'),
    
    # Payment verification
    path('verify/<str:payment_id>/', views.PaymentVerificationView.as_view(), name='payment-verify'),
    path('verify/otp/', views.PaymentOTPVerificationView.as_view(), name='payment-otp-verify'),
    
    # Payment disputes
    path('disputes/', views.PaymentDisputeListView.as_view(), name='payment-disputes'),
    path('disputes/create/', views.PaymentDisputeCreateView.as_view(), name='payment-dispute-create'),
    path('disputes/<int:pk>/', views.PaymentDisputeDetailView.as_view(), name='payment-dispute-detail'),
    path('disputes/<int:pk>/resolve/', views.PaymentDisputeResolveView.as_view(), name='payment-dispute-resolve'),
    
    # Payment export
    path('export/', views.PaymentExportView.as_view(), name='payment-export'),
    path('export/csv/', views.PaymentCSVExportView.as_view(), name='payment-csv-export'),
    path('export/pdf/', views.PaymentPDFExportView.as_view(), name='payment-pdf-export'),
] 