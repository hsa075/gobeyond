from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from hospitality.models import Property, TourPackage, Parcel, TrackingEvent

class Command(BaseCommand):
    help = 'Create sample accommodations, tour packages and a demo parcel for first-run testing.'

    def handle(self, *args, **options):
        properties = [
            {'name': 'Misty Hills Retreat', 'location': 'Madikeri, Coorg, Karnataka', 'description': 'A peaceful hill escape surrounded by coffee estates and rolling green landscapes.', 'nightly_rate': 4200, 'amenities': ['Breakfast', 'Wi-Fi', 'Garden', 'Parking']},
            {'name': 'The Lakehouse', 'location': 'Udupi, Karnataka', 'description': 'A relaxed coastal stay with easy access to beaches, temples and local seafood.', 'nightly_rate': 3600, 'amenities': ['Sea access', 'Wi-Fi', 'Restaurant', 'Parking']},
            {'name': 'Hampi Heritage Stay', 'location': 'Hampi, Karnataka', 'description': 'A welcoming base for exploring the remarkable ruins and landscapes of Hampi.', 'nightly_rate': 2900, 'amenities': ['Breakfast', 'Local guides', 'Wi-Fi', 'Parking']},
        ]
        for item in properties:
            Property.objects.update_or_create(name=item['name'], defaults=item)

        packages = [
            {'title': 'Coorg Coffee Trail', 'destination': 'Madikeri & Kushalnagar, Karnataka', 'description': 'Explore coffee estates, waterfalls and the misty viewpoints of Coorg.', 'category': 'Weekend getaway', 'duration_days': 3, 'price_per_person': 8499, 'inclusions': ['Stay', 'Breakfast', 'Estate walk', 'Local transfers']},
            {'title': 'Hampi Heritage Explorer', 'destination': 'Hampi, Karnataka', 'description': 'Discover the grand temples, boulder-strewn landscapes and stories of the Vijayanagara Empire.', 'category': 'Culture & heritage', 'duration_days': 2, 'price_per_person': 5999, 'inclusions': ['Stay', 'Breakfast', 'Local guide', 'Sightseeing']},
            {'title': 'Gokarna Coastal Escape', 'destination': 'Gokarna, Karnataka', 'description': 'Unwind on scenic beaches and explore the quiet coastal trails around Gokarna.', 'category': 'Beach holiday', 'duration_days': 3, 'price_per_person': 7299, 'inclusions': ['Stay', 'Breakfast', 'Beach trail', 'Local transfers']},
        ]
        for item in packages:
            TourPackage.objects.update_or_create(title=item['title'], defaults=item)

        parcel, created = Parcel.objects.get_or_create(
            tracking_number='KC1234567890',
            defaults={'status': 'In transit', 'origin': 'Bengaluru, Karnataka', 'destination': 'Mysuru, Karnataka'},
        )
        if created or not parcel.events.exists():
            now = timezone.now()
            TrackingEvent.objects.get_or_create(parcel=parcel, location='Mysuru delivery hub', defaults={'note': 'Parcel is moving to the destination facility.', 'event_time': now})
            TrackingEvent.objects.get_or_create(parcel=parcel, location='Bengaluru sorting centre', defaults={'note': 'Parcel processed and dispatched.', 'event_time': now - timedelta(hours=5)})
            TrackingEvent.objects.get_or_create(parcel=parcel, location='Bengaluru pickup point', defaults={'note': 'Parcel collected from sender.', 'event_time': now - timedelta(hours=9)})

        self.stdout.write(self.style.SUCCESS('Demo properties, tour packages and parcel tracking data are ready.'))
