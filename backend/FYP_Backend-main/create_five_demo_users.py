"""
Panel Demo Seed Script
======================
Creates 5 demo users (3 low-risk, 2 high-risk) with:
  - Rich AI guidance conversations visible in the chat UI
  - Session logs with correct risk scores (0-100 scale)
  - Multiple approved coaches so high-risk users have real selection
  - High-risk users have NO pre-assigned coach  -> mandatory modal fires on login

Usage:
    ./venv/Scripts/python.exe create_five_demo_users.py
"""

import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user as UserModel
from client.models import client as ClientModel
from human_coach.models import human_coach as CoachModel
from coach_client.models import coach_client as CoachClientModel, Appointment
from session_log.models import session_log as SessionLog
from emotion_data.models import emotion_data as EmotionData
from ai_guidance.models import ai_guidance as AIGuidance, ChatMessage, MessageEmotion, ConversationAnalytics

# ─── Coaches ────────────────────────────────────────────────────────────────
COACHES = [
    {
        'email': 'dr.sara.khan@mindcare.com',
        'name': 'Dr. Sara Khan',
        'specialization': 'Anxiety & Depression Specialist',
        'license': 'PSY-AK-2201',
    },
    {
        'email': 'dr.hassan.mirza@mindcare.com',
        'name': 'Dr. Hassan Mirza',
        'specialization': 'Cognitive Behavioural Therapy (CBT)',
        'license': 'PSY-HM-3302',
    },
    {
        'email': 'dr.amna.rauf@mindcare.com',
        'name': 'Dr. Amna Rauf',
        'specialization': 'Stress Management & Work Burnout',
        'license': 'PSY-AR-4403',
    },
    {
        'email': 'dr.zain.ali@mindcare.com',
        'name': 'Dr. Zain Ali',
        'specialization': 'Trauma & PTSD Recovery',
        'license': 'PSY-ZA-5504',
    },
]

# ─── Users ───────────────────────────────────────────────────────────────────
USERS = [
    # LOW RISK
    {
        'name': 'Ali Raza',
        'email': 'ali.raza.demo@example.com',
        'password': 'Pass@1234',
        'age': 24,
        'gender': 'Male',
        'risk': 'low',
        'risk_score_range': (18, 32),
    },
    {
        'name': 'Sana Malik',
        'email': 'sana.malik.demo@example.com',
        'password': 'Pass@1234',
        'age': 29,
        'gender': 'Female',
        'risk': 'low',
        'risk_score_range': (15, 30),
    },
    {
        'name': 'Usman Tariq',
        'email': 'usman.tariq.demo@example.com',
        'password': 'Pass@1234',
        'age': 32,
        'gender': 'Male',
        'risk': 'low',
        'risk_score_range': (20, 35),
    },
    # HIGH RISK
    {
        'name': 'Nadia Shah',
        'email': 'nadia.shah.demo@example.com',
        'password': 'Pass@1234',
        'age': 27,
        'gender': 'Female',
        'risk': 'high',
        'risk_score_range': (74, 91),
    },
    {
        'name': 'Bilal Ahmed',
        'email': 'bilal.ahmed.demo@example.com',
        'password': 'Pass@1234',
        'age': 35,
        'gender': 'Male',
        'risk': 'high',
        'risk_score_range': (76, 93),
    },
]

# ─── Conversations (for ai_guidance table — what the chat UI displays) ────────

