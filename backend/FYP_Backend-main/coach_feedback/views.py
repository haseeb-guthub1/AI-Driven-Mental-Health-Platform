# ... (Imports)
from .models import coach_feedback
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .serializers import CoachFeedbackSerializer

@api_view(['GET', 'POST'])
def coachfeedback_list_create(request):
    if request.method == 'GET':
        items = coach_feedback.objects.all()
        serializer = CoachFeedbackSerializer(items, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CoachFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def coachfeedback_detail(request, pk):
    item = get_object_or_404(coach_feedback, pk=pk)
    if request.method == 'GET':
        serializer = CoachFeedbackSerializer(item)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CoachFeedbackSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)