from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    # Booking management endpoints
    path('create/', views.BookingCreateView.as_view(), name='booking-create'),
    path('list/', views.BookingListView.as_view(), name='booking-list'),
    path('detail/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('update/<int:pk>/', views.BookingUpdateView.as_view(), name='booking-update'),
    path('cancel/<int:pk>/', views.BookingCancelView.as_view(), name='booking-cancel'),
    
    # Booking status management
    path('status/<int:pk>/', views.BookingStatusView.as_view(), name='booking-status'),
    path('confirm/<int:pk>/', views.BookingConfirmView.as_view(), name='booking-confirm'),
    path('reject/<int:pk>/', views.BookingRejectView.as_view(), name='booking-reject'),
    path('complete/<int:pk>/', views.BookingCompleteView.as_view(), name='booking-complete'),
    
    # Booking history
    path('history/', views.BookingHistoryView.as_view(), name='booking-history'),
    path('history/active/', views.ActiveBookingsView.as_view(), name='active-bookings'),
    path('history/completed/', views.CompletedBookingsView.as_view(), name='completed-bookings'),
    path('history/cancelled/', views.CancelledBookingsView.as_view(), name='cancelled-bookings'),
    
    # Booking calendar and availability
    path('calendar/', views.BookingCalendarView.as_view(), name='booking-calendar'),
    path('availability/', views.BookingAvailabilityView.as_view(), name='booking-availability'),
    
    # Booking payments
    path('payments/<int:pk>/', views.BookingPaymentView.as_view(), name='booking-payment'),
    path('payments/<int:pk>/process/', views.BookingPaymentProcessView.as_view(), name='booking-payment-process'),
    path('payments/<int:pk>/status/', views.BookingPaymentStatusView.as_view(), name='booking-payment-status'),
    
    # Booking disputes and support
    path('disputes/<int:pk>/', views.BookingDisputeView.as_view(), name='booking-dispute'),
    path('disputes/<int:pk>/create/', views.BookingDisputeCreateView.as_view(), name='booking-dispute-create'),
    path('disputes/<int:pk>/resolve/', views.BookingDisputeResolveView.as_view(), name='booking-dispute-resolve'),
    path('support/<int:pk>/', views.BookingSupportView.as_view(), name='booking-support'),
    
    # Booking ratings and reviews
    path('reviews/<int:pk>/', views.BookingReviewView.as_view(), name='booking-review'),
    path('reviews/<int:pk>/create/', views.BookingReviewCreateView.as_view(), name='booking-review-create'),
    path('reviews/<int:pk>/update/', views.BookingReviewUpdateView.as_view(), name='booking-review-update'),
    
    # Booking notifications
    path('notifications/', views.BookingNotificationView.as_view(), name='booking-notifications'),
    path('notifications/mark-read/', views.BookingNotificationMarkReadView.as_view(), name='booking-notifications-mark-read'),
    
    # Booking statistics
    path('stats/', views.BookingStatsView.as_view(), name='booking-stats'),
    path('stats/revenue/', views.BookingRevenueView.as_view(), name='booking-revenue'),
    path('stats/analytics/', views.BookingAnalyticsView.as_view(), name='booking-analytics'),
    
    # Booking export
    path('export/', views.BookingExportView.as_view(), name='booking-export'),
    path('export/csv/', views.BookingCSVExportView.as_view(), name='booking-csv-export'),
    path('export/pdf/', views.BookingPDFExportView.as_view(), name='booking-pdf-export'),
] 