LOW_RISK_CONVS_ALI = [
    {
        'user': "I have been trying to build a morning routine and it is actually working. I feel much more focused throughout the day.",
        'ai': "That is a wonderful achievement! Consistency in morning routines is one of the most powerful habits for mental clarity. How long have you been maintaining it?",
        'emotion': 'motivated',
        'intensity': 3,
    },
    {
        'user': "About three weeks now. I started with just 10 minutes of journaling and some light stretching. It has made me less reactive in stressful moments.",
        'ai': "Three weeks is significant — you have moved past the hardest phase of habit formation. Journaling and stretching together create both cognitive and physical grounding. What do you usually write about?",
        'emotion': 'calm',
        'intensity': 2,
    },
    {
        'user': "Mostly things I am grateful for and what I want to accomplish that day. I also note down anything that worried me the night before so it does not linger.",
        'ai': "That is a beautifully structured practice — gratitude for the positive and externalising worries to reduce mental load. Research strongly supports this approach. How are your relationships feeling lately?",
        'emotion': 'content',
        'intensity': 2,
    },
    {
        'user': "Much better actually. I used to get frustrated very easily with my younger brother. Now I pause before I respond. He even noticed the change.",
        'ai': "The fact that someone close to you noticed is one of the strongest signals of real progress. That pause before responding is emotional regulation in action. I am genuinely pleased with how far you have come.",
        'emotion': 'happy',
        'intensity': 3,
    },
    {
        'user': "I also started reading before bed instead of scrolling on my phone. My sleep quality has improved noticeably.",
        'ai': "Replacing screen time with reading before sleep is one of the most impactful changes you can make for sleep hygiene. Lower blue light exposure and mental engagement with a book help your brain wind down naturally. Keep it going!",
        'emotion': 'calm',
        'intensity': 2,
    },
]

LOW_RISK_CONVS_SANA = [
    {
        'user': "I have been working on setting healthier boundaries at work. It is challenging but I am getting better at saying no.",
        'ai': "Setting boundaries is one of the hardest interpersonal skills to develop, especially in professional settings. What situation prompted you to start working on this?",
        'emotion': 'thoughtful',
        'intensity': 3,
    },
    {
        'user': "My manager kept adding tasks to my plate without asking. I used to just silently accept. Last week I politely explained I was at capacity and asked which task should be deprioritised.",
        'ai': "That was a masterclass in assertive communication — you did not refuse, you redirected. Offering to deprioritise shows you are solution-oriented, which makes the boundary easier to accept. How did your manager respond?",
        'emotion': 'confident',
        'intensity': 3,
    },
    {
        'user': "She actually appreciated it. She said she did not realise how much was on my plate. We restructured my workload together.",
        'ai': "That outcome is ideal and it reinforces something important — most people are more receptive to honest communication than we fear. You took a risk and it paid off. That memory will make the next boundary easier.",
        'emotion': 'happy',
        'intensity': 3,
    },
    {
        'user': "I have also been practising mindfulness. I do a five-minute breathing exercise after lunch and it genuinely resets my afternoon.",
        'ai': "A midday mindfulness reset is highly effective. It leverages the natural post-lunch dip — instead of fighting it with caffeine, you are working with your biology. Five minutes is enough to reset your nervous system. I love that you found what works for you.",
        'emotion': 'calm',
        'intensity': 2,
    },
    {
        'user': "One thing I still struggle with is overthinking at night. My mind replays conversations and scenarios that may never happen.",
        'ai': "Night-time overthinking is very common and tends to be the last habit to improve because the brain is less distracted. A useful technique is to write down the 'worry' thought with one brief reframe, then close the notebook — physically closing it signals your brain the thought is contained. Would you like to try that?",
        'emotion': 'thoughtful',
        'intensity': 4,
    },
]

