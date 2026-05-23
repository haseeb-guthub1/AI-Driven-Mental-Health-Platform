"""
Create Single High-Risk Test User with 3 Months of Data
This user will require mandatory coach assignment
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.utils import timezone
from user.models import user
from client.models import client
from session_log.models import session_log
from emotion_data.models import emotion_data


print("\n" + "🎯 " * 35)
print("CREATING HIGH-RISK TEST USER")
print("🎯 " * 35 + "\n")

# User credentials
USER_EMAIL = "alex.johnson@test.com"
USER_PASSWORD = "Alex2026!"
USER_NAME = "Alex Johnson"

# Create or get user
test_user, created = user.objects.get_or_create(
    email=USER_EMAIL,
    defaults={
        'name': USER_NAME,
        'password': USER_PASSWORD,
        'role': 'client'
    }
)

if created:
    print(f"✓ Created user: {USER_NAME}")
else:
    print(f"✓ User exists: {USER_NAME}")
    test_user.password = USER_PASSWORD
    test_user.save()
    print(f"  Password updated")

# Create or get client profile
test_client, created = client.objects.get_or_create(
    user_id=test_user,
    defaults={
        'name': USER_NAME,
        'age': 27,
        'gender': 'Non-binary',
        'email': USER_EMAIL
    }
)

if created:
    print(f"✓ Created client profile (ID: {test_client.client_id})")
else:
    print(f"✓ Client profile exists (ID: {test_client.client_id})")

# Delete existing sessions for clean slate
existing_sessions = session_log.objects.filter(client_id=test_client)
if existing_sessions.exists():
    emotion_data.objects.filter(client_id=test_client).delete()
    existing_sessions.delete()
    print(f"  Cleared old session data")

# High-risk emotion patterns
HIGH_RISK_EMOTIONS = ['anxious', 'sad', 'angry', 'fearful', 'hopeless', 'stressed']

print(f"\n📊 Creating 3 months of HIGH-RISK daily sessions...")

today = timezone.now().date()
sessions_created = 0

# Create 90 days of sessions with escalating risk
for day in range(90):
    session_date = today - timedelta(days=(89 - day))
    
    # Calculate risk score - escalates over time
    # Early sessions: 50-70% (moderate to high)
    # Middle sessions: 70-85% (high)
    # Recent sessions: 85-95% (critical)
    if day < 30:
        base_risk = 55
        variance = random.randint(-5, 15)
    elif day < 60:
        base_risk = 75
        variance = random.randint(-5, 10)
    else:
        base_risk = 87
        variance = random.randint(-2, 8)
    
    risk_score = min(95, max(50, base_risk + variance))
    
    # Determine risk level from score
    if risk_score >= 85:
        risk_level = 'critical'
    elif risk_score >= 70:
        risk_level = 'high'
    elif risk_score >= 50:
        risk_level = 'moderate'
    else:
        risk_level = 'low'
    
    # Select emotion
    emotion = random.choice(HIGH_RISK_EMOTIONS)
    intensity = min(10, max(6, int(risk_score / 10)))
    
    # Create session
    session = session_log.objects.create(
        client_id=test_client,
        user_id=test_user,
        date=session_date,
        risk_level=risk_level,
        highest_risk_score=risk_score,
        final_emotion=emotion,
        emotion_intensity=intensity,
        notes=f'Daily session - {emotion} (intensity: {intensity}/10)',
        summary=f'User expressed {emotion} feelings. Risk assessment: {risk_level}.'
    )
    
    # Create emotion data
    emotion_data.objects.create(
        client_id=test_client,
        session_id=session,
        emotion=emotion,
        intensity=intensity,
        notes=f'{emotion.capitalize()} feeling - intensity {intensity}/10'
    )
    
    sessions_created += 1
    
    # Show progress every 15 days
    if day % 15 == 0 or day == 89:
        print(f"  Day {day+1:3d}/90 ({session_date}): "
              f"{emotion.upper():12s} | "
              f"Intensity: {intensity:2d}/10 | "
              f"Risk: {risk_level.upper():8s} ({risk_score:2d}%)")

print(f"\n✓ Created {sessions_created} daily sessions")

# Calculate statistics
sessions = session_log.objects.filter(client_id=test_client).order_by('-date')
latest = sessions.first()
risk_scores = [s.highest_risk_score for s in sessions if s.highest_risk_score]
avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0
high_risk_count = sum(1 for s in sessions if s.risk_level in ['high', 'critical'])

print(f"\n📈 FINAL STATISTICS:")
print(f"  Latest Risk Score: {latest.highest_risk_score}%")
print(f"  Average Risk Score: {avg_risk:.1f}%")
print(f"  High/Critical Sessions: {high_risk_count}/{sessions.count()}")
print(f"  Latest Emotion: {latest.final_emotion}")

print("\n" + "="*70)
print("🔒 MANDATORY COACHING ASSESSMENT")
print("="*70)

# Check if this meets mandatory coaching criteria
if latest.highest_risk_score > 65 and avg_risk > 60:
    print("\n✅ This user WILL trigger the mandatory coaching lock!")
    print(f"   • Current risk ({latest.highest_risk_score}%) > 65% threshold ✓")
    print(f"   • Average risk ({avg_risk:.1f}%) > 60% threshold ✓")
    print("\n   ⚠️  User must assign a coach to access dashboard")
else:
    print("\n⚠️  Warning: Risk levels may not trigger the lock")
    print(f"   • Current risk: {latest.highest_risk_score}%")
    print(f"   • Average risk: {avg_risk:.1f}%")

print("\n" + "="*70)
print("📧 LOGIN CREDENTIALS")
print("="*70)
print(f"\n   Email:    {USER_EMAIL}")
print(f"   Password: {USER_PASSWORD}")
print(f"   Client ID: {test_client.client_id}")

print("\n" + "="*70)
print("🧪 TESTING INSTRUCTIONS")
print("="*70)
print("\n1. Login at: http://localhost:5173/")
print(f"   Email: {USER_EMAIL}")
print(f"   Password: {USER_PASSWORD}")
print("\n2. You should see:")
print("   🔒 Mandatory Coach Hire Modal (cannot be dismissed)")
print("   🌫️  Blurred dashboard in background")
print("\n3. To unlock:")
print("   • Select a coach from the list")
print("   • Click 'Confirm Coach Assignment'")
print("   • Dashboard will unlock")

print("\n" + "✅ " * 35)
print("HIGH-RISK TEST USER CREATED SUCCESSFULLY!")
print("✅ " * 35 + "\n")
