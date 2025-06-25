from django.urls import path
from . import views

app_name = 'cars'

urlpatterns = [
    # Car listing endpoints
    path('listings/', views.CarListingView.as_view(), name='car-listing'),
    path('listings/<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
    path('listings/<int:pk>/update/', views.CarUpdateView.as_view(), name='car-update'),
    path('listings/<int:pk>/delete/', views.CarDeleteView.as_view(), name='car-delete'),
    path('listings/<int:pk>/images/', views.CarImagesView.as_view(), name='car-images'),
    
    # Car search and filtering
    path('search/', views.CarSearchView.as_view(), name='car-search'),
    path('filter/', views.CarFilterView.as_view(), name='car-filter'),
    path('nearby/', views.NearbyCarsView.as_view(), name='nearby-cars'),
    
    # Car availability
    path('listings/<int:pk>/availability/', views.CarAvailabilityView.as_view(), name='car-availability'),
    path('listings/<int:pk>/calendar/', views.CarCalendarView.as_view(), name='car-calendar'),
    
    # Car verification
    path('listings/<int:pk>/verify/', views.CarVerificationView.as_view(), name='car-verify'),
    path('listings/<int:pk>/verification-status/', views.CarVerificationStatusView.as_view(), name='car-verification-status'),
    
    # Car reviews and ratings
    path('listings/<int:pk>/reviews/', views.CarReviewsView.as_view(), name='car-reviews'),
    path('listings/<int:pk>/reviews/create/', views.CarReviewCreateView.as_view(), name='car-review-create'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # Car categories and brands
    path('categories/', views.CarCategoryView.as_view(), name='car-categories'),
    path('brands/', views.CarBrandView.as_view(), name='car-brands'),
    path('models/', views.CarModelView.as_view(), name='car-models'),
    
    # Car owner dashboard
    path('my-cars/', views.MyCarsView.as_view(), name='my-cars'),
    path('my-cars/stats/', views.MyCarsStatsView.as_view(), name='my-cars-stats'),
    path('my-cars/earnings/', views.MyCarsEarningsView.as_view(), name='my-cars-earnings'),
    
    # Car insurance and documents
    path('listings/<int:pk>/insurance/', views.CarInsuranceView.as_view(), name='car-insurance'),
    path('listings/<int:pk>/documents/', views.CarDocumentsView.as_view(), name='car-documents'),
    
    # Car maintenance and service
    path('listings/<int:pk>/maintenance/', views.CarMaintenanceView.as_view(), name='car-maintenance'),
    path('listings/<int:pk>/service-history/', views.CarServiceHistoryView.as_view(), name='car-service-history'),
] 