from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import coach_client, Appointment
from .serializers import CoachClientSerializer, CoachListSerializer, AppointmentSerializer
from human_coach.models import human_coach
from client.models import client
from django.utils import timezone

@api_view(['GET', 'POST'])
def coachclient_list_create(request):
    if request.method == 'GET':
        items = coach_client.objects.all()
        serializer = CoachClientSerializer(items, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CoachClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def coachclient_detail(request, pk):
    item = get_object_or_404(coach_client, pk=pk)
    if request.method == 'GET':
        serializer = CoachClientSerializer(item)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CoachClientSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def available_coaches(request):
    """Get all approved coaches"""
    coaches = human_coach.objects.filter(is_approved=True)
    serializer = CoachListSerializer(coaches, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def book_appointment(request):
    """Book an appointment with a coach"""
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def client_appointments(request, client_id):
    """Get all appointments for a specific client"""
    appointments = Appointment.objects.filter(client_id=client_id).order_by('-appointment_date')
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
def appointment_detail(request, pk):
    """Get, update, or delete a specific appointment"""
    appointment = get_object_or_404(Appointment, pk=pk)
    
    if request.method == 'GET':
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AppointmentSerializer(appointment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        appointment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)