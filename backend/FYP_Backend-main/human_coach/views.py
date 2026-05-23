from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import human_coach, ChatSession
from .serializers import HumanCoachSerializer

# --- BASIC CRUD OPERATIONS ---
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def humancoach_list_create(request):
    """
    GET: List all coaches
    POST: Create new coach (signup)
    """
    if request.method == 'GET':
        coaches = human_coach.objects.all()
        serializer = HumanCoachSerializer(coaches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = HumanCoachSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def humancoach_detail(request, pk):
    """
    GET: Retrieve coach details
    PUT: Update coach (for admin approval)
    DELETE: Delete coach
    """
    try:
        coach = human_coach.objects.get(pk=pk)
    except human_coach.DoesNotExist:
        return Response({"error": "Coach not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = HumanCoachSerializer(coach)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = HumanCoachSerializer(coach, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        coach.delete()
        return Response({"message": "Coach deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# --- COACH DASHBOARD VIEW ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coach_dashboard(request):
    """
    Shows the coach a list of all users and their session histories.
    High-risk users (7/10) are flagged.
    """
    # 1. Ensure the person logged in is an approved coach
    coach = get_object_or_404(human_coach, user_id=request.user)
    if not coach.is_approved:
        return Response({"error": "Account not approved by Admin."}, status=403)

    # 2. Get all real user sessions from your website
    sessions = ChatSession.objects.all().select_related('user').order_by('-is_high_risk', '-updated_at')
    
    results = []
    for s in sessions:
        results.append({
            "user_name": s.user.username,
            "session_id": s.id,
            "risk_level": s.risk_score,
            "is_high_risk": s.is_high_risk,
            "chat_history": s.transcript, # The real session history
            "last_active": s.updated_at
        })

    return Response(results, status=status.HTTP_200_OK)

# --- AI RISK ANALYSIS & REFERRAL VIEW ---
@api_view(['POST'])
@permission_classes([AllowAny])
def process_chat_message(request):
    """
    Endpoint called when a user talks to the AI.
    Calculates risk and refers to human coach if score >= 7.
    """
    user_id = request.data.get('user_id')
    message = request.data.get('message')
    
    # Imagine your AI model returns a score here
    current_score = 8 # Example: High Risk detected
    
    session, _ = ChatSession.objects.get_or_create(user_id=user_id)
    session.transcript.append({"role": "user", "content": message})
    session.risk_score = current_score
    session.save()

    # Referral Trigger Logic
    if current_score >= 7:
        # Fetch approved coaches for the user to choose from
        available_coaches = human_coach.objects.filter(is_approved=True)
        coach_data = HumanCoachSerializer(available_coaches, many=True).data
        
        return Response({
            "ai_response": "I'm concerned about what you're sharing. I recommend talking to a professional.",
            "risk_flag": True,
            "referral_protocol": True,
            "available_coaches": coach_data # User selects from this list on Frontend
        }, status=status.HTTP_200_OK)

    return Response({"ai_response": "AI continues normal chat...", "risk_flag": False})