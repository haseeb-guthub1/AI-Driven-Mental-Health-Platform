from django.contrib import admin
from .models import ai_guidance, ChatMessage, MessageEmotion, ConversationAnalytics


@admin.register(ai_guidance)
class AIGuidanceAdmin(admin.ModelAdmin):
    list_display = ('guidance_id', 'client_id', 'session_id', 'emotion_id', 'created_at')
    list_filter = ('created_at', 'effectiveness')
    search_fields = ('suggestion', 'user_message', 'ai_response')
    readonly_fields = ('created_at',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'session_id', 'client_id', 'message_type', 'timestamp', 'get_message_preview')
    list_filter = ('message_type', 'timestamp')
    search_fields = ('message_text', 'client_id__user_id__name')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    def get_message_preview(self, obj):
        return obj.message_text[:50] + '...' if len(obj.message_text) > 50 else obj.message_text
    get_message_preview.short_description = 'Message Preview'


@admin.register(MessageEmotion)
class MessageEmotionAdmin(admin.ModelAdmin):
    list_display = ('emotion_id', 'get_message_preview', 'primary_emotion', 'emotion_confidence', 'intensity', 'risk_level', 'analyzed_at')
    list_filter = ('primary_emotion', 'risk_level', 'sentiment_label', 'analyzed_at')
    search_fields = ('primary_emotion', 'message__message_text')
    readonly_fields = ('analyzed_at',)
    date_hierarchy = 'analyzed_at'
    
    def get_message_preview(self, obj):
        return obj.message.message_text[:40] + '...' if len(obj.message.message_text) > 40 else obj.message.message_text
    get_message_preview.short_description = 'Message'


@admin.register(ConversationAnalytics)
class ConversationAnalyticsAdmin(admin.ModelAdmin):
    list_display = (
        'analytics_id', 
        'session_id', 
        'client_id', 
        'total_messages', 
        'dominant_emotion', 
        'average_intensity',
        'alliance_score',
        'max_risk_level',
        'created_at'
    )
    list_filter = ('max_risk_level', 'engagement_level', 'sentiment_trend', 'created_at')
    search_fields = ('client_id__user_id__name', 'dominant_emotion')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session_id', 'client_id', 'created_at', 'updated_at')
        }),
        ('Message Metrics', {
            'fields': ('total_messages', 'user_message_count', 'ai_message_count', 'session_duration')
        }),
        ('Emotion Analytics', {
            'fields': ('dominant_emotion', 'average_intensity', 'emotion_transition_count', 'emotional_range')
        }),
        ('Sentiment Analysis', {
            'fields': ('average_sentiment', 'sentiment_trend')
        }),
        ('Therapeutic Metrics', {
            'fields': ('alliance_score', 'engagement_level')
        }),
        ('Risk Assessment', {
            'fields': ('max_risk_level', 'crisis_flags')
        }),
        ('Resilience Indicators', {
            'fields': ('coping_strategies_mentioned', 'positive_reframing_count')
        }),
    )
