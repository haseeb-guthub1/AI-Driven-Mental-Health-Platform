"""
Script to create approved coaches for testing
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user
from human_coach.models import human_coach
from django.utils import timezone

def create_coaches():
    """Create 3 approved coaches"""
    
    coaches_data = [
        {
            'email': 'dr.sarah.mental@healthcoach.com',
            'name': 'Dr. Sarah Mitchell',
            'specialization': 'Anxiety & Depression',
            'license_id': 'MHC-2024-001'
        },
        {
            'email': 'dr.james.therapy@healthcoach.com',
            'name': 'Dr. James Wilson',
            'specialization': 'Stress Management',
            'license_id': 'MHC-2024-002'
        },
        {
            'email': 'dr.emily.wellness@healthcoach.com',
            'name': 'Dr. Emily Brown',
            'specialization': 'Emotional Well-being',
            'license_id': 'MHC-2024-003'
        }
    ]
    
    print("Creating approved coaches...\n")
    
    for coach_data in coaches_data:
        # Create user account for coach
        coach_user, created = user.objects.get_or_create(
            email=coach_data['email'],
            defaults={
                'name': coach_data['name'],
                'password': 'coachpass123',
                'role': 'coach'
            }
        )
        
        # Create or update coach profile
        coach_profile, created = human_coach.objects.get_or_create(
            user_id=coach_user,
            defaults={
                'full_name': coach_data['name'],
                'specialization': coach_data['specialization'],
                'license_id': coach_data['license_id'],
                'is_approved': True,
                'approved_at': timezone.now()
            }
        )
        
        if not created:
            # Update existing coach to be approved
            coach_profile.is_approved = True
            coach_profile.approved_at = timezone.now()
            coach_profile.full_name = coach_data['name']
            coach_profile.specialization = coach_data['specialization']
            coach_profile.license_id = coach_data['license_id']
            coach_profile.save()
            print(f"✓ Updated coach: {coach_data['name']}")
        else:
            print(f"✓ Created coach: {coach_data['name']}")
        
        print(f"  Specialization: {coach_data['specialization']}")
        print(f"  License: {coach_data['license_id']}")
        print(f"  Coach ID: {coach_profile.coach_id}\n")
    
    print("="*60)
    print(f"Total Approved Coaches: {human_coach.objects.filter(is_approved=True).count()}")
    print("="*60)

if __name__ == '__main__':
    create_coaches()
    print("\nCoaches created successfully!")
