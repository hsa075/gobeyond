from django.contrib import admin
from django.urls import path
from hospitality import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', views.health, name='health'),
    path('api/hospitality/properties/', views.properties, name='properties'),
    path('api/hospitality/bookings/', views.stay_bookings, name='stay-bookings'),
    path('api/tours/packages/', views.tour_packages, name='tour-packages'),
    path('api/tours/bookings/', views.tour_bookings, name='tour-bookings'),
    path('api/bookings/<str:reference>/', views.booking_status, name='booking-status'),
    path('api/inquiries/', views.inquiries, name='inquiries'),
    path('api/track/<str:tracking_number>/', views.track_parcel, name='track-parcel'),
]
