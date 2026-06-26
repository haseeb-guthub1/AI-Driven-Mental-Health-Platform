import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user
from client.models import client
from session_log.models import session_log
from coach_client.models import coach_client
from django.db.models import Avg

def update_high_risk_users():
    """
    Ensure Sarah Johnson and Michael Chen have risk scores >= 65% 
    to trigger the mandatory coach + appointment modal
    """
    print("\n" + "=" * 70)
    print("UPDATING HIGH-RISK USERS FOR MANDATORY MODAL TRIGGER")
    print("=" * 70 + "\n")
    
    high_risk_users = [
        'sarah.johnson@example.com',
        'michael.chen@example.com'
    ]
    
    for email in high_risk_users:
        try:
            user_obj = user.objects.get(email=email)
            client_obj = client.objects.get(user_id=user_obj)
            
            # Get all sessions for this client
            sessions = session_log.objects.filter(client_id=client_obj)
            
            # Update sessions to ensure risk scores are high
            updated_count = 0
            for session in sessions:
                # Set high risk scores (70-95%) for high-risk users
                import random
                session.highest_risk_score = random.randint(70, 95)
                session.risk_level = 'high'
                session.needs_human_coach = True
                session.referral_triggered = True
                session.save()
                updated_count += 1
            
            # Remove coach assignment temporarily to trigger the modal
            coach_assignment = coach_client.objects.filter(client_id=client_obj).first()
            if coach_assignment:
                coach_assignment.delete()
                print(f"✅ {user_obj.name}")
                print(f"   Email: {email}")
                print(f"   Updated {updated_count} sessions with HIGH risk scores (70-95%)")
                print(f"   Removed coach assignment to trigger modal")
                print(f"   Status: WILL SEE MANDATORY MODAL ON LOGIN")
                print()
            else:
                print(f"✅ {user_obj.name}")
                print(f"   Email: {email}")
                print(f"   Updated {updated_count} sessions with HIGH risk scores")
                print(f"   No coach assignment found (already ready for demo)")
                print(f"   Status: WILL SEE MANDATORY MODAL ON LOGIN")
                print()
                
        except Exception as e:
            print(f"❌ Error processing {email}: {str(e)}\n")
    
    # Verify the changes
    print("\n" + "=" * 70)
    print("VERIFICATION - HIGH RISK USER STATUS")
    print("=" * 70 + "\n")
    
    for email in high_risk_users:
        try:
            user_obj = user.objects.get(email=email)
            client_obj = client.objects.get(user_id=user_obj)
            
            # Calculate average risk score
            avg_risk = session_log.objects.filter(
                client_id=client_obj
            ).aggregate(Avg('highest_risk_score'))['highest_risk_score__avg']
            
            # Check coach assignment
            has_coach = coach_client.objects.filter(client_id=client_obj).exists()
            
            # Get latest session risk
            latest_session = session_log.objects.filter(
                client_id=client_obj
            ).order_by('-date').first()
            
            print(f"👤 {user_obj.name}")
            print(f"   Email: {email}")
            print(f"   Average Risk Score: {avg_risk:.1f}% {'✅ HIGH' if avg_risk >= 65 else '❌ NOT HIGH'}")
            print(f"   Latest Session Risk: {latest_session.highest_risk_score if latest_session else 'N/A'}%")
            print(f"   Has Coach Assigned: {'❌ NO (MODAL WILL SHOW)' if not has_coach else '✅ YES (MODAL HIDDEN)'}")
            print(f"   Modal Trigger: {'✅ WILL SHOW MANDATORY MODAL' if avg_risk >= 65 and not has_coach else '❌ WILL NOT SHOW'}")
            print()
            
        except Exception as e:
            print(f"❌ Error: {str(e)}\n")
    
    print("=" * 70)
    print("✅ UPDATE COMPLETE")
    print("=" * 70)
    print("\n📋 DEMO INSTRUCTIONS:")
    print("\n1. Login as: sarah.johnson@example.com / Demo2026!")
    print("   → Will see CRITICAL WARNING screen")
    print("   → Must read warning (10 second countdown)")
    print("   → Must select a coach")
    print("   → Must book appointment within 48 hours")
    print("   → Cannot access dashboard until complete")
    print("\n2. Login as: michael.chen@example.com / Demo2026!")
    print("   → Same mandatory flow as Sarah")
    print("\n3. Other users (Emily, David, Jennifer):")
    print("   → Normal dashboard access (no modal)")
    print("   → Can be used to show contrast\n")

if __name__ == '__main__':
    update_high_risk_users()
