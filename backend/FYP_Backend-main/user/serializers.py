# USER/serializers.py
from rest_framework import serializers
from .models import user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user
        fields = ('user_id', 'name', 'email', 'password', 'role', 'created_at')
        # user_id and created_at are usually read-only
        read_only_fields = ('user_id', 'created_at')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 6}}

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value