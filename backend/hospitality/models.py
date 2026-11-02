from django.db import models

class Property(models.Model):
    name = models.CharField(max_length=160)
    location = models.CharField(max_length=180)
    description = models.TextField()
    nightly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    amenities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class TourPackage(models.Model):
    title = models.CharField(max_length=180)
    destination = models.CharField(max_length=180)
    description = models.TextField()
    category = models.CharField(max_length=80, default='Domestic')
    duration_days = models.PositiveSmallIntegerField(default=1)
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    inclusions = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

class StayBooking(models.Model):
    reference = models.CharField(max_length=16, unique=True, db_index=True)
    property = models.ForeignKey(Property, on_delete=models.PROTECT, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.PositiveSmallIntegerField()
    rooms_requested = models.PositiveSmallIntegerField()
    full_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    special_requests = models.CharField(max_length=1000, blank=True)
    status = models.CharField(max_length=30, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.reference

class TourBooking(models.Model):
    reference = models.CharField(max_length=16, unique=True, db_index=True)
    package = models.ForeignKey(TourPackage, on_delete=models.PROTECT, related_name='bookings')
    travel_date = models.DateField()
    travelers = models.PositiveSmallIntegerField()
    full_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    special_requests = models.CharField(max_length=1000, blank=True)
    status = models.CharField(max_length=30, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.reference

class Inquiry(models.Model):
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=150)
    service = models.CharField(max_length=50, default='general')
    message = models.CharField(max_length=2000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.service}'

class Parcel(models.Model):
    tracking_number = models.CharField(max_length=24, unique=True)
    status = models.CharField(max_length=40, default='In transit')
    origin = models.CharField(max_length=160)
    destination = models.CharField(max_length=160)

    def __str__(self):
        return self.tracking_number

class TrackingEvent(models.Model):
    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='events')
    location = models.CharField(max_length=180)
    note = models.CharField(max_length=240, blank=True)
    event_time = models.DateTimeField()

    class Meta:
        ordering = ['-event_time']

    def __str__(self):
        return f'{self.parcel.tracking_number} - {self.location}'
