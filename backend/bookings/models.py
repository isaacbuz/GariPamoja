from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

class Booking(models.Model):
    """Car booking model"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    )
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='bookings')
    renter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rentals')
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hosted_bookings')
    
    # Booking details
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Pricing
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2)
    total_days = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    security_deposit = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status and tracking
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    confirmation_date = models.DateTimeField(blank=True, null=True)
    cancellation_date = models.DateTimeField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True)
    
    # Ratings
    host_rating = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    host_comment = models.TextField(blank=True)
    renter_rating = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    renter_comment = models.TextField(blank=True)
    
    # Insurance and safety
    insurance_coverage = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    insurance_claim = models.BooleanField(default=False)
    insurance_claim_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.id} - {self.car.full_name} by {self.renter.email}"
    
    def save(self, *args, **kwargs):
        # Calculate totals if not set
        if not self.subtotal:
            self.subtotal = self.daily_rate * self.total_days
        if not self.commission:
            self.commission = self.subtotal * Decimal('0.20')  # 20% commission
        if not self.total_amount:
            self.total_amount = self.subtotal + self.commission + self.security_deposit
        super().save(*args, **kwargs)
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def is_completed(self):
        return self.status == 'completed'
    
    @property
    def is_cancelled(self):
        return self.status == 'cancelled'
    
    @property
    def duration_hours(self):
        from django.utils import timezone
        if self.start_date and self.end_date:
            duration = self.end_date - self.start_date
            return duration.total_seconds() / 3600
        return 0

class BookingMessage(models.Model):
    """Messages between host and renter"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.email} to {self.recipient.email}"

class BookingDispute(models.Model):
    """Dispute resolution for bookings"""
    
    DISPUTE_TYPES = (
        ('damage', 'Vehicle Damage'),
        ('payment', 'Payment Issue'),
        ('service', 'Service Quality'),
        ('communication', 'Communication Issue'),
        ('other', 'Other'),
    )
    
    DISPUTE_STATUS = (
        ('open', 'Open'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='dispute')
    initiator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='initiated_disputes')
    dispute_type = models.CharField(max_length=15, choices=DISPUTE_TYPES)
    description = models.TextField()
    evidence = models.JSONField(default=list, help_text='List of evidence files/links')
    status = models.CharField(max_length=15, choices=DISPUTE_STATUS, default='open')
    resolution = models.TextField(blank=True)
    resolution_date = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dispute for booking {self.booking.id} - {self.dispute_type}"

class BookingInsurance(models.Model):
    """Insurance details for bookings"""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='insurance')
    policy_number = models.CharField(max_length=100)
    coverage_type = models.CharField(max_length=50)
    coverage_amount = models.DecimalField(max_digits=8, decimal_places=2)
    deductible = models.DecimalField(max_digits=8, decimal_places=2)
    provider = models.CharField(max_length=100)
    policy_document = models.FileField(upload_to='insurance_documents/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Insurance for booking {self.booking.id}"

class BookingChecklist(models.Model):
    """Pre and post rental checklists"""
    
    CHECKLIST_TYPES = (
        ('pre_rental', 'Pre-Rental'),
        ('post_rental', 'Post-Rental'),
    )
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='checklists')
    checklist_type = models.CharField(max_length=15, choices=CHECKLIST_TYPES)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Vehicle condition
    exterior_condition = models.TextField(blank=True)
    interior_condition = models.TextField(blank=True)
    fuel_level = models.CharField(max_length=20, blank=True)
    mileage_start = models.PositiveIntegerField(blank=True, null=True)
    mileage_end = models.PositiveIntegerField(blank=True, null=True)
    
    # Documents
    license_verified = models.BooleanField(default=False)
    insurance_verified = models.BooleanField(default=False)
    registration_verified = models.BooleanField(default=False)
    
    # Photos
    photos = models.JSONField(default=list, help_text='List of photo URLs')
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('booking', 'checklist_type')
    
    def __str__(self):
        return f"{self.checklist_type} checklist for booking {self.booking.id}"
