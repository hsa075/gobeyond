import json
import secrets
from datetime import date
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import Property, TourPackage, StayBooking, TourBooking, Inquiry, Parcel


def error(message, status=400):
    return JsonResponse({'error': message}, status=status)


def body_data(request):
    try:
        data = json.loads(request.body or b'{}')
        if not isinstance(data, dict):
            raise ValueError
        return data
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        raise ValueError('Request body must be valid JSON.')


def required_text(data, key, label, max_length):
    value = str(data.get(key, '')).strip()
    if not value:
        raise ValueError(f'{label} is required.')
    if len(value) > max_length:
        raise ValueError(f'{label} must be {max_length} characters or fewer.')
    return value


def positive_int(data, key, label, maximum):
    try:
        value = int(data.get(key))
    except (TypeError, ValueError):
        raise ValueError(f'{label} must be a whole number.')
    if value < 1 or value > maximum:
        raise ValueError(f'{label} must be between 1 and {maximum}.')
    return value


def valid_email(value):
    try:
        validate_email(value)
    except ValidationError:
        raise ValueError('Enter a valid email address.')
    return value


def valid_date(data, key, label):
    try:
        return date.fromisoformat(required_text(data, key, label, 10))
    except ValueError as exc:
        if 'required' in str(exc) or 'characters' in str(exc):
            raise
        raise ValueError(f'{label} must use YYYY-MM-DD format.')


def make_reference(prefix):
    return f'{prefix}-{secrets.token_hex(4).upper()}'


@require_GET
def health(request):
    return JsonResponse({'status': 'ok', 'service': 'Kenchain Groups API'})


@require_GET
def properties(request):
    results = [{
        'id': item.id,
        'name': item.name,
        'location': item.location,
        'description': item.description,
        'nightly_rate': float(item.nightly_rate),
        'amenities': item.amenities,
    } for item in Property.objects.filter(is_active=True)]
    return JsonResponse({'results': results})


@csrf_exempt
@require_POST
def stay_bookings(request):
    try:
        data = body_data(request)
        try:
            prop = Property.objects.get(pk=positive_int(data, 'property_id', 'Accommodation', 2_147_483_647), is_active=True)
        except Property.DoesNotExist:
            return error('The selected accommodation is not available.', 404)
        check_in = valid_date(data, 'check_in', 'Check-in date')
        check_out = valid_date(data, 'check_out', 'Check-out date')
        if check_in < timezone.localdate():
            raise ValueError('Check-in date cannot be in the past.')
        if check_out <= check_in:
            raise ValueError('Check-out date must be after check-in date.')
        full_name = required_text(data, 'full_name', 'Full name', 100)
        contact = required_text(data, 'contact', 'Phone number', 150)
        email = valid_email(required_text(data, 'email', 'Email address', 254))
        guests = positive_int(data, 'guests', 'Guests', 40)
        rooms = positive_int(data, 'rooms_requested', 'Rooms', 10)
        special = str(data.get('special_requests', '')).strip()[:1000]
        reference = make_reference('HSP')
        while StayBooking.objects.filter(reference=reference).exists():
            reference = make_reference('HSP')
        booking = StayBooking.objects.create(reference=reference, property=prop, check_in=check_in,
            check_out=check_out, guests=guests, rooms_requested=rooms, full_name=full_name,
            contact=contact, email=email, special_requests=special)
        return JsonResponse({'reference': booking.reference, 'message': 'Your stay request has been received. Our team will contact you to confirm availability.'}, status=201)
    except ValueError as exc:
        return error(str(exc))


@require_GET
def tour_packages(request):
    results = [{
        'id': item.id,
        'title': item.title,
        'destination': item.destination,
        'description': item.description,
        'category': item.category,
        'duration_days': item.duration_days,
        'price_per_person': float(item.price_per_person),
        'inclusions': item.inclusions,
    } for item in TourPackage.objects.filter(is_active=True)]
    return JsonResponse({'results': results})


@csrf_exempt
@require_POST
def tour_bookings(request):
    try:
        data = body_data(request)
        try:
            package = TourPackage.objects.get(pk=positive_int(data, 'package_id', 'Tour package', 2_147_483_647), is_active=True)
        except TourPackage.DoesNotExist:
            return error('The selected tour package is not available.', 404)
        travel_date = valid_date(data, 'travel_date', 'Departure date')
        if travel_date < timezone.localdate():
            raise ValueError('Departure date cannot be in the past.')
        full_name = required_text(data, 'full_name', 'Full name', 100)
        contact = required_text(data, 'contact', 'Phone number', 150)
        email = valid_email(required_text(data, 'email', 'Email address', 254))
        travelers = positive_int(data, 'travelers', 'Travellers', 100)
        special = str(data.get('special_requests', '')).strip()[:1000]
        reference = make_reference('TRV')
        while TourBooking.objects.filter(reference=reference).exists():
            reference = make_reference('TRV')
        booking = TourBooking.objects.create(reference=reference, package=package, travel_date=travel_date,
            travelers=travelers, full_name=full_name, contact=contact, email=email, special_requests=special)
        return JsonResponse({'reference': booking.reference, 'message': 'Your trip request has been received. Our travel team will contact you to confirm the itinerary.'}, status=201)
    except ValueError as exc:
        return error(str(exc))


@require_GET
def booking_status(request, reference):
    ref = reference.upper()
    stay = StayBooking.objects.select_related('property').filter(reference=ref).first()
    if stay:
        return JsonResponse({'type': 'Accommodation request', 'status': stay.status, 'reference': stay.reference,
            'item': stay.property.name, 'date': stay.check_in.strftime('%d %b %Y'),
            'submitted': timezone.localtime(stay.created_at).strftime('%d %b %Y')})
    tour = TourBooking.objects.select_related('package').filter(reference=ref).first()
    if tour:
        return JsonResponse({'type': 'Tour request', 'status': tour.status, 'reference': tour.reference,
            'item': tour.package.title, 'date': tour.travel_date.strftime('%d %b %Y'),
            'submitted': timezone.localtime(tour.created_at).strftime('%d %b %Y')})
    return error('No booking was found for that reference. Check the reference and try again.', 404)


@csrf_exempt
@require_POST
def inquiries(request):
    try:
        data = body_data(request)
        name = required_text(data, 'name', 'Name', 100)
        contact = required_text(data, 'contact', 'Phone or email', 150)
        service = str(data.get('service', 'general')).strip()[:50] or 'general'
        message = str(data.get('message', '')).strip()[:2000]
        enquiry = Inquiry.objects.create(name=name, contact=contact, service=service, message=message)
        return JsonResponse({'id': enquiry.id, 'name': enquiry.name, 'message': 'Enquiry saved.'}, status=201)
    except ValueError as exc:
        return error(str(exc))


@require_GET
def track_parcel(request, tracking_number):
    parcel = Parcel.objects.filter(tracking_number__iexact=tracking_number.strip()).first()
    if not parcel:
        return error('Tracking number not found.', 404)
    events = [{
        'location': event.location,
        'time': timezone.localtime(event.event_time).strftime('%d %b %Y, %I:%M %p'),
        'note': event.note,
    } for event in parcel.events.all()]
    return JsonResponse({'tracking_number': parcel.tracking_number, 'status': parcel.status,
        'origin': parcel.origin, 'destination': parcel.destination, 'events': events})
