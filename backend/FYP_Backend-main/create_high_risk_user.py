"""
Script to create a high-risk user with 3+ months of dummy data
Risk score should be higher than 60% overall
"""
import os
import django
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user
from client.models import client
from session_log.models import session_log
from emotion_data.models import emotion_data
from ai_guidance.models import ChatMessage, MessageEmotion, ConversationAnalytics

# High-risk emotions and their intensity ranges
HIGH_RISK_EMOTIONS = [
    ('anxious', 7, 10),
    ('depressed', 7, 10),
    ('hopeless', 8, 10),
    ('overwhelmed', 7, 9),
    ('stressed', 7, 9),
    ('sad', 6, 9),
    ('angry', 6, 8),
]

LOW_RISK_EMOTIONS = [
    ('calm', 3, 6),
    ('neutral', 3, 5),
    ('happy', 3, 6),
    ('content', 3, 5),
]

def create_high_risk_user():
    """Create a user with high risk profile (>60% risk over 3 months)"""
    
    # Create user account
    print("Creating high-risk user...")
    test_user, created = user.objects.get_or_create(
        email='highrisk.user@example.com',
        defaults={
            'name': 'Alex Johnson',
            'password': 'password123',
            'role': 'client'
        }
    )
    
    if not created:
        print(f"User already exists: {test_user.name}")
        # Delete existing data
        client.objects.filter(user_id=test_user).delete()
    
    # Create client profile
    test_client = client.objects.create(
        user_id=test_user,
        name='Alex Johnson',
        age=28,
        gender='Non-binary',
        email='highrisk.user@example.com'
    )
    print(f"Created client: {test_client.name} (ID: {test_client.client_id})")
    
    # Generate 3 months of session data
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=90)  # 3 months
    
    current_date = start_date
    session_count = 0
    high_risk_count = 0
    total_sessions = 0
    
    print("\nGenerating 3 months of session data...")
    
    while current_date <= end_date:
        # Create 2-4 sessions per week (not every day)
        if random.random() < 0.4:  # 40% chance of session each day
            session_count += 1
            total_sessions += 1
            
            # Create session
            session = session_log.objects.create(
                user_id=test_user,
                client_id=test_client,
                date=current_date,
                notes=f'Session {session_count}',
                summary=f'User discussed feelings of anxiety and stress about work and relationships.'
            )
            
            # Determine if this should be a high-risk session (70% high-risk to ensure >60% overall)
            is_high_risk_session = random.random() < 0.70
            
            if is_high_risk_session:
                high_risk_count += 1
                # Create 3-6 high-risk emotions for this session
                num_emotions = random.randint(3, 6)
                session_risk_scores = []
                
                for i in range(num_emotions):
                    emotion_name, min_intensity, max_intensity = random.choice(HIGH_RISK_EMOTIONS)
                    intensity = random.randint(min_intensity, max_intensity)
                    
                    emotion_data.objects.create(
                        client_id=test_client,
                        session_id=session,
                        emotion=emotion_name,
                        intensity=intensity,
                        notes=f'Detected {emotion_name} emotion with high intensity'
                    )
                    session_risk_scores.append(intensity)
                
                # Calculate session risk score (average of emotions)
                avg_risk = sum(session_risk_scores) / len(session_risk_scores)
                session.highest_risk_score = int(avg_risk * 10)  # Convert to 0-100 scale
                session.risk_level = 'high' if avg_risk >= 7 else 'moderate'
                session.needs_human_coach = avg_risk >= 7
                session.final_emotion = random.choice(HIGH_RISK_EMOTIONS)[0]
                session.emotion_intensity = int(avg_risk)
                
            else:
                # Create 2-4 low-risk emotions
                num_emotions = random.randint(2, 4)
                session_risk_scores = []
                
                for i in range(num_emotions):
                    emotion_name, min_intensity, max_intensity = random.choice(LOW_RISK_EMOTIONS)
                    intensity = random.randint(min_intensity, max_intensity)
                    
                    emotion_data.objects.create(
                        client_id=test_client,
                        session_id=session,
                        emotion=emotion_name,
                        intensity=intensity,
                        notes=f'Detected {emotion_name} emotion'
                    )
                    session_risk_scores.append(intensity)
                
                avg_risk = sum(session_risk_scores) / len(session_risk_scores)
                session.highest_risk_score = int(avg_risk * 10)
                session.risk_level = 'low'
                session.needs_human_coach = False
                session.final_emotion = random.choice(LOW_RISK_EMOTIONS)[0]
                session.emotion_intensity = int(avg_risk)
            
            session.save()
            
            # Create some chat messages for realism
            create_chat_messages(session, test_client, is_high_risk_session)
        
        current_date += timedelta(days=1)
    
    # Calculate overall statistics
    risk_percentage = (high_risk_count / total_sessions * 100) if total_sessions > 0 else 0
    
    print("\n" + "="*60)
    print("HIGH-RISK USER CREATED SUCCESSFULLY")
    print("="*60)
    print(f"User: {test_user.name} ({test_user.email})")
    print(f"Client ID: {test_client.client_id}")
    print(f"Total Sessions: {total_sessions}")
    print(f"High-Risk Sessions: {high_risk_count}")
    print(f"Low-Risk Sessions: {total_sessions - high_risk_count}")
    print(f"Risk Percentage: {risk_percentage:.1f}%")
    print(f"Date Range: {start_date} to {end_date}")
    print("="*60)
    
    return test_user, test_client

