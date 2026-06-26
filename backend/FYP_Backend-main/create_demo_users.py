import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user
from client.models import client
from human_coach.models import human_coach
from coach_client.models import coach_client
from session_log.models import session_log
from emotion_data.models import emotion_data
from ai_guidance.models import ChatMessage, MessageEmotion, ConversationAnalytics

# Professional user data
DEMO_USERS = [
    {
        'username': 'sarah.johnson',
        'password': 'Demo2026!',
        'name': 'Sarah Johnson',
        'email': 'sarah.johnson@example.com',
        'age': 28,
        'gender': 'Female',
        'profile': 'high_risk_anxiety',
        'description': 'High-risk user with anxiety and depression symptoms'
    },
    {
        'username': 'michael.chen',
        'password': 'Demo2026!',
        'name': 'Michael Chen',
        'email': 'michael.chen@example.com',
        'age': 35,
        'gender': 'Male',
        'profile': 'high_risk_stress',
        'description': 'High-risk user experiencing severe work stress'
    },
    {
        'username': 'emily.williams',
        'password': 'Demo2026!',
        'name': 'Emily Williams',
        'email': 'emily.williams@example.com',
        'age': 24,
        'gender': 'Female',
        'profile': 'moderate_risk',
        'description': 'Moderate-risk user dealing with work-life balance'
    },
    {
        'username': 'david.martinez',
        'password': 'Demo2026!',
        'name': 'David Martinez',
        'email': 'david.martinez@example.com',
        'age': 31,
        'gender': 'Male',
        'profile': 'low_risk_wellness',
        'description': 'Low-risk user focused on personal growth'
    },
    {
        'username': 'jennifer.brown',
        'password': 'Demo2026!',
        'name': 'Jennifer Brown',
        'email': 'jennifer.brown@example.com',
        'age': 27,
        'gender': 'Female',
        'profile': 'low_risk_relationship',
        'description': 'Low-risk user working on relationship skills'
    }
]

# Conversation templates for different profiles
HIGH_RISK_ANXIETY_CONVERSATIONS = [
    {
        'user': "I've been feeling really overwhelmed lately. I can't seem to shake this constant worry.",
        'ai': "I hear that you're feeling overwhelmed and experiencing persistent worry. These feelings are valid, and I'm here to support you. Can you tell me more about what's been triggering these feelings?",
        'emotion': 'anxiety',
        'intensity': 8
    },
    {
        'user': "I barely slept last night. My mind just keeps racing with negative thoughts.",
        'ai': "Sleep difficulties and racing thoughts can be really exhausting. It sounds like your anxiety is affecting your rest. Have you noticed any patterns in when these thoughts tend to occur?",
        'emotion': 'anxious',
        'intensity': 9
    },
    {
        'user': "Sometimes I feel like nothing I do is good enough. I'm afraid I'm letting everyone down.",
        'ai': "Those feelings of inadequacy can be really heavy to carry. It's important to recognize that these thoughts might not reflect reality. What would you say to a friend who expressed these same concerns?",
        'emotion': 'sad',
        'intensity': 8
    },
    {
        'user': "I had a panic attack at work yesterday. I'm scared it will happen again.",
        'ai': "Experiencing a panic attack can be frightening, especially in a work environment. I want you to know that panic attacks, while scary, are not dangerous. Let's work on some grounding techniques you can use if you feel another one coming on.",
        'emotion': 'fear',
        'intensity': 9
    },
]

