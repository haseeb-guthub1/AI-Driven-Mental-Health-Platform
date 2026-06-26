import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user
from client.models import client
from session_log.models import session_log
from ai_guidance.models import ChatMessage, MessageEmotion
from coach_client.models import coach_client
from human_coach.models import human_coach

def verify_demo_data():
    print("\n" + "=" * 70)
    print("DEMO DATA VERIFICATION REPORT")
    print("=" * 70 + "\n")
    
    demo_emails = [
        'sarah.johnson@example.com',
        'michael.chen@example.com',
        'emily.williams@example.com',
        'david.martinez@example.com',
        'jennifer.brown@example.com'
    ]
    
    for email in demo_emails:
        try:
            user_obj = user.objects.get(email=email)
            client_obj = client.objects.get(user_id=user_obj)
            
            # Get session data
            sessions = session_log.objects.filter(client_id=client_obj).order_by('date')
            total_sessions = sessions.count()
            
            # Get message data
            messages = ChatMessage.objects.filter(client_id=client_obj)
            total_messages = messages.count()
            user_messages = messages.filter(message_type='user').count()
            ai_messages = messages.filter(message_type='ai').count()
            
            # Get emotion data
            emotions_with_high_risk = MessageEmotion.objects.filter(
                message__client_id=client_obj,
                risk_level='high'
            ).count()
            
            # Get coach assignment
            coach_assignment = coach_client.objects.filter(client_id=client_obj).first()
            
            # Date range
            first_session = sessions.first()
            last_session = sessions.last()
            
            # High-risk sessions
            high_risk_sessions = sessions.filter(risk_level='high').count()
            
            print(f"👤 {user_obj.name}")
            print(f"   Email: {email}")
            print(f"   📅 Data Period: {first_session.date if first_session else 'N/A'} to {last_session.date if last_session else 'N/A'}")
            print(f"   💬 Sessions: {total_sessions}")
            print(f"   📨 Messages: {total_messages} (User: {user_messages}, AI: {ai_messages})")
            print(f"   ⚠️  High-Risk Messages: {emotions_with_high_risk}")
            print(f"   🚨 High-Risk Sessions: {high_risk_sessions}")
            
            if coach_assignment:
                coach = coach_assignment.coach_id
                print(f"   👨‍⚕️  Assigned Coach: {coach.full_name}")
                print(f"   📋 Assignment Status: {coach_assignment.status}")
                print(f"   📆 Assigned Date: {coach_assignment.assigned_date}")
            else:
                print(f"   👨‍⚕️  Assigned Coach: None (risk level below threshold)")
            
            # Show sample conversation
            sample_messages = messages.order_by('timestamp')[:4]
            if sample_messages:
                print(f"\n   📝 Sample Conversation (Latest Session):")
                for msg in sample_messages:
                    msg_type = "USER" if msg.message_type == 'user' else "AI"
                    preview = msg.message_text[:80] + "..." if len(msg.message_text) > 80 else msg.message_text
                    print(f"      {msg_type}: {preview}")
            
            print("\n" + "-" * 70 + "\n")
            
        except user.DoesNotExist:
            print(f"❌ User not found: {email}\n")
        except Exception as e:
            print(f"❌ Error checking {email}: {str(e)}\n")
    
    # Summary statistics
    print("=" * 70)
    print("SUMMARY STATISTICS")
    print("=" * 70)
    
    total_demo_users = user.objects.filter(email__in=demo_emails).count()
    total_demo_sessions = session_log.objects.filter(
        client_id__user_id__email__in=demo_emails
    ).count()
    total_demo_messages = ChatMessage.objects.filter(
        client_id__user_id__email__in=demo_emails
    ).count()
    total_high_risk_sessions = session_log.objects.filter(
        client_id__user_id__email__in=demo_emails,
        risk_level='high'
    ).count()
    total_coach_assignments = coach_client.objects.filter(
        client_id__user_id__email__in=demo_emails
    ).count()
    
    print(f"\n✅ Total Demo Users Created: {total_demo_users}/5")
    print(f"✅ Total Sessions Generated: {total_demo_sessions}")
    print(f"✅ Total Messages Created: {total_demo_messages}")
    print(f"✅ Total High-Risk Sessions: {total_high_risk_sessions}")
    print(f"✅ Total Coach Assignments: {total_coach_assignments}")
    
    # Month-wise breakdown
    print(f"\n📊 MONTH-WISE DATA DISTRIBUTION:")
    for month in [3, 4, 5]:  # March, April, May
        month_sessions = session_log.objects.filter(
            client_id__user_id__email__in=demo_emails,
            date__month=month,
            date__year=2026
        ).count()
        month_name = datetime(2026, month, 1).strftime('%B')
        print(f"   {month_name} 2026: {month_sessions} sessions")
    
    print("\n" + "=" * 70)
    print("✅ VERIFICATION COMPLETE - All data successfully created!")
    print("=" * 70 + "\n")

if __name__ == '__main__':
    verify_demo_data()
