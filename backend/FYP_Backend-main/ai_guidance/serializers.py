from rest_framework import serializers
from .models import ai_guidance, ChatMessage, MessageEmotion, ConversationAnalytics

class AIGuidanceSerializer(serializers.ModelSerializer):
    # Add these fields to show emotion details in the response
    emotion_name = serializers.SerializerMethodField()
    emotion_intensity = serializers.SerializerMethodField()
    
    class Meta:
        model = ai_guidance
        fields = [
            'guidance_id', 
            'emotion_id', 
            'emotion_name',      # NEW: emotion name
            'emotion_intensity',  # NEW: emotion intensity
            'suggestion', 
            'effectiveness', 
            'user_message',
            'ai_response',
            'created_at'
        ]
        read_only_fields = ('guidance_id', 'created_at')

    def get_emotion_name(self, obj):
        """Get the emotion name from the related emotion_data"""
        if obj.emotion_id:
            return obj.emotion_id.emotion
        return None
    
    def get_emotion_intensity(self, obj):
        """Get the emotion intensity from the related emotion_data"""
        if obj.emotion_id:
            return obj.emotion_id.intensity
        return None


class MessageEmotionSerializer(serializers.ModelSerializer):
    """Serializer for emotion analysis of messages"""
    class Meta:
        model = MessageEmotion
        fields = [
            'emotion_id',
            'primary_emotion',
            'emotion_confidence',
            'intensity',
            'secondary_emotions',
            'sentiment_score',
            'sentiment_label',
            'crisis_keywords',
            'risk_level',
            'analyzed_at'
        ]
        read_only_fields = ('emotion_id', 'analyzed_at')


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for individual chat messages"""
    emotions = MessageEmotionSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'message_id',
            'session_id',
            'client_id',
            'message_type',
            'message_text',
            'timestamp',
            'tokens_used',
            'response_time',
            'emotions'
        ]
        read_only_fields = ('message_id', 'timestamp')


class ConversationAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for conversation analytics"""
    session_date = serializers.SerializerMethodField()
    
    class Meta:
        model = ConversationAnalytics
        fields = [
            'analytics_id',
            'session_id',
            'client_id',
            'session_date',
            'total_messages',
            'user_message_count',
            'ai_message_count',
            'session_duration',
            'dominant_emotion',
            'average_intensity',
            'emotion_transition_count',
            'emotional_range',
            'average_sentiment',
            'sentiment_trend',
            'alliance_score',
            'engagement_level',
            'max_risk_level',
            'crisis_flags',
            'coping_strategies_mentioned',
            'positive_reframing_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('analytics_id', 'created_at', 'updated_at')
    
    def get_session_date(self, obj):
        """Get session date from related session_log"""
        if obj.session_id:
            return obj.session_id.date
        return None


class ChatConversationSerializer(serializers.Serializer):
    """Serializer for full conversation with messages and analytics"""
    session_id = serializers.IntegerField()
    session_date = serializers.DateField()
    messages = ChatMessageSerializer(many=True)
    analytics = ConversationAnalyticsSerializer()
    summary = serializers.CharField(allow_null=True)