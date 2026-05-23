# ... (Imports)
from .models import uploaded_resource
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .serializers import UploadedResourceSerializer

@api_view(['GET', 'POST'])
def uploadedresource_list_create(request):
    if request.method == 'GET':
        items = uploaded_resource.objects.all()
        serializer = UploadedResourceSerializer(items, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = UploadedResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def uploadedresource_detail(request, pk):
    item = get_object_or_404(uploaded_resource, pk=pk)
    if request.method == 'GET':
        serializer = UploadedResourceSerializer(item)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UploadedResourceSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)