HIGH_RISK_STRESS_CONVERSATIONS = [
    {
        'user': "Work pressure is crushing me. I'm working 12-hour days and still falling behind.",
        'ai': "It sounds like you're under tremendous pressure and experiencing burnout. Working long hours without seeing progress can be incredibly frustrating. How long has this been going on?",
        'emotion': 'stressed',
        'intensity': 9
    },
    {
        'user': "My manager keeps adding more to my plate. I don't know how to say no.",
        'ai': "Setting boundaries at work can be challenging, especially when you feel pressure to perform. Learning to say no is a skill that can protect your mental health. What concerns you most about declining additional work?",
        'emotion': 'overwhelmed',
        'intensity': 8
    },
    {
        'user': "I snapped at my partner last night over something small. This stress is affecting my relationships.",
        'ai': "It's insightful that you recognize how stress is impacting your relationships. When we're overwhelmed, we often have less patience for small frustrations. Have you been able to talk to your partner about what you're going through?",
        'emotion': 'frustrated',
        'intensity': 7
    },
]

MODERATE_RISK_CONVERSATIONS = [
    {
        'user': "I'm struggling to find balance between work and my personal life.",
        'ai': "Work-life balance is something many people struggle with. It's positive that you're recognizing this need. What does an ideal balance look like for you?",
        'emotion': 'stressed',
        'intensity': 6
    },
    {
        'user': "I feel guilty when I take time for myself. Like I should always be productive.",
        'ai': "That sense of guilt around self-care is common, but remember that taking care of yourself isn't selfish—it's necessary. Rest and personal time actually make you more effective in other areas of your life.",
        'emotion': 'guilty',
        'intensity': 5
    },
    {
        'user': "Some days I feel motivated, other days I can barely get out of bed.",
        'ai': "Fluctuating motivation is normal, and it's good that you're aware of these patterns. What differences do you notice between your good days and difficult days?",
        'emotion': 'tired',
        'intensity': 6
    },
]

LOW_RISK_WELLNESS_CONVERSATIONS = [
    {
        'user': "I've been working on building better habits. I started exercising regularly.",
        'ai': "That's wonderful! Building healthy habits takes commitment. How are you feeling about your progress so far?",
        'emotion': 'motivated',
        'intensity': 3
    },
    {
        'user': "I want to develop better emotional awareness. Sometimes I react before understanding why.",
        'ai': "Self-awareness is a valuable skill to develop. Recognizing that you want to understand your reactions better is already a great first step. What situations tend to trigger quick reactions?",
        'emotion': 'curious',
        'intensity': 2
    },
    {
        'user': "I've been practicing mindfulness and it's helping me stay present.",
        'ai': "That's excellent! Mindfulness can be a powerful tool for managing stress and staying grounded. What mindfulness practices have you found most helpful?",
        'emotion': 'calm',
        'intensity': 2
    },
]

LOW_RISK_RELATIONSHIP_CONVERSATIONS = [
    {
        'user': "I want to improve my communication with my partner. We sometimes misunderstand each other.",
        'ai': "Working on communication in relationships shows great maturity and care. What specific aspects of communication would you like to improve?",
        'emotion': 'thoughtful',
        'intensity': 3
    },
    {
        'user': "We had a productive conversation last night using the techniques we discussed.",
        'ai': "That's fantastic! It's wonderful to hear you're applying what we've talked about. What made the conversation feel more productive than usual?",
        'emotion': 'happy',
        'intensity': 2
    },
    {
        'user': "I'm learning to express my needs more clearly instead of expecting my partner to read my mind.",
        'ai': "That's an important realization. Clear communication of needs is foundational to healthy relationships. How has your partner responded to this more direct approach?",
        'emotion': 'content',
        'intensity': 3
    },
]

def get_conversations_for_profile(profile):
    """Return appropriate conversation templates based on user profile"""
    if profile == 'high_risk_anxiety':
        return HIGH_RISK_ANXIETY_CONVERSATIONS
    elif profile == 'high_risk_stress':
        return HIGH_RISK_STRESS_CONVERSATIONS
    elif profile == 'moderate_risk':
        return MODERATE_RISK_CONVERSATIONS
    elif profile == 'low_risk_wellness':
        return LOW_RISK_WELLNESS_CONVERSATIONS
    elif profile == 'low_risk_relationship':
        return LOW_RISK_RELATIONSHIP_CONVERSATIONS
    return MODERATE_RISK_CONVERSATIONS

