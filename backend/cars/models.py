from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class CarBrand(models.Model):
    """Car brand/manufacturer"""
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='brand_logos/', blank=True, null=True)
    country_of_origin = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return self.name

class CarModel(models.Model):
    """Car model"""
    brand = models.ForeignKey(CarBrand, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    
    class Meta:
        unique_together = ('brand', 'name', 'year')
    
    def __str__(self):
        return f"{self.brand.name} {self.name} {self.year}"

class Car(models.Model):
    """Car listing model"""
    
    FUEL_TYPES = (
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('lpg', 'LPG'),
    )
    
    TRANSMISSION_TYPES = (
        ('manual', 'Manual'),
        ('automatic', 'Automatic'),
        ('semi_auto', 'Semi-Automatic'),
    )
    
    CAR_TYPES = (
        ('sedan', 'Sedan'),
        ('suv', 'SUV'),
        ('hatchback', 'Hatchback'),
        ('wagon', 'Wagon'),
        ('convertible', 'Convertible'),
        ('sports', 'Sports Car'),
        ('luxury', 'Luxury Car'),
        ('van', 'Van'),
        ('truck', 'Truck'),
    )
    
    CONDITION_TYPES = (
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    )
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cars')
    brand = models.ForeignKey(CarBrand, on_delete=models.CASCADE)
    model = models.ForeignKey(CarModel, on_delete=models.CASCADE)
    
    # Car details
    license_plate = models.CharField(max_length=20, unique=True)
    year = models.PositiveIntegerField()
    fuel_type = models.CharField(max_length=10, choices=FUEL_TYPES)
    transmission = models.CharField(max_length=10, choices=TRANSMISSION_TYPES)
    car_type = models.CharField(max_length=15, choices=CAR_TYPES)
    color = models.CharField(max_length=50)
    mileage = models.PositiveIntegerField(help_text='Current mileage in kilometers')
    engine_size = models.DecimalField(max_digits=4, decimal_places=1, help_text='Engine size in liters')
    seats = models.PositiveIntegerField(default=5)
    doors = models.PositiveIntegerField(default=4)
    
    # Condition and features
    condition = models.CharField(max_length=10, choices=CONDITION_TYPES, default='good')
    features = models.JSONField(default=list, help_text='List of car features')
    description = models.TextField()
    
    # Location
    city = models.CharField(max_length=100)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Pricing
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2)
    weekly_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    monthly_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    
    # Status and verification
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)
    
    # Insurance and documents
    insurance_expiry = models.DateField(blank=True, null=True)
    registration_expiry = models.DateField(blank=True, null=True)
    inspection_expiry = models.DateField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.brand.name} {self.model.name} - {self.license_plate}"
    
    @property
    def full_name(self):
        return f"{self.brand.name} {self.model.name} {self.year}"
    
    @property
    def average_rating(self):
        from bookings.models import Booking
        bookings = Booking.objects.filter(car=self, status='completed')
        if bookings.exists():
            ratings = [booking.renter_rating for booking in bookings if booking.renter_rating]
            return sum(ratings) / len(ratings) if ratings else 0
        return 0
    
    @property
    def total_bookings(self):
        from bookings.models import Booking
        return Booking.objects.filter(car=self, status='completed').count()

class CarImage(models.Model):
    """Car images"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='car_images/')
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"Image for {self.car.full_name}"

class CarAvailability(models.Model):
    """Car availability calendar"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='availability')
    date = models.DateField()
    is_available = models.BooleanField(default=True)
    price_override = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('car', 'date')
    
    def __str__(self):
        return f"{self.car.full_name} - {self.date}"

class CarFeature(models.Model):
    """Car features catalog"""
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class CarMaintenance(models.Model):
    """Car maintenance records"""
    
    MAINTENANCE_TYPES = (
        ('service', 'Regular Service'),
        ('repair', 'Repair'),
        ('inspection', 'Inspection'),
        ('cleaning', 'Cleaning'),
        ('other', 'Other'),
    )
    
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='maintenance_records')
    maintenance_type = models.CharField(max_length=15, choices=MAINTENANCE_TYPES)
    description = models.TextField()
    cost = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    date = models.DateField()
    mileage_at_service = models.PositiveIntegerField(blank=True, null=True)
    next_service_mileage = models.PositiveIntegerField(blank=True, null=True)
    next_service_date = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.car.full_name} - {self.maintenance_type} on {self.date}"
