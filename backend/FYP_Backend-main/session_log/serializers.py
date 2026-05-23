# SESSION_LOG/serializers.py
from rest_framework import serializers
from .models import session_log

class SessionLogSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = session_log
        fields = ('session_id', 'user_id', 'client_id', 'date', 'notes', 'summary', 'final_emotion', 'emotion_intensity', 'message_count')
        read_only_fields = ('session_id',)
    
    def get_message_count(self, obj):
        """Calculate the number of messages in this session"""
        from ai_guidance.models import ChatMessage
        return ChatMessage.objects.filter(session_id=obj.session_id).count()