LOW_RISK_CONVS_USMAN = [
    {
        'user': "I went hiking this weekend for the first time. Being in nature just reset everything for me. I feel lighter.",
        'ai': "There is compelling evidence that spending time in nature — even for short periods — lowers cortisol levels and improves mood. What made you decide to go?",
        'emotion': 'happy',
        'intensity': 3,
    },
    {
        'user': "I have been feeling a bit stuck lately — not depressed, just flat. A friend suggested getting away from screens for a day and it worked perfectly.",
        'ai': "Recognising the difference between 'stuck and flat' and actual depression shows real self-awareness. Digital detox combined with physical activity and natural environment is a powerful combination for that specific state. How long was the hike?",
        'emotion': 'content',
        'intensity': 3,
    },
    {
        'user': "About four hours. I went with two close friends and we barely talked about work. Just walked and observed. It was the most present I have felt in weeks.",
        'ai': "Four hours is a meaningful commitment and the social element adds to it — connection with friends in a screen-free, open environment is restorative on multiple levels. That sense of presence you felt is mindfulness in its most natural form.",
        'emotion': 'calm',
        'intensity': 2,
    },
    {
        'user': "I want to make it a monthly habit. I also realised I barely have any offline hobbies. I used to play chess years ago.",
        'ai': "Returning to an old offline hobby is a great idea. Chess specifically is excellent for mental sharpness — it builds focus, strategic thinking, and patience. Even playing casually online against friends counts as a lower-stimulation activity compared to social media.",
        'emotion': 'motivated',
        'intensity': 3,
    },
    {
        'user': "True. I downloaded a chess app and played a few games. I enjoy it. I think having structured offline time will help me feel less scattered overall.",
        'ai': "You are building a lifestyle architecture intentionally — outdoor time monthly, chess as a mental hobby, and improved self-awareness. These are real, compounding investments in your wellbeing. I can see a clear positive trajectory.",
        'emotion': 'content',
        'intensity': 2,
    },
]

HIGH_RISK_CONVS_NADIA = [
    {
        'user': "I have not been sleeping properly for almost two months. I fall asleep but wake up at 3am and cannot go back. My mind just races.",
        'ai': "Two months of disrupted sleep is a serious concern — your body and mind are under sustained stress. Early morning waking with racing thoughts is a classic pattern in anxiety. Can you tell me what types of thoughts wake you?",
        'emotion': 'anxiety',
        'intensity': 8,
    },
    {
        'user': "It is mostly fear about the future. I keep imagining worst-case scenarios for my job, my relationship, my health. Even when nothing is actually wrong, my brain invents catastrophes.",
        'ai': "What you are describing — your brain generating threats even in the absence of real danger — is a hallmark of generalised anxiety. Your threat detection system is stuck in overdrive. This is something a trained professional can help you recalibrate significantly. How is this affecting your daily functioning?",
        'emotion': 'anxious',
        'intensity': 9,
    },
    {
        'user': "I can barely concentrate at work. I re-read the same paragraph four times. I missed a deadline last week for the first time in my career. My manager noticed.",
        'ai': "Missing a deadline is a significant marker — it tells me the anxiety has moved from being internal to visibly affecting your performance and professional reputation. That also likely creates a feedback loop where you worry about your work performance, which worsens concentration. I am genuinely concerned and want to make sure you get proper support.",
        'emotion': 'overwhelmed',
        'intensity': 9,
    },
    {
        'user': "I had a panic attack in the office bathroom last Tuesday. I was shaking, my heart was pounding, I thought something was medically wrong with me. A colleague found me. I was humiliated.",
        'ai': "A panic attack in a workplace setting is distressing beyond just the physical experience — the loss of privacy and professional composure adds to the trauma of it. Panic attacks of this severity, alongside chronic sleep disruption and cognitive impairment, are serious clinical indicators. Nadia, I must strongly recommend that you connect with one of our licensed coaches immediately. This is beyond what self-help can address safely.",
        'emotion': 'fear',
        'intensity': 9,
    },
    {
        'user': "I feel ashamed to tell anyone. I have always been the strong one in my family. Nobody knows what is happening to me.",
        'ai': "The shame you feel is one of the cruelest parts of anxiety — the very illness that makes you need support also convinces you that asking for it is weakness. But reaching out here tells me that part of you knows you need more. That took courage. A professional coach will treat everything you share with complete confidentiality. Please take that next step.",
        'emotion': 'hopeless',
        'intensity': 8,
    },
    {
        'user': "Do you really think I need professional help? Maybe I just need to try harder to manage it myself.",
        'ai': "Trying harder is not the missing ingredient here — you are already trying incredibly hard and it is not enough because this level of anxiety is a clinical condition, not a willpower problem. You would not tell someone with a broken leg to walk harder. A professional coach can give you the specific tools and structured support that are designed for exactly what you are experiencing. Your wellbeing depends on this step.",
        'emotion': 'anxiety',
        'intensity': 9,
    },
]

