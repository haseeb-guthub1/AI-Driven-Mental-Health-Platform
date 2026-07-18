# ... (Imports)
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import session_log
from .serializers import SessionLogSerializer

try:
    import google.generativeai as genai
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    genai = None
    GOOGLE_AI_AVAILABLE = False

from ai_guidance.models import ai_guidance
from emotion_data.models import emotion_data
from django.db.models import Avg

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def sessionlog_list_create(request):
    if request.method == 'GET':
        # Filter by client_id if provided
        client_id = request.query_params.get('client_id')
        if client_id:
            items = session_log.objects.filter(client_id=client_id)
        else:
            items = session_log.objects.all()
        serializer = SessionLogSerializer(items, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        try:
            # Auto-generate date and handle coach_id
            from datetime import date
            from client.models import client
            
            data = request.data.copy()
            client_id = data.get('client_id')
            
            print(f"[Session Creation] Received request with client_id: {client_id}")
            print(f"[Session Creation] Full data: {data}")
            
            # Validate that client exists
            if not client_id:
                return Response({"error": "client_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                client_obj = client.objects.get(client_id=client_id)
                print(f"[Session Creation] Found client: {client_obj}")
            except client.DoesNotExist:
                return Response({
                    "error": f"Client with ID {client_id} does not exist. Please ensure you have a client profile."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data['date'] = date.today()
            data['notes'] = data.get('notes', '')
            
            # Map coach_id to user_id if provided, otherwise set to None
            if 'coach_id' in data:
                data['user_id'] = data.pop('coach_id')
            if 'user_id' not in data or data['user_id'] is None:
                data['user_id'] = None
            
            print(f"[Session Creation] Prepared data: {data}")
            
            serializer = SessionLogSerializer(data=data)
            if serializer.is_valid():
                session = serializer.save()
                print(f"[Session Created] ID: {session.session_id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"[Session Error] Validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"[Session Error] Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def sessionlog_detail(request, pk):
    item = get_object_or_404(session_log, pk=pk)
    if request.method == 'GET':
        serializer = SessionLogSerializer(item)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = SessionLogSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_session_summary(request, session_id):
    """
    Generate AI summary of the conversation and detect final emotion
    Called when user ends a chat session
    """
    try:
        print(f"[Summary] Generating summary for session {session_id}")
        
        # Get the session
        try:
            session = session_log.objects.get(session_id=session_id)
            print(f"[Summary] Found session: {session.session_id}")
        except session_log.DoesNotExist:
            print(f"[Summary ERROR] Session {session_id} not found")
            return Response({
                "error": f"Session {session_id} not found"
            }, status=404)
        
        # Get all conversation messages for this session
        conversations = ai_guidance.objects.filter(
            session_id_id=session_id
        ).order_by('created_at')
        
        print(f"[Summary] Found {conversations.count()} conversations")
        
        if not conversations.exists():
            return Response({
                "error": "No conversation found for this session"
            }, status=400)
        
        # Build conversation history for summarization
        conversation_text = ""
        for conv in conversations:
            conversation_text += f"User: {conv.user_message}\n"
            conversation_text += f"AI: {conv.ai_response}\n\n"
        
        print(f"[Summary] Built conversation text ({len(conversation_text)} chars)")
        
        # Get ALL emotions from this session and aggregate them
        all_emotions = emotion_data.objects.filter(
            session_id_id=session_id
        ).order_by('created_at')
        
        print(f"[Summary] Found {all_emotions.count()} emotion records")
        
        # Analyze all emotions to determine the dominant emotion for the session
        from ai_guidance.emotion_response_generator import EmotionResponseGenerator
        emotion_analysis = EmotionResponseGenerator.aggregate_session_emotions(all_emotions)
        
        dominant_emotion = emotion_analysis['dominant_emotion']
        avg_intensity = emotion_analysis['average_intensity']
        
        print(f"[Summary] Dominant emotion: {dominant_emotion} (intensity: {avg_intensity})")
        print(f"[Summary] Emotion distribution: {emotion_analysis['emotion_distribution']}")
        
        emotion_context = f"""
        Emotional Analysis of Session:
        - Dominant Emotion: {dominant_emotion} (intensity: {avg_intensity}/10)
        - Total Messages: {emotion_analysis['total_messages']}
        - Emotion Distribution: {', '.join([f"{e}: {d['count']} times ({d['percentage']}%)" for e, d in emotion_analysis['emotion_distribution'].items()])}
        """

        summary_prompt = f"""You are a professional mental health therapist. Analyze this conversation and provide a concise, professional summary.

{emotion_context}

Conversation:
{conversation_text}

Please provide:
1. A brief summary of the main topics discussed (2-3 sentences)
2. Key concerns or issues identified
3. Progress or insights gained
4. Overall emotional state (considering that the dominant emotion throughout this session was {dominant_emotion})
5. Recommended follow-up actions

Keep the summary professional, empathetic, and actionable. Format it in clear paragraphs."""

        summary = None

        # --- Attempt 1: Gemini ---
        if GOOGLE_AI_AVAILABLE and genai is not None:
            try:
                print(f"[Summary] Trying Gemini API...")
                genai.configure(api_key="YOUR_GEMINI_API_KEY", transport='rest')
                gemini_model = genai.GenerativeModel('gemini-2.5-flash-lite')
                gemini_response = gemini_model.generate_content(summary_prompt)
                summary = gemini_response.text
                print(f"[Summary] Gemini succeeded ({len(summary)} chars)")
            except Exception as gemini_err:
                print(f"[Summary] Gemini failed: {gemini_err}")
        else:
            print("[Summary] Gemini package not available; skipping Gemini attempt")

        # --- Attempt 2: Ollama (local) ---
        if not summary:
            try:
                print(f"[Summary] Trying Ollama...")
                import requests as req
                ollama_payload = {
                    "model": "llama3.2:3b",
                    "messages": [{"role": "user", "content": summary_prompt}],
                    "stream": False,
                    "options": {"temperature": 0.4}
                }
                ollama_resp = req.post("http://localhost:11434/api/chat", json=ollama_payload, timeout=60)
                if ollama_resp.status_code == 200:
                    summary = ollama_resp.json().get('message', {}).get('content', '').strip()
                    if summary:
                        print(f"[Summary] Ollama succeeded ({len(summary)} chars)")
            except Exception as ollama_err:
                print(f"[Summary] Ollama failed: {ollama_err}")

        # --- Attempt 3: Rule-based fallback ---
        if not summary:
            print(f"[Summary] Using rule-based fallback summary")
            dist_text = ', '.join([
                f"{e} ({d['count']} times, {d['percentage']}%)"
                for e, d in emotion_analysis['emotion_distribution'].items()
            ])
            critical = {'suicidal', 'self_harm', 'severe_depression', 'panic', 'crisis', 'grief'}
            if dominant_emotion in critical:
                follow_up = "Immediate follow-up is strongly recommended. Please consider reaching out to a licensed mental health professional or crisis support service."
            elif avg_intensity >= 7:
                follow_up = "A follow-up session within the next few days is recommended to monitor emotional wellbeing."
            else:
                follow_up = "Continue practising self-care and monitor your emotional state between sessions."

            summary = (
                f"Session Overview: This {conversations.count()}-message session captured an emotional journey predominantly characterised by {dominant_emotion} "
                f"at an average intensity of {avg_intensity:.1f}/10.\n\n"
                f"Emotional Pattern: Emotion distribution across the session — {dist_text}.\n\n"
                f"Emotional State: The dominant emotion of {dominant_emotion} at intensity {avg_intensity:.1f}/10 "
                f"{'indicates significant distress requiring attention.' if avg_intensity >= 7 else 'suggests moderate emotional engagement.'}\n\n"
                f"Follow-up: {follow_up}"
            )

        print(f"[Summary] Final summary ready ({len(summary)} chars)")
        
        # Update session with summary and dominant emotion (aggregated from all messages)
        session.summary = summary
        session.final_emotion = dominant_emotion
        session.emotion_intensity = int(avg_intensity)
        session.save()
        
        print(f"[Summary] Saved to database")
        
        return Response({
            "session_id": session_id,
            "summary": summary,
            "final_emotion": session.final_emotion,
            "emotion_intensity": session.emotion_intensity,
            "message_count": conversations.count(),
            "session_date": session.date.strftime('%Y-%m-%d'),
            "emotion_analysis": {
                "dominant_emotion": dominant_emotion,
                "total_emotional_data_points": emotion_analysis['total_messages'],
                "emotion_distribution": emotion_analysis['emotion_distribution']
            }
        })
        
    except Exception as e:
        print(f"[Summary ERROR] {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)