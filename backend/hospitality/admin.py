from django.contrib import admin
from .models import Property, TourPackage, StayBooking, TourBooking, Inquiry, Parcel, TrackingEvent

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'nightly_rate', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'location')

@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ('title', 'destination', 'category', 'duration_days', 'price_per_person', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('title', 'destination')

@admin.register(StayBooking)
class StayBookingAdmin(admin.ModelAdmin):
    list_display = ('reference', 'property', 'full_name', 'check_in', 'check_out', 'status', 'created_at')
    list_filter = ('status', 'check_in')
    search_fields = ('reference', 'full_name', 'email', 'contact')
    readonly_fields = ('reference', 'created_at')

@admin.register(TourBooking)
class TourBookingAdmin(admin.ModelAdmin):
    list_display = ('reference', 'package', 'full_name', 'travel_date', 'travelers', 'status', 'created_at')
    list_filter = ('status', 'travel_date')
    search_fields = ('reference', 'full_name', 'email', 'contact')
    readonly_fields = ('reference', 'created_at')

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'service', 'created_at')
    list_filter = ('service', 'created_at')
    search_fields = ('name', 'contact', 'message')
    readonly_fields = ('created_at',)

class TrackingEventInline(admin.TabularInline):
    model = TrackingEvent
    extra = 1

@admin.register(Parcel)
class ParcelAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'status', 'origin', 'destination')
    search_fields = ('tracking_number', 'origin', 'destination')
    inlines = [TrackingEventInline]