def create_chat_messages(session, test_client, is_high_risk):
    """Create realistic chat messages for a session"""
    
    if is_high_risk:
        user_messages = [
            "I've been feeling really anxious lately and I don't know what to do",
            "Everything feels overwhelming and I can't seem to catch a break",
            "I'm having trouble sleeping and my mind won't stop racing",
            "I feel like I'm failing at everything",
        ]
        ai_responses = [
            "I hear that you're experiencing a lot of anxiety. Can you tell me more about what's been triggering these feelings?",
            "It sounds like you're carrying a heavy burden. Let's talk about some coping strategies that might help.",
            "Sleep difficulties often accompany anxiety. Have you tried any relaxation techniques before bed?",
            "Those feelings are valid, but I want to help you see your strengths. What's one thing you accomplished recently, even if it seems small?",
        ]
    else:
        user_messages = [
            "I'm feeling a bit better today",
            "I tried the breathing exercises you suggested",
            "Work was okay today, not too stressful",
        ]
        ai_responses = [
            "That's great to hear! What do you think contributed to feeling better?",
            "I'm glad you tried the breathing exercises. How did they work for you?",
            "It's good that work was manageable today. What helped keep your stress levels down?",
        ]
    
    # Create 3-5 message pairs
    num_messages = random.randint(3, 5)
    for i in range(num_messages):
        user_msg = random.choice(user_messages)
        ai_msg = random.choice(ai_responses)
        
        # User message
        user_chat = ChatMessage.objects.create(
            session_id=session,
            client_id=test_client,
            message_type='user',
            message_text=user_msg,
            timestamp=datetime.now() - timedelta(hours=random.randint(1, 24))
        )
        
        # Create emotion for user message
        if is_high_risk:
            emotion_name, min_int, max_int = random.choice(HIGH_RISK_EMOTIONS)
            risk_level = 'high'
        else:
            emotion_name, min_int, max_int = random.choice(LOW_RISK_EMOTIONS)
            risk_level = 'low'
        
        MessageEmotion.objects.create(
            message=user_chat,
            primary_emotion=emotion_name,
            emotion_confidence=random.uniform(0.7, 0.95),
            intensity=random.randint(min_int, max_int),
            risk_level=risk_level
        )
        
        # AI response
        ChatMessage.objects.create(
            session_id=session,
            client_id=test_client,
            message_type='ai',
            message_text=ai_msg,
            timestamp=datetime.now() - timedelta(hours=random.randint(1, 24))
        )

if __name__ == '__main__':
    create_high_risk_user()
    print("\n✓ High-risk user data created successfully!")
    print("\nLogin credentials:")
    print("Email: highrisk.user@example.com")
    print("Password: password123")
