# NOTIFICATION/serializers.py
from rest_framework import serializers
from .models import notification

class NotificationSerializer(serializers.ModelSerializer):
    emotion = serializers.SerializerMethodField()
    
    class Meta:
        model = notification
        fields = ('notification_id', 'client_id', 'emotion_id', 'notification_type', 
                  'title', 'message', 'severity', 'is_read', 'created_at', 'updated_at', 'emotion')
        read_only_fields = ('notification_id', 'created_at', 'updated_at')
    
    def get_emotion(self, obj):
        """Return emotion name if emotion_id exists"""
        if obj.emotion_id:
            return obj.emotion_id.emotion
        return None