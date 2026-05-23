from django.db import models
from django.utils import timezone

class ai_guidance(models.Model):
    guidance_id = models.AutoField(primary_key=True)
    
    # Check if you have these two lines:
    client_id = models.ForeignKey('client.client', on_delete=models.CASCADE, null=True)
    session_id = models.ForeignKey('session_log.session_log', on_delete=models.CASCADE, null=True)
    
    emotion_id = models.ForeignKey('emotion_data.emotion_data', on_delete=models.CASCADE)
    suggestion = models.TextField()
    effectiveness = models.IntegerField(default=0)
    user_message = models.TextField(null=True, blank=True)
    ai_response = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Guidance {self.guidance_id}"


class ChatMessage(models.Model):
    """Stores individual messages in AI therapy conversations"""
    MESSAGE_TYPE_CHOICES = [
        ('user', 'User Message'),
        ('ai', 'AI Response'),
    ]
    
    message_id = models.AutoField(primary_key=True)
    session_id = models.ForeignKey('session_log.session_log', on_delete=models.CASCADE, related_name='chat_messages')
    client_id = models.ForeignKey('client.client', on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)
    message_text = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Metadata
    tokens_used = models.IntegerField(null=True, blank=True)  # For tracking API usage
    response_time = models.FloatField(null=True, blank=True)  # Response time in seconds
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session_id', 'timestamp']),
            models.Index(fields=['client_id', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.message_type} - {self.message_text[:50]}..."


class MessageEmotion(models.Model):
    """Stores emotion analysis for each message"""
    emotion_id = models.AutoField(primary_key=True)
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='emotions')
    
    # Primary emotion
    primary_emotion = models.CharField(max_length=50)
    emotion_confidence = models.FloatField()  # 0.0 to 1.0
    intensity = models.IntegerField()  # 1 to 10
    
    # Secondary emotions (stored as JSON or separate fields)
    secondary_emotions = models.JSONField(null=True, blank=True)  # [{"emotion": "sad", "confidence": 0.3}]
    
    # Sentiment analysis
    sentiment_score = models.FloatField(null=True, blank=True)  # -1.0 (negative) to 1.0 (positive)
    sentiment_label = models.CharField(max_length=20, null=True, blank=True)  # positive, neutral, negative
    
    # Risk indicators
    crisis_keywords = models.JSONField(null=True, blank=True)  # List of detected crisis keywords
    risk_level = models.CharField(max_length=20, default='low')  # low, moderate, high, critical
    
    analyzed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['primary_emotion']),
            models.Index(fields=['risk_level']),
        ]
    
    def __str__(self):
        return f"{self.primary_emotion} ({self.emotion_confidence:.2f}) - {self.message.message_text[:30]}"


class ConversationAnalytics(models.Model):
    """Stores aggregate analytics for each therapy session"""
    analytics_id = models.AutoField(primary_key=True)
    session_id = models.OneToOneField('session_log.session_log', on_delete=models.CASCADE, related_name='analytics')
    client_id = models.ForeignKey('client.client', on_delete=models.CASCADE)
    
    # Session metrics
    total_messages = models.IntegerField(default=0)
    user_message_count = models.IntegerField(default=0)
    ai_message_count = models.IntegerField(default=0)
    session_duration = models.IntegerField(null=True, blank=True)  # Duration in seconds
    
    # Emotion analytics
    dominant_emotion = models.CharField(max_length=50, null=True, blank=True)
    average_intensity = models.FloatField(null=True, blank=True)
    emotion_transition_count = models.IntegerField(default=0)  # Number of emotion changes
    emotional_range = models.JSONField(null=True, blank=True)  # {"happy": 3, "sad": 2, ...}
    
    # Sentiment metrics
    average_sentiment = models.FloatField(null=True, blank=True)
    sentiment_trend = models.CharField(max_length=20, null=True, blank=True)  # improving, declining, stable
    
    # Therapeutic alliance (AI-user connection)
    alliance_score = models.FloatField(null=True, blank=True)  # 0.0 to 10.0
    engagement_level = models.CharField(max_length=20, null=True, blank=True)  # low, medium, high
    
    # Risk assessment
    max_risk_level = models.CharField(max_length=20, default='low')
    crisis_flags = models.IntegerField(default=0)  # Number of crisis indicators detected
    
    # Resilience indicators
    coping_strategies_mentioned = models.IntegerField(default=0)
    positive_reframing_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['client_id', 'created_at']),
            models.Index(fields=['max_risk_level']),
        ]
    
    def __str__(self):
        return f"Analytics for Session {self.session_id.session_id} - {self.dominant_emotion}"