HIGH_RISK_CONVS_BILAL = [
    {
        'user': "I have been working 13 to 15 hours every day for the past four months. I barely see my family. My wife told me last night she feels like she is raising our kids alone.",
        'ai': "Hearing that from your spouse must have been painful — and it also sounds like a wake-up call you needed. Four months at this intensity is not sustainable physically or relationally. What is driving these hours — is it workload, culture, or something else?",
        'emotion': 'stressed',
        'intensity': 9,
    },
    {
        'user': "It is a combination. My company is understaffed and I feel personally responsible. If I do not cover the gap, the team fails and I cannot accept that. But I also feel resentment building. I am angry all the time now.",
        'ai': "What you are describing is a dual bind — strong responsibility that keeps you overworking and resentment that builds because the sacrifice is unsustainable. The anger is your nervous system signalling that something is fundamentally wrong. When did you last take a full day off?",
        'emotion': 'overwhelmed',
        'intensity': 9,
    },
    {
        'user': "Three months ago. And even then I checked my messages every hour. I do not know how to switch off. I have chest tightness regularly and my doctor said it was stress. He recommended therapy but I did not go.",
        'ai': "Chest tightness from stress is your cardiovascular system under load. The fact that your doctor already recommended therapy and you did not go tells me there may be a barrier — perhaps time, or perhaps the belief that you should handle this yourself. Is that accurate?",
        'emotion': 'anxious',
        'intensity': 8,
    },
    {
        'user': "Partly. Also I feel like talking about feelings will not fix the actual problem which is the work volume. Nothing changes the deadline.",
        'ai': "I understand that frustration. But here is what professional support actually does in your situation — it helps you identify what is genuinely yours to carry and what is not, build psychological boundaries so you stop absorbing organisational failure personally, and give you practical techniques to deactivate your stress response so the chest tightness and anger do not become a health crisis. The deadline stays. But you can change how much of yourself it consumes.",
        'emotion': 'frustrated',
        'intensity': 8,
    },
    {
        'user': "I snapped at my 8-year-old son yesterday because he interrupted me during a call. He just wanted to show me a drawing. I saw his face when I raised my voice. I cannot get that out of my head.",
        'ai': "That moment is clearly weighing heavily on you — and it should, because it is showing you what chronic stress costs beyond work. Your son's reaction broke through in a way deadlines cannot. That is important information. Bilal, you are a person carrying more than one human being should carry alone. Connecting with a professional coach is not weakness — it is the most responsible thing you can do for yourself and for your family right now.",
        'emotion': 'hopeless',
        'intensity': 9,
    },
    {
        'user': "I think you are right. I have been telling myself I will deal with this after the project. But there is always another project.",
        'ai': "'After the project' is one of the most dangerous delays in mental health — because there is always another project. The cost of waiting accrues in your health, your relationships, and your parenting. You said it yourself. Please take the step to connect with a coach today. This platform can match you with a professional who specialises in exactly your situation. You owe this to yourself and to that little boy with the drawing.",
        'emotion': 'overwhelmed',
        'intensity': 9,
    },
]

CONV_MAP = {
    'ali.raza.demo@example.com': LOW_RISK_CONVS_ALI,
    'sana.malik.demo@example.com': LOW_RISK_CONVS_SANA,
    'usman.tariq.demo@example.com': LOW_RISK_CONVS_USMAN,
    'nadia.shah.demo@example.com': HIGH_RISK_CONVS_NADIA,
    'bilal.ahmed.demo@example.com': HIGH_RISK_CONVS_BILAL,
}


