import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from human_coach.models import human_coach
from django.db.models import Count

print("=" * 70)
print("CHECKING FOR DUPLICATE COACH ENTRIES")
print("=" * 70)

# Find duplicate user_ids
duplicates = human_coach.objects.values('user_id_id').annotate(
    count=Count('coach_id')
).filter(count__gt=1)

if duplicates:
    print(f"\n❌ Found {len(duplicates)} duplicate user_id entries:")
    for dup in duplicates:
        print(f"   User ID {dup['user_id_id']}: {dup['count']} coaches")
        
        # Get all coach records with this user_id
        coaches_with_id = human_coach.objects.filter(user_id_id=dup['user_id_id']).order_by('coach_id')
        
        print(f"   Keeping: Coach ID {coaches_with_id.first().coach_id}")
        
        # Delete all but the first one
        to_delete = coaches_with_id.exclude(coach_id=coaches_with_id.first().coach_id)
        deleted_count = to_delete.count()
        to_delete.delete()
        
        print(f"   ✓ Deleted {deleted_count} duplicate(s)\n")
    
    print("=" * 70)
    print("✅ DUPLICATES REMOVED!")
    print("=" * 70)
    print("\nNow run: python manage.py migrate human_coach")
else:
    print("\n✅ No duplicate user_id entries found!")
    print("=" * 70)
