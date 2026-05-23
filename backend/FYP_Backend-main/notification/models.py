from django.db import models
from client.models import client
from emotion_data.models import emotion_data

class notification(models.Model):
    NOTIFICATION_TYPES = [
        ('emotion_alert', 'Emotion Alert'),
        ('session_summary', 'Session Summary'),
        ('wellness_tip', 'Wellness Tip'),
        ('ai_suggestion', 'AI Suggestion'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    notification_id = models.AutoField(primary_key=True)
    client_id = models.ForeignKey(client, on_delete=models.CASCADE)
    emotion_id = models.ForeignKey(emotion_data, on_delete=models.SET_NULL, null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='ai_suggestion')
    title = models.CharField(max_length=200)
    message = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='low')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.title[:30]}"
