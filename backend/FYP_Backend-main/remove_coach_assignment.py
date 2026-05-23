import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from coach_client.models import coach_client

print("=" * 70)
print("REMOVING COACH ASSIGNMENTS FOR ALEX JOHNSON (Client ID: 52)")
print("=" * 70)

# Find all coach assignments for client_id 52
assignments = coach_client.objects.filter(client_id=52)

if assignments.exists():
    count = assignments.count()
    print(f"\n✓ Found {count} coach assignment(s) for client 52")
    
    for assignment in assignments:
        print(f"   - Coach ID: {assignment.coach_id.coach_id}, Status: {assignment.status}")
    
    # Delete all assignments
    assignments.delete()
    
    print(f"\n✅ Deleted {count} coach assignment(s)")
    print("\n" + "=" * 70)
    print("NOW LOGIN AS ALEX JOHNSON TO SEE THE HIGH-RISK NOTIFICATION!")
    print("=" * 70)
else:
    print("\n✓ No coach assignments found for client 52")
    print("=" * 70)