def create_coaches():
    """Create multiple approved coaches for the coach selection screen."""
    print("  Creating approved coaches...")
    created = []
    for cd in COACHES:
        coach_user, _ = UserModel.objects.get_or_create(
            email=cd['email'],
            defaults={'name': cd['name'], 'password': 'Coach@2026!', 'role': 'coach'}
        )
        coach, _ = CoachModel.objects.get_or_create(
            user_id=coach_user,
            defaults={
                'full_name': cd['name'],
                'specialization': cd['specialization'],
                'license_id': cd['license'],
                'is_approved': True,
                'approved_at': timezone.now(),
            }
        )
        # Ensure always approved
        if not coach.is_approved:
            coach.is_approved = True
            coach.approved_at = timezone.now()
            coach.save()
        created.append(coach)
        print(f"    - {coach.full_name}  ({coach.specialization})")
    return created


def build_user_data(ud):
    """Create or update user + client records, return (user_obj, client_obj)."""
    user_obj, created = UserModel.objects.get_or_create(
        email=ud['email'],
        defaults={'name': ud['name'], 'password': ud['password'], 'role': 'client'}
    )
    if not created:
        user_obj.name = ud['name']
        user_obj.password = ud['password']
        user_obj.save()

    client_obj, _ = ClientModel.objects.get_or_create(
        user_id=user_obj,
        defaults={'name': ud['name'], 'age': ud['age'], 'gender': ud['gender'], 'email': ud['email']}
    )
    return user_obj, client_obj


def clear_existing_data(client_obj):
    """Remove previous ai_guidance, sessions, emotion_data for clean demo."""
    sessions = SessionLog.objects.filter(client_id=client_obj)
    for s in sessions:
        ChatMessage.objects.filter(session_id=s).delete()
        ConversationAnalytics.objects.filter(session_id=s).delete()
        AIGuidance.objects.filter(session_id=s).delete()
        EmotionData.objects.filter(session_id=s).delete()
    sessions.delete()
    # Remove coach assignments for high-risk users (to trigger mandatory modal)
    CoachClientModel.objects.filter(client_id=client_obj).delete()


def create_session_for_conv(user_obj, client_obj, conv_date, risk_score, risk_label):
    """Create one session_log record."""
    return SessionLog.objects.create(
        user_id=user_obj,
        client_id=client_obj,
        date=conv_date,
        notes=f"AI therapy session - {conv_date}",
        highest_risk_score=risk_score,
        risk_level=risk_label,
        needs_human_coach=(risk_score > 65),
        referral_triggered=(risk_score > 65),
    )


def create_ai_guidance_record(client_obj, session, conv, ts):
    """Create one ai_guidance record — this is what the chat UI renders."""
    # emotion_data is required by ai_guidance FK
    emo = EmotionData.objects.create(
        client_id=client_obj,
        session_id=session,
        emotion=conv['emotion'],
        intensity=conv['intensity'],
        notes=f"Detected during session on {session.date}",
    )
    AIGuidance.objects.create(
        client_id=client_obj,
        session_id=session,
        emotion_id=emo,
        suggestion="",
        effectiveness=0,
        user_message=conv['user'],
        ai_response=conv['ai'],
        created_at=ts,
    )


