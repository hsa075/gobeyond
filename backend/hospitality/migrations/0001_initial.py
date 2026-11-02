from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(name='Property', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('name', models.CharField(max_length=160)), ('location', models.CharField(max_length=180)),
            ('description', models.TextField()), ('nightly_rate', models.DecimalField(decimal_places=2, max_digits=10)),
            ('amenities', models.JSONField(blank=True, default=list)), ('is_active', models.BooleanField(default=True)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
        ], options={'ordering': ['name']}),
        migrations.CreateModel(name='TourPackage', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('title', models.CharField(max_length=180)), ('destination', models.CharField(max_length=180)),
            ('description', models.TextField()), ('category', models.CharField(default='Domestic', max_length=80)),
            ('duration_days', models.PositiveSmallIntegerField(default=1)),
            ('price_per_person', models.DecimalField(decimal_places=2, max_digits=10)),
            ('inclusions', models.JSONField(blank=True, default=list)), ('is_active', models.BooleanField(default=True)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
        ], options={'ordering': ['title']}),
        migrations.CreateModel(name='Inquiry', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('name', models.CharField(max_length=100)), ('contact', models.CharField(max_length=150)),
            ('service', models.CharField(default='general', max_length=50)), ('message', models.CharField(blank=True, max_length=2000)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
        ], options={'ordering': ['-created_at']}),
        migrations.CreateModel(name='Parcel', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('tracking_number', models.CharField(max_length=24, unique=True)), ('status', models.CharField(default='In transit', max_length=40)),
            ('origin', models.CharField(max_length=160)), ('destination', models.CharField(max_length=160)),
        ]),
        migrations.CreateModel(name='StayBooking', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('reference', models.CharField(db_index=True, max_length=16, unique=True)), ('check_in', models.DateField()),
            ('check_out', models.DateField()), ('guests', models.PositiveSmallIntegerField()),
            ('rooms_requested', models.PositiveSmallIntegerField()), ('full_name', models.CharField(max_length=100)),
            ('contact', models.CharField(max_length=150)), ('email', models.EmailField(max_length=254)),
            ('special_requests', models.CharField(blank=True, max_length=1000)), ('status', models.CharField(default='Pending', max_length=30)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
            ('property', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='bookings', to='hospitality.property')),
        ], options={'ordering': ['-created_at']}),
        migrations.CreateModel(name='TourBooking', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('reference', models.CharField(db_index=True, max_length=16, unique=True)), ('travel_date', models.DateField()),
            ('travelers', models.PositiveSmallIntegerField()), ('full_name', models.CharField(max_length=100)),
            ('contact', models.CharField(max_length=150)), ('email', models.EmailField(max_length=254)),
            ('special_requests', models.CharField(blank=True, max_length=1000)), ('status', models.CharField(default='Pending', max_length=30)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
            ('package', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='bookings', to='hospitality.tourpackage')),
        ], options={'ordering': ['-created_at']}),
        migrations.CreateModel(name='TrackingEvent', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('location', models.CharField(max_length=180)), ('note', models.CharField(blank=True, max_length=240)),
            ('event_time', models.DateTimeField()),
            ('parcel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='hospitality.parcel')),
        ], options={'ordering': ['-event_time']}),
    ]
