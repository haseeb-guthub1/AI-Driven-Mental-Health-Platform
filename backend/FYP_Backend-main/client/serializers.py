# CLIENT/serializers.py
from rest_framework import serializers
from .models import client

class ClientSerializer(serializers.ModelSerializer):
    # Assuming the USER app has a UserSerializer, you might include it here
    # user = UserSerializer(read_only=True) 

    class Meta:
        model = client
        # Note: 'user_id' is the ForeignKey field name on the CLIENT model
        fields = ('client_id', 'user_id', 'age', 'gender', 'email')
        read_only_fields = ('client_id',)