from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

class User(AbstractUser):
    """Custom User model for GariPamoja platform"""
    
    USER_TYPES = (
        ('host', 'Host'),
        ('renter', 'Renter'),
        ('both', 'Both'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    # Basic fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Profile information
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='renter')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Uganda')
    
    # Verification and trust
    verification_status = models.CharField(max_length=10, choices=VERIFICATION_STATUS, default='pending')
    trust_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_kyc_verified = models.BooleanField(default=False)
    kyc_document = models.FileField(upload_to='kyc_documents/', blank=True, null=True)
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict)
    
    # Financial
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    crypto_wallet_address = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    # Meta
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_verified(self):
        return self.verification_status == 'verified'
    
    @property
    def can_host(self):
        return self.user_type in ['host', 'both'] and self.is_verified
    
    @property
    def can_rent(self):
        return self.user_type in ['renter', 'both'] and self.is_verified

class UserProfile(models.Model):
    """Extended user profile for additional information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Driver information
    driver_license_number = models.CharField(max_length=50, blank=True)
    driver_license_expiry = models.DateField(blank=True, null=True)
    driving_experience_years = models.PositiveIntegerField(default=0)
    
    # Preferences
    preferred_car_types = models.JSONField(default=list)
    preferred_payment_methods = models.JSONField(default=list)
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    
    # Additional verification
    id_document = models.FileField(upload_to='id_documents/', blank=True, null=True)
    proof_of_address = models.FileField(upload_to='address_documents/', blank=True, null=True)
    
    # Social verification
    linkedin_profile = models.URLField(blank=True)
    facebook_profile = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.email}"

class UserRating(models.Model):
    """User ratings and reviews"""
    
    RATING_CHOICES = (
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_given')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_received')
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='ratings')
    
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('reviewer', 'reviewed_user', 'booking')
    
    def __str__(self):
        return f"{self.reviewer.email} rated {self.reviewed_user.email} {self.rating} stars"

class UserNotification(models.Model):
    """User notifications"""
    
    NOTIFICATION_TYPES = (
        ('booking_request', 'Booking Request'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('payment_received', 'Payment Received'),
        ('payment_failed', 'Payment Failed'),
        ('message_received', 'Message Received'),
        ('rating_received', 'Rating Received'),
        ('system_alert', 'System Alert'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict)
    
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.notification_type} for {self.user.email}"
