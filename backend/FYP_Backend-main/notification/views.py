from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import notification
from .serializers import NotificationSerializer
from emotion_data.models import emotion_data
from datetime import datetime, timedelta

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def notification_list_create(request):
    if request.method == 'GET':
        client_id = request.query_params.get('client_id')
        
        if client_id:
            # Fetch user-specific notifications
            items = notification.objects.filter(client_id=client_id).order_by('-created_at')
            
            # Auto-generate notifications from recent emotion data
            generate_emotion_notifications(client_id)
        else:
            items = notification.objects.all().order_by('-created_at')
            
        serializer = NotificationSerializer(items, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def notification_detail(request, pk):
    item = get_object_or_404(notification, pk=pk)
    
    if request.method == 'GET':
        serializer = NotificationSerializer(item)
        return Response(serializer.data)
        
    elif request.method == 'PUT':
        # Update notification (e.g., mark as read)
        serializer = NotificationSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def mark_all_read(request):
    """Mark all notifications as read for a client"""
    client_id = request.data.get('client_id')
    
    if not client_id:
        return Response({"error": "client_id required"}, status=status.HTTP_400_BAD_REQUEST)
    
    updated = notification.objects.filter(client_id=client_id, is_read=False).update(is_read=True)
    
    return Response({"message": f"{updated} notifications marked as read"}, status=status.HTTP_200_OK)

def generate_emotion_notifications(client_id):
    """Auto-generate notifications based on recent emotion detections"""
    try:
        # Get recent emotions from the last 24 hours
        yesterday = datetime.now() - timedelta(days=1)
        recent_emotions = emotion_data.objects.filter(
            client_id=client_id,
            created_at__gte=yesterday
        ).order_by('-created_at')
        
        for emotion in recent_emotions:
            # Check if notification already exists for this emotion
            existing = notification.objects.filter(
                emotion_id=emotion.emotion_id,
                client_id=client_id
            ).exists()
            
            if existing:
                continue
            
            # Extract risk level from notes
            risk_level = 'low'
            if emotion.notes:
                if 'critical' in emotion.notes.lower():
                    risk_level = 'critical'
                elif 'high' in emotion.notes.lower():
                    risk_level = 'high'
                elif 'medium' in emotion.notes.lower():
                    risk_level = 'moderate'
            
            # Generate notification for high-risk emotions
            if risk_level in ['critical', 'high']:
                title = f"{'🚨 Critical' if risk_level == 'critical' else '⚠️ High'} Emotion Alert"
                
                emotion_messages = {
                    'grief': 'We detected signs of grief. Please reach out for support if needed.',
                    'sadness': 'We noticed you\'re feeling down. Consider talking to someone you trust.',
                    'fear': 'We detected fear or anxiety. Remember to take deep breaths and ground yourself.',
                    'anger': 'We noticed elevated anger. Try a calming technique or physical activity.',
                    'nervousness': 'Feeling nervous? Try mindfulness exercises or talk to a friend.',
                }
                
                message = emotion_messages.get(
                    emotion.emotion.lower(),
                    f"We detected {emotion.emotion} with high intensity. Your wellbeing matters."
                )
                
                if risk_level == 'critical':
                    message += " If you're in crisis, please contact emergency services or call 1122 (Pakistan Emergency)."
                
                notification.objects.create(
                    client_id_id=client_id,
                    emotion_id=emotion,
                    notification_type='emotion_alert',
                    title=title,
                    message=message,
                    severity=risk_level,
                    is_read=False
                )
        
        # Generate daily wellness tip if no recent tip exists
        today = datetime.now().date()
        wellness_tip_exists = notification.objects.filter(
            client_id=client_id,
            notification_type='wellness_tip',
            created_at__date=today
        ).exists()
        
        if not wellness_tip_exists:
            wellness_tips = [
                ('Take 5 deep breaths and notice how you feel', '🧘'),
                ('Write down 3 things you\'re grateful for today', '✨'),
                ('Reach out to a friend or loved one', '💚'),
                ('Go for a short walk and get some fresh air', '🌳'),
                ('Practice a 5-minute meditation or mindfulness', '🕉️'),
                ('Drink a glass of water and stretch your body', '💧'),
                ('Listen to your favorite uplifting music', '🎵'),
            ]
            
            tip_text, emoji = wellness_tips[datetime.now().day % len(wellness_tips)]
            
            notification.objects.create(
                client_id_id=client_id,
                notification_type='wellness_tip',
                title=f'{emoji} Daily Wellness Tip',
                message=tip_text,
                severity='low',
                is_read=False
            )
            
    except Exception as e:
        print(f"[Notification] Error generating notifications: {e}")