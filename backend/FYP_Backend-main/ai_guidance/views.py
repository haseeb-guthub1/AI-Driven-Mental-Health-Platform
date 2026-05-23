import warnings
warnings.filterwarnings('ignore', category=FutureWarning)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import ai_guidance
from .serializers import AIGuidanceSerializer
from .transformers_classifier import TransformersEmotionClassifier  # 87.5% accuracy!
from .emotion_response_generator import EmotionResponseGenerator  # Template-based response system
from .ollama_response_generator import OllamaResponseGenerator  # Ollama Llama 3.2:3b integration
from .sarcasm_detector import SarcasmDetector  # Sarcasm detection layer
from emotion_data.models import emotion_data
import time
import random
import os

# Configuration: Switch between response generation modes
# Set to 'ollama' to use Llama 3.2:3b, 'template' for rule-based responses
RESPONSE_MODE = os.environ.get('AI_RESPONSE_MODE', 'ollama')  # Default to Ollama

# Initialize components once (singleton pattern)
_transformer_classifier = None
_emotion_response_generator = None
_ollama_response_generator = None
_sarcasm_detector = None

def get_transformer_emotion_classifier():
    """Get or create the transformer emotion classifier instance"""
    global _transformer_classifier
    if _transformer_classifier is None:
        _transformer_classifier = TransformersEmotionClassifier()
    return _transformer_classifier

def get_emotion_response_generator():
    """Get or create the emotion response generator instance"""
    global _emotion_response_generator
    if _emotion_response_generator is None:
        _emotion_response_generator = EmotionResponseGenerator()
    return _emotion_response_generator

def get_ollama_response_generator():
    """Get or create the Ollama response generator instance"""
    global _ollama_response_generator
    if _ollama_response_generator is None:
        _ollama_response_generator = OllamaResponseGenerator(
            model_name="llama3.2:3b",
            ollama_url="http://localhost:11434"
        )
    return _ollama_response_generator

def get_sarcasm_detector():
    """Get or create the sarcasm detector instance"""
    global _sarcasm_detector
    if _sarcasm_detector is None:
        _sarcasm_detector = SarcasmDetector()
    return _sarcasm_detector   

