from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import json
from datetime import datetime

# --- ADD THIS IMPORT ---
# This allows 'emotion_data.objects' to be recognized
from .models import emotion_data, FinalAssessment
from .serializers import EmotionDataSerializer, FinalAssessmentSerializer
from .ollama_emotion_analyzer import OllamaEmotionAnalyzer

# Initialize Ollama analyzer
ollama_analyzer = OllamaEmotionAnalyzer(
    model_name="llama3.2:3b",
    ollama_url="http://localhost:11434"
)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def emotion_list_create(request):
    if request.method == 'GET':
        client_id = request.query_params.get('client_id')
        
        # Now 'emotion_data' is recognized
        if client_id:
            emotions = emotion_data.objects.filter(client_id=client_id).order_by('-emotion_id')
        else:
            emotions = emotion_data.objects.all().order_by('-emotion_id')
            
        serializer = EmotionDataSerializer(emotions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        print("Incoming Emotion Data:", request.data)
        
        serializer = EmotionDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def final_assessment_view(request):
    """
    GET: Retrieve latest final assessment for a client
    POST: Generate new AI-powered final assessment
    
    Query params (GET): client_id
    Body (POST): { "client_id": int, "force_refresh": bool }
    """
    
    if request.method == 'GET':
        client_id = request.query_params.get('client_id')
        
        if not client_id:
            return Response(
                {"error": "client_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get latest final assessment
            assessment = FinalAssessment.objects.filter(
                client_id=client_id
            ).order_by('-created_at').first()
            
            if assessment:
                serializer = FinalAssessmentSerializer(assessment)
                return Response(serializer.data)
            else:
                # No assessment exists, return empty response
                return Response(
                    {"message": "No assessment found. Generate one by sending a POST request."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'POST':
        """Generate new final assessment using Ollama"""
        
        client_id = request.data.get('client_id')
        force_refresh = request.data.get('force_refresh', False)
        
        if not client_id:
            return Response(
                {"error": "client_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            print(f"[FINAL-ASSESSMENT] Starting analysis for client {client_id}")
            
            # Fetch last 10 emotion logs
            recent_emotions = emotion_data.objects.filter(
                client_id=client_id
            ).order_by('-created_at')[:10]
            
            if not recent_emotions.exists():
                return Response(
                    {"error": "No emotion data found for this client"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Convert to list of dicts for Ollama
            emotions_list = []
            for emo in recent_emotions:
                emotions_list.append({
                    'emotion': emo.emotion,
                    'intensity': emo.intensity,
                    'created_at': emo.created_at.strftime('%Y-%m-%d %H:%M')
                })
            
            # Get latest journal entry (notes field)
            latest_emotion = recent_emotions.first()
            journal_entry = latest_emotion.notes if latest_emotion.notes else None
            
            print(f"[FINAL-ASSESSMENT] Analyzing {len(emotions_list)} emotions")
            if journal_entry:
                print(f"[FINAL-ASSESSMENT] Journal entry: {journal_entry[:100]}...")
            
            # Call Ollama for analysis
            analysis_result = ollama_analyzer.analyze_emotions(
                emotions=emotions_list,
                journal_entry=journal_entry
            )
            
            print(f"[FINAL-ASSESSMENT] Analysis result: {analysis_result}")
            
            # Save to database
            assessment = FinalAssessment.objects.create(
                client_id_id=client_id,  # Django expects _id suffix for FK
                raw_emotion=latest_emotion.emotion,
                raw_intensity=latest_emotion.intensity,
                final_emotion=analysis_result['final_emotion'],
                final_intensity=analysis_result['intensity'],
                recommendation=analysis_result['recommendation'],
                confidence_score=analysis_result['confidence'],
                emotions_analyzed=json.dumps(emotions_list),
                journal_entry=journal_entry
            )
            
            print(f"[FINAL-ASSESSMENT] ✓ Saved assessment #{assessment.assessment_id}")
            
            # Return serialized response
            serializer = FinalAssessmentSerializer(assessment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"[FINAL-ASSESSMENT] ✗ Error: {e}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )