"""
Create Test Coach for Assignment
"""
import os, sys, django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.utils import timezone
from user.models import user
from human_coach.models import human_coach

# Create coach user
coach_user, created = user.objects.get_or_create(
    email='dr.sarah.johnson@mindwell.com',
    defaults={
        'name': 'Dr. Sarah Johnson',
        'password': 'Coach2026!',
        'role': 'coach'
    }
)

if created:
    print(f"✓ Created coach user: {coach_user.name}")
else:
    print(f"✓ Coach user exists: {coach_user.name}")

# Create coach profile
coach_profile, created = human_coach.objects.get_or_create(
    user_id=coach_user,
    defaults={
        'full_name': 'Dr. Sarah Johnson',
        'specialization': 'Anxiety, Depression & Trauma',
        'license_id': 'PSY-2026-12345',
        'is_approved': True,
        'approved_at': timezone.now()
    }
)

if created:
    print(f"✓ Created coach profile (ID: {coach_profile.coach_id})")
else:
    print(f"✓ Coach profile exists (ID: {coach_profile.coach_id})")

print(f"\n📧 Coach Email: dr.sarah.johnson@mindwell.com")
print(f"🔑 Password: Coach2026!\n")