@api_view(['GET','POST'])
@permission_classes([AllowAny])
def aiguidance_list_create(request):
    if request.method == 'GET':
        # Return history
        client_id = request.query_params.get('client_id')
        
        if client_id:
            # 2. Only fetch messages belonging to this user
            guidances = ai_guidance.objects.filter(client_id_id=client_id).order_by('created_at')
        else:
            # Fallback if no ID is provided (optional: return empty list)
            guidances = ai_guidance.objects.none()
            
        serializer = AIGuidanceSerializer(guidances, many=True)
        return Response(serializer.data)
    if request.method == 'POST':
        try:
            user_message = request.data.get('user_message')
            client_id = request.data.get('client_id')
            session_id = request.data.get('session_id')
            
            print(f"[DEBUG] User message: {user_message}")
            
            if not user_message:
                return Response({"error": "No message provided"}, status=400)
            
            # === GET CONVERSATION HISTORY (Last 5 messages for context) ===
            recent_messages = ai_guidance.objects.filter(
                client_id_id=client_id,
                session_id_id=session_id
            ).order_by('-created_at')[:5]
            
            conversation_history = []
            for msg in reversed(recent_messages):  # Oldest first
                conversation_history.append(f"User: {msg.user_message}")
                conversation_history.append(f"AI: {msg.ai_response}")
            
            conversation_context = "\n".join(conversation_history) if conversation_history else "No previous conversation."
            print(f"[CONTEXT] Using {len(recent_messages)} previous messages for context")
            
            # === TRANSFORMER MODEL (87.5% Accuracy - RoBERTa) ===
            classifier = get_transformer_emotion_classifier()
            emotion_result = classifier.predict(user_message)
            
            # === SARCASM DETECTION (Adjust misclassified emotions) ===
            sarcasm_detector = get_sarcasm_detector()
            is_sarcastic, sarcasm_confidence, sarcasm_reason = sarcasm_detector.detect(user_message)
            
            original_emotion = emotion_result['emotion']
            detected_emotion = original_emotion
            
            if is_sarcastic and sarcasm_confidence >= 0.7:
                adjusted_emotion, adjustment_reason = sarcasm_detector.adjust_emotion(
                    original_emotion,
                    emotion_result['confidence'],
                    is_sarcastic,
                    sarcasm_confidence
                )
                detected_emotion = adjusted_emotion
                print(f"[SARCASM] Detected! Confidence: {sarcasm_confidence:.0%}")
                print(f"[SARCASM] {sarcasm_reason}")
                print(f"[SARCASM] Emotion adjusted: {original_emotion} → {adjusted_emotion}")
                print(f"[SARCASM] Reason: {adjustment_reason}")
                
                # Update emotion_result with adjusted emotion
                emotion_result['emotion'] = adjusted_emotion
                emotion_result['original_emotion'] = original_emotion
                emotion_result['sarcasm_detected'] = True
                emotion_result['sarcasm_confidence'] = sarcasm_confidence
                emotion_result['adjustment_reason'] = adjustment_reason
            else:
                emotion_result['sarcasm_detected'] = False
                if is_sarcastic:
                    print(f"[SARCASM] Possible sarcasm detected (confidence: {sarcasm_confidence:.0%}) - below threshold, not adjusting")
            
            # Add risk assessment
            detected_emotion = emotion_result['emotion']
            confidence = emotion_result['confidence']
            
            # Calculate intensity (1-10)
            intensity = max(1, min(10, int(confidence * 10)))
            
            high_risk_emotions = ['grief', 'sadness', 'fear', 'anger', 'disappointment', 'nervousness', 'remorse']
            critical_emotions = ['grief']
            
            if detected_emotion in critical_emotions and confidence > 0.7:
                risk_level = 'critical'
                intervention_required = True
            elif detected_emotion in high_risk_emotions and confidence > 0.7:
                risk_level = 'high'
                intervention_required = False
            elif detected_emotion in high_risk_emotions and confidence > 0.5:
                risk_level = 'medium'
                intervention_required = False
            else:
                risk_level = 'low'
                intervention_required = False
            
            # Check for critical keywords from transformer
            if emotion_result.get('intervention_needed') or emotion_result.get('critical_keyword'):
                intervention_required = True
                risk_level = 'critical'
            
            # Determine tone and approach
            tone_map = {
                'joy': 'warm and celebratory',
                'sadness': 'empathetic and gentle',
                'anger': 'calm and validating',
                'fear': 'reassuring and supportive',
                'love': 'warm and affirming',
                'surprise': 'curious and engaged',
                'disgust': 'validating and non-judgmental',
                'grief': 'deeply compassionate',
                'relief': 'warm and encouraging',
                'gratitude': 'warm and appreciative',
                'optimism': 'supportive and enthusiastic',
                'excitement': 'energetic and celebratory',
                'admiration': 'warm and validating',
                'pride': 'celebratory and supportive',
            }
            tone = tone_map.get(detected_emotion, 'supportive and professional')
            
            approach_map = {
                'grief': 'crisis intervention',
                'sadness': 'active listening and CBT',
                'anger': 'emotion regulation',
                'fear': 'anxiety reduction',
                'nervousness': 'grounding techniques',
                'relief': 'positive reinforcement',
                'joy': 'positive psychology',
                'gratitude': 'mindfulness and reflection',
                'excitement': 'energy channeling',
            }
            approach = approach_map.get(detected_emotion, 'supportive conversation')
            
            # Add to emotion_result
            emotion_result['intensity'] = intensity
            emotion_result['risk_level'] = risk_level
            emotion_result['intervention_required'] = intervention_required
            emotion_result['tone'] = tone
            emotion_result['approach'] = approach
            
            print(f"[TRANSFORMER] {emotion_result['emotion']} | Confidence: {emotion_result['confidence']:.2%} | Intensity: {intensity}/10 | Risk: {risk_level}")
            
            if intervention_required:
                print(f"⚠️⚠️⚠️ [CRITICAL ALERT] CRISIS DETECTED - {emotion_result['emotion']} ⚠️⚠️⚠️")
            
            # Save emotion to emotion_data table
            emotion_record = emotion_data.objects.create(
                client_id_id=client_id,
                session_id_id=session_id,
                emotion=emotion_result['emotion'],
                intensity=emotion_result['intensity'],
                notes=f"AI detected: {emotion_result['emotion']} | Risk: {emotion_result['risk_level']} | Confidence: {emotion_result['confidence']*100:.0f}%"
            )
            
            # === GENERATE RESPONSE BASED ON EMOTION DETECTION ===
            # Convert conversation history to list format
            history_list = []
            for msg in reversed(recent_messages):
                history_list.append(f"User: {msg.user_message}")
                history_list.append(f"AI: {msg.ai_response}")
            
            print(f"[AI-COACH] Generating response for {emotion_result['emotion']} (intensity: {emotion_result['intensity']}/10, risk: {emotion_result['risk_level']})")
            print(f"[AI-COACH] Using response mode: {RESPONSE_MODE}")
            
            # Generate response based on configured mode
            if RESPONSE_MODE == 'ollama':
                # Use Ollama Llama 3.2:3b for generation
                try:
                    ollama_generator = get_ollama_response_generator()
                    ollama_result = ollama_generator.generate_response(
                        emotion=emotion_result['emotion'],
                        user_message=user_message,
                        intensity=emotion_result['intensity'],
                        risk_level=emotion_result['risk_level'],
                        conversation_history=history_list
                    )
                    
                    if ollama_result['success']:
                        ai_response = ollama_result['response']
                        response_source = f"Ollama ({ollama_result['model']})"
                        print(f"[OLLAMA] ✓ Response generated ({ollama_result.get('generation_time', 0):.2f}s)")
                    else:
                        # Fallback was used
                        ai_response = ollama_result['response']
                        response_source = f"Fallback (Ollama unavailable: {ollama_result.get('error', 'unknown')})"
                        print(f"[OLLAMA] ⚠ Using fallback response")
                        
                except Exception as e:
                    # If Ollama completely fails, use template-based as emergency fallback
                    print(f"[OLLAMA] ✗ Error: {e} - Falling back to template-based generation")
                    template_generator = get_emotion_response_generator()
                    ai_response = template_generator.generate_response(
                        emotion=emotion_result['emotion'],
                        user_message=user_message,
                        intensity=emotion_result['intensity'],
                        risk_level=emotion_result['risk_level'],
                        conversation_history=history_list
                    )
                    response_source = "Template-based (Emergency fallback)"
            else:
                # Use template-based response generator
                template_generator = get_emotion_response_generator()
                ai_response = template_generator.generate_response(
                    emotion=emotion_result['emotion'],
                    user_message=user_message,
                    intensity=emotion_result['intensity'],
                    risk_level=emotion_result['risk_level'],
                    conversation_history=history_list
                )
                response_source = "Template-based"
                print(f"[TEMPLATE] Response generated using rule-based system")
            
            print(f"[AI-COACH] Response generated successfully using: {response_source}")

            # Save to database with detected emotion
            guidance_obj = ai_guidance.objects.create(
                client_id_id=client_id,
                session_id_id=session_id, 
                emotion_id=emotion_record,
                user_message=user_message,
                ai_response=ai_response,
                suggestion=f"Risk: {emotion_result['risk_level']} | Approach: {emotion_result['approach']}"
            )
            
            print(f"[DB] Saved guidance #{guidance_obj.guidance_id}")
            
            # Return response with enhanced emotion data
            return Response({
                "response": ai_response,
                "emotion_detected": {
                    "emotion": emotion_result['emotion'],
                    "confidence": emotion_result['confidence'],
                    "intensity": emotion_result['intensity'],
                    "risk_level": emotion_result['risk_level'],
                    "approach": emotion_result['approach'],
                    "tone": emotion_result['tone'],
                    "requires_immediate_intervention": emotion_result.get('intervention_required', False),
                    "all_emotions": emotion_result.get('all_emotions', []),
                    "reasoning": emotion_result.get('reasoning', ''),
                    "model": f"Emotion Detection: Fine-tuned BERT | Response: {response_source}",
                    "response_source": response_source,
                    "response_mode": RESPONSE_MODE
                },
                "guidance_id": guidance_obj.guidance_id
            })

        except Exception as e:
            print(f"--- ERROR --- \n{e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def aiguidance_detail(request, pk):
    item = get_object_or_404(ai_guidance, pk=pk)
    
    if request.method == 'GET':
        serializer = AIGuidanceSerializer(item)
        return Response(serializer.data)
        
    elif request.method == 'PUT':
        serializer = AIGuidanceSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def chat_messages_by_session(request):
    """
    Fetch all chat messages for a specific session
    Query params: session_id
    """
    session_id = request.query_params.get('session_id')
    
    if not session_id:
        return Response({"error": "session_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    from .models import ChatMessage
    from .serializers import ChatMessageSerializer
    
    messages = ChatMessage.objects.filter(session_id=session_id).order_by('timestamp')
    serializer = ChatMessageSerializer(messages, many=True)
    
    return Response(serializer.data)


# ========== MANDATORY COACHING & RISK ASSESSMENT ENDPOINTS ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def check_mandatory_coaching_lock(request):
    """
    Check if user is locked out and requires mandatory coach assignment
    Query params: client_id
    """
    from .risk_assessment_service import RiskAssessmentService
    
    client_id = request.query_params.get('client_id')
    
    if not client_id:
        return Response(
            {"error": "client_id is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        lock_status = RiskAssessmentService.check_mandatory_coaching_status(client_id)
        return Response(lock_status, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"[RISK CHECK ERROR] {str(e)}")
        return Response(
            {"error": f"Failed to check lock status: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def assign_coach_to_client(request):
    """
    Assign a coach to a client to unlock their dashboard
    """
    from coach_client.models import coach_client
    from human_coach.models import human_coach
    from client.models import client
    from django.utils import timezone
    
    client_id = request.data.get('client_id')
    coach_id = request.data.get('coach_id')
    
    if not client_id or not coach_id:
        return Response(
            {"error": "Both client_id and coach_id are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        client_obj = get_object_or_404(client, client_id=client_id)
        coach_obj = get_object_or_404(human_coach, coach_id=coach_id)
        
        existing_assignment = coach_client.objects.filter(
            client_id=client_id,
            coach_id=coach_id
        ).first()
        
        if existing_assignment:
            existing_assignment.status = 'active'
            existing_assignment.save()
            
            return Response({
                "success": True,
                "message": "Coach assignment reactivated",
                "assignment_id": existing_assignment.coach_client_id,
                "is_locked": False
            }, status=status.HTTP_200_OK)
        
        new_assignment = coach_client.objects.create(
            client_id=client_obj,
            coach_id=coach_obj,
            assigned_date=timezone.now().date(),
            status='active'
        )
        
        return Response({
            "success": True,
            "message": "Coach assigned successfully",
            "assignment_id": new_assignment.coach_client_id,
            "is_locked": False
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"[COACH ASSIGNMENT ERROR] {str(e)}")
        return Response(
            {"error": f"Failed to assign coach: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_coaches(request):
    """
    Get list of available human coaches for assignment
    """
    from human_coach.models import human_coach
    from human_coach.serializers import HumanCoachSerializer
    
    try:
        coaches = human_coach.objects.filter(is_approved=True)
        serializer = HumanCoachSerializer(coaches, many=True)
        
        return Response({
            "coaches": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"[GET COACHES ERROR] {str(e)}")
        return Response(
            {"error": f"Failed to fetch coaches: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )