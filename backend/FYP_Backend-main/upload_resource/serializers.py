# UPLOADED_RESOURCE/serializers.py
from rest_framework import serializers
from .models import uploaded_resource

class UploadedResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = uploaded_resource
        fields = ('resource_id', 'coach_id', 'resource_type', 'resource_url', 'upload_date')
        read_only_fields = ('resource_id',)