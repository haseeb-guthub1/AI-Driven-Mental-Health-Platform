from rest_framework import serializers
from .models import emotion_data, FinalAssessment

class EmotionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = emotion_data
        fields = '__all__'


class FinalAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalAssessment
        fields = [
            'assessment_id',
            'client_id',
            'raw_emotion',
            'raw_intensity',
            'final_emotion',
            'final_intensity',
            'recommendation',
            'confidence_score',
            'emotions_analyzed',
            'journal_entry',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['assessment_id', 'created_at', 'updated_at'] # This includes emotion_id, client_id, session_id, emotion, and intensity