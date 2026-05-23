# COACH_CLIENT/serializers.py
from rest_framework import serializers
from .models import coach_client, Appointment
from human_coach.models import human_coach
from client.models import client

class CoachClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = coach_client
        fields = ('coach_client_id', 'coach_id', 'client_id', 'assigned_date', 'status')
        read_only_fields = ('coach_client_id',)


class CoachListSerializer(serializers.ModelSerializer):
    """Serializer for listing available coaches"""
    user_name = serializers.CharField(source='user_id.name', read_only=True)
    user_email = serializers.EmailField(source='user_id.email', read_only=True)
    
    class Meta:
        model = human_coach
        fields = ('coach_id', 'full_name', 'specialization', 'license_id', 
                  'is_approved', 'user_name', 'user_email')


class AppointmentSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach_id.full_name', read_only=True)
    coach_specialization = serializers.CharField(source='coach_id.specialization', read_only=True)
    client_name = serializers.CharField(source='client_id.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ('appointment_id', 'coach_id', 'client_id', 'appointment_date', 
                  'duration_minutes', 'status', 'notes', 'created_at', 'updated_at',
                  'coach_name', 'coach_specialization', 'client_name')
        read_only_fields = ('appointment_id', 'created_at', 'updated_at')
    
    def validate_appointment_date(self, value):
        """Validate that appointment is in the future"""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Appointment date must be in the future")
        return value