def seed_user(ud):
    print(f"\n  [{ud['risk'].upper()} RISK]  {ud['name']}  <{ud['email']}>")

    user_obj, client_obj = build_user_data(ud)
    clear_existing_data(client_obj)

    convs = CONV_MAP[ud['email']]
    risk_lo, risk_hi = ud['risk_score_range']
    end_date = datetime.now().date()
    base_date = end_date - timedelta(days=len(convs) * 2 + 5)

    # Each conversation gets its own session (clear separate days)
    for i, conv in enumerate(convs):
        conv_date = base_date + timedelta(days=i * 3)
        risk_score = random.randint(risk_lo, risk_hi)
        risk_label = 'high' if risk_score > 65 else 'moderate' if risk_score > 40 else 'low'

        session = create_session_for_conv(user_obj, client_obj, conv_date, risk_score, risk_label)

        ts = timezone.make_aware(
            datetime.combine(conv_date, datetime.min.time()) + timedelta(hours=14, minutes=i * 7)
        )
        create_ai_guidance_record(client_obj, session, conv, ts)

        # Also store as ChatMessage so session detail views work
        u_msg = ChatMessage.objects.create(
            session_id=session, client_id=client_obj,
            message_type='user', message_text=conv['user'], timestamp=ts,
        )
        MessageEmotion.objects.create(
            message=u_msg,
            primary_emotion=conv['emotion'],
            emotion_confidence=random.uniform(0.78, 0.96),
            intensity=conv['intensity'],
            sentiment_score=random.uniform(-0.8, -0.3) if conv['intensity'] > 5 else random.uniform(-0.2, 0.4),
            sentiment_label='negative' if conv['intensity'] > 5 else 'neutral',
            risk_level='high' if conv['intensity'] >= 8 else 'moderate' if conv['intensity'] >= 5 else 'low',
        )
        ChatMessage.objects.create(
            session_id=session, client_id=client_obj,
            message_type='ai', message_text=conv['ai'],
            timestamp=ts + timedelta(seconds=random.randint(3, 8)),
        )
        ConversationAnalytics.objects.create(
            session_id=session, client_id=client_obj,
            total_messages=2, user_message_count=1, ai_message_count=1,
            dominant_emotion=conv['emotion'],
            average_intensity=float(conv['intensity']),
            max_risk_level=risk_label,
        )

    print(f"    Conversations created : {len(convs)}")
    print(f"    Sessions created      : {len(convs)}")
    print(f"    Risk score range      : {risk_lo}-{risk_hi}%")
    if ud['risk'] == 'high':
        print(f"    Coach assignment      : NONE (mandatory modal will fire on login)")
    else:
        print(f"    Coach assignment      : Not required (low risk)")


def main():
    sep = "=" * 65
    print(f"\n{sep}")
    print("  Panel Demo Seed  —  5 Users  (3 Low Risk + 2 High Risk)")
    print(f"{sep}\n")

    print("  Step 1: Setting up coaches")
    print(f"  {'-'*50}")
    coaches = create_coaches()
    print(f"\n  {len(coaches)} approved coaches available for selection.\n")

    print(f"  Step 2: Creating users with conversations")
    print(f"  {'-'*50}")
    for ud in USERS:
        seed_user(ud)

    print(f"\n{sep}")
    print("  CREDENTIALS")
    print(f"{sep}")
    print()
    print(f"  {'#':<3} {'Name':<18} {'Email':<38} {'Password':<14} {'Risk'}")
    print(f"  {'-'*3} {'-'*18} {'-'*38} {'-'*14} {'-'*8}")
    for i, u in enumerate(USERS, 1):
        flag = "  << will see coach selection modal" if u['risk'] == 'high' else ""
        print(f"  {i:<3} {u['name']:<18} {u['email']:<38} {u['password']:<14} {u['risk'].upper()}{flag}")

    print()
    print("  Coach accounts (for coach dashboard):")
    for c in COACHES:
        print(f"    Email: {c['email']:<40}  Password: Coach@2026!")

    print()
    print(f"{sep}")
    print("  WHAT HAPPENS ON LOGIN")
    print(f"{sep}")
    print()
    print("  Ali Raza / Sana Malik / Usman Tariq  (LOW RISK)")
    print("    -> Normal dashboard, chat history visible with positive conversations")
    print()
    print("  Nadia Shah / Bilal Ahmed  (HIGH RISK)")
    print("    -> CRITICAL ALERT modal fires (risk > 65%, no coach, 10s countdown)")
    print("    -> Step 1: User sees 4 available coaches, selects one")
    print("    -> Step 2: User books appointment (within 48 hrs)")
    print("    -> Dashboard unlocks after booking")
    print()
    print(f"{sep}")
    print("  DONE")
    print(f"{sep}\n")


if __name__ == '__main__':
    main()