def calculate_risk_score(emotion, intensity):
    """Calculate risk score based on emotion and intensity"""
    high_risk_emotions = ['anxiety', 'anxious', 'fear', 'panic', 'depressed', 'hopeless', 'suicidal']
    moderate_risk_emotions = ['sad', 'stressed', 'overwhelmed', 'frustrated', 'angry']
    
    if emotion.lower() in high_risk_emotions:
        return min(10, 6 + (intensity // 2))
    elif emotion.lower() in moderate_risk_emotions:
        return min(8, 4 + (intensity // 3))
    else:
        return max(1, intensity // 2)

def create_demo_data():
    print("=" * 60)
    print("Creating Professional Demo Users for FYP Presentation")
    print("=" * 60)
    
    # Get or create a coach for high-risk assignments
    coach_user, _ = user.objects.get_or_create(
        email='dr.patterson@clinic.com',
        defaults={
            'name': 'Dr. Patricia Patterson',
            'password': 'Coach2026!',
            'role': 'coach'
        }
    )
    
    coach, _ = human_coach.objects.get_or_create(
        user_id=coach_user,
        defaults={
            'full_name': 'Dr. Patricia Patterson',
            'specialization': 'Clinical Psychology & Anxiety Disorders',
            'license_id': 'PSY-2024-8756',
            'is_approved': True,
            'approved_at': timezone.now()
        }
    )
    
    print(f"\n✓ Coach created: {coach.full_name}")
    print(f"  Specialization: {coach.specialization}")
    
    # Create demo users
    created_users = []
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=90)  # 3 months ago
    
    for user_data in DEMO_USERS:
        print(f"\n{'=' * 60}")
        print(f"Creating user: {user_data['name']}")
        print(f"Username: {user_data['username']}")
        print(f"Password: {user_data['password']}")
        print(f"Profile: {user_data['description']}")
        print(f"{'=' * 60}")
        
        # Create user account
        user_obj, created = user.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'name': user_data['name'],
                'password': user_data['password'],
                'role': 'client'
            }
        )
        
        if not created:
            user_obj.password = user_data['password']
            user_obj.save()
            print("  ⚠ User already exists - updated password")
        
        # Create client profile
        client_obj, _ = client.objects.get_or_create(
            user_id=user_obj,
            defaults={
                'name': user_data['name'],
                'age': user_data['age'],
                'gender': user_data['gender'],
                'email': user_data['email']
            }
        )
        
        # Get conversation templates
        conversations = get_conversations_for_profile(user_data['profile'])
        
        # Generate 3 months of data
        sessions_created = 0
        messages_created = 0
        current_date = start_date
        
        # Create 2-4 sessions per week over 3 months
        while current_date <= end_date:
            # Random 2-4 sessions per week
            sessions_this_week = random.randint(2, 4)
            
            for _ in range(sessions_this_week):
                if current_date > end_date:
                    break
                
                # Create session
                session = session_log.objects.create(
                    user_id=user_obj,
                    client_id=client_obj,
                    date=current_date,
                    notes=f"AI therapy session on {current_date}"
                )
                
                # Select random conversations from the profile
                session_conversations = random.sample(
                    conversations, 
                    min(random.randint(2, 4), len(conversations))
                )
                
                session_emotions = []
                session_risk_scores = []
                
                for conv in session_conversations:
                    # Create user message
                    user_msg = ChatMessage.objects.create(
                        session_id=session,
                        client_id=client_obj,
                        message_type='user',
                        message_text=conv['user'],
                        timestamp=timezone.make_aware(
                            datetime.combine(current_date, datetime.min.time()) + 
                            timedelta(hours=random.randint(9, 20), minutes=random.randint(0, 59))
                        )
                    )
                    
                    # Create emotion for user message
                    MessageEmotion.objects.create(
                        message=user_msg,
                        primary_emotion=conv['emotion'],
                        emotion_confidence=random.uniform(0.75, 0.95),
                        intensity=conv['intensity'],
                        sentiment_score=random.uniform(-0.7, -0.2) if conv['intensity'] > 5 else random.uniform(-0.3, 0.3),
                        sentiment_label='negative' if conv['intensity'] > 5 else 'neutral',
                        risk_level='high' if conv['intensity'] >= 8 else 'moderate' if conv['intensity'] >= 5 else 'low'
                    )
                    
                    # Create AI response
                    ai_msg = ChatMessage.objects.create(
                        session_id=session,
                        client_id=client_obj,
                        message_type='ai',
                        message_text=conv['ai'],
                        timestamp=user_msg.timestamp + timedelta(seconds=random.randint(2, 8))
                    )
                    
                    # Store emotion data
                    emotion_data.objects.create(
                        client_id=client_obj,
                        session_id=session,
                        emotion=conv['emotion'],
                        intensity=conv['intensity'],
                        notes=f"Detected from conversation on {current_date}"
                    )
                    
                    session_emotions.append(conv['emotion'])
                    session_risk_scores.append(calculate_risk_score(conv['emotion'], conv['intensity']))
                    messages_created += 2
                
                # Update session with final emotion and risk assessment
                if session_emotions:
                    session.final_emotion = session_emotions[-1]
                    session.emotion_intensity = session_conversations[-1]['intensity']
                    session.highest_risk_score = max(session_risk_scores)
                    session.risk_level = 'high' if max(session_risk_scores) >= 7 else 'moderate' if max(session_risk_scores) >= 4 else 'low'
                    
                    # Mark if coach referral needed
                    if max(session_risk_scores) >= 7:
                        session.needs_human_coach = True
                        session.referral_triggered = True
                    
                    session.save()
                
                # Create conversation analytics
                ConversationAnalytics.objects.create(
                    session_id=session,
                    client_id=client_obj,
                    total_messages=len(session_conversations) * 2,
                    user_message_count=len(session_conversations),
                    ai_message_count=len(session_conversations),
                    dominant_emotion=max(set(session_emotions), key=session_emotions.count),
                    average_intensity=sum(c['intensity'] for c in session_conversations) / len(session_conversations)
                )
                
                sessions_created += 1
                current_date += timedelta(days=random.randint(1, 3))
        
        # Assign coach if high-risk
        if 'high_risk' in user_data['profile']:
            assignment, created = coach_client.objects.get_or_create(
                coach_id=coach,
                client_id=client_obj,
                defaults={
                    'assigned_date': start_date + timedelta(days=random.randint(7, 21)),
                    'status': 'active'
                }
            )
            print(f"  ✓ Assigned to coach: {coach.full_name}")
            print(f"    Assignment status: {assignment.status}")
        
        print(f"\n  📊 Statistics:")
        print(f"     • Sessions created: {sessions_created}")
        print(f"     • Messages created: {messages_created}")
        print(f"     • Time period: {start_date} to {end_date}")
        
        created_users.append({
            'username': user_data['username'],
            'password': user_data['password'],
            'name': user_data['name'],
            'profile': user_data['description']
        })
    
    # Print summary
    print(f"\n{'=' * 60}")
    print("✅ DEMO DATA CREATION COMPLETE")
    print(f"{'=' * 60}")
    print("\n📋 LOGIN CREDENTIALS FOR PANEL DEMO:\n")
    
    for idx, user_info in enumerate(created_users, 1):
        print(f"{idx}. {user_info['name']}")
        print(f"   Username: {user_info['username']}")
        print(f"   Password: {user_info['password']}")
        print(f"   Profile:  {user_info['profile']}")
        print()
    
    print(f"{'=' * 60}")
    print("Coach Login (for high-risk client monitoring):")
    print(f"Username: dr.patterson@clinic.com")
    print(f"Password: Coach2026!")
    print(f"{'=' * 60}\n")

if __name__ == '__main__':
    create_demo_data()
