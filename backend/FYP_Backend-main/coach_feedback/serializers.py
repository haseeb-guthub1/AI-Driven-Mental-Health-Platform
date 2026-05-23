# COACH_FEEDBACK/serializers.py
from rest_framework import serializers
from .models import coach_feedback

class CoachFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = coach_feedback
        fields = ('feedback_id', 'coach_id', 'session_id', 'comment', 'rating')
        read_only_fields = ('feedback_id',)