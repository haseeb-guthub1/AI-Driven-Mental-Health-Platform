"""
Ollama-Powered AI Coach Response Generator
Uses local Llama 3.2:3b model for generating empathetic, context-aware responses
Based on emotion detection from fine-tuned model
"""
import requests
import json
from typing import Dict, List, Optional


class OllamaResponseGenerator:
    """Generate AI coach responses using Ollama's local Llama model"""
    
    def __init__(self, model_name: str = "llama3.2:3b", ollama_url: str = "http://localhost:11434"):
        """
        Initialize Ollama Response Generator
        
        Args:
            model_name: Name of the Ollama model to use (default: llama3.2:3b)
            ollama_url: Base URL for Ollama API (default: http://localhost:11434)
        """
        self.model_name = model_name
        self.ollama_url = ollama_url
        self.api_endpoint = f"{ollama_url}/api/chat"
        
        # Verify Ollama is running
        self._verify_ollama_connection()
    
    def _verify_ollama_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                print(f"[OLLAMA] ✓ Connected to Ollama at {self.ollama_url}")
                models = response.json().get('models', [])
                model_names = [m.get('name') for m in models]
                if self.model_name in model_names:
                    print(f"[OLLAMA] ✓ Model '{self.model_name}' is available")
                else:
                    print(f"[OLLAMA] ⚠ Warning: Model '{self.model_name}' not found. Available: {model_names}")
                return True
            return False
        except requests.exceptions.RequestException as e:
            print(f"[OLLAMA] ✗ Cannot connect to Ollama: {e}")
            print(f"[OLLAMA] Make sure Ollama is running: 'ollama serve'")
            return False
    
    def _build_system_prompt(self, emotion: str, intensity: int, risk_level: str, 
                            conversation_history: List[str] = None) -> str:
        """
        Build concise system prompt for the AI coach (optimized for speed)
        
        Args:
            emotion: Detected emotion (from your fine-tuned model)
            intensity: Emotion intensity 1-10
            risk_level: Risk assessment (low, medium, high, critical)
            conversation_history: Previous conversation for context
            
        Returns:
            System prompt string
        """
        # Concise base prompt
        system_prompt = (
            f"You are an empathetic AI Mental Health Coach. "
            f"The user is feeling {emotion} (intensity: {intensity}/10, risk: {risk_level}). "
        )
        
        # Emotion-specific approach (shortened)
        emotion_guidance = {
            'sadness': "Be gentle and validating. Offer hope.",
            'joy': "Match their positive energy! Celebrate.",
            'anger': "Stay calm, validate, help them feel heard.",
            'fear': "Be reassuring. Focus on what they can control.",
            'anxiety': "Use calming language. Offer grounding techniques.",
            'nervousness': "Normalize the feeling. Offer practical strategies.",
            'grief': "Be deeply compassionate. Provide space.",
            'relief': "Acknowledge their relief positively. Support their positive shift.",
            'gratitude': "Share their appreciation. Encourage reflection.",
            'optimism': "Encourage and support their positive outlook.",
            'neutral': "Be warm and supportive.",
            'confusion': "Help clarify patiently.",
            'disappointment': "Validate their feelings. Help reframe.",
            'excitement': "Match their energy! Encourage their enthusiasm.",
            'love': "Acknowledge warmly. Support healthy connections.",
            'admiration': "Validate their positive feelings.",
            'pride': "Celebrate their achievement!",
        }
        
        guidance = emotion_guidance.get(emotion.lower(), "Be supportive and empathetic.")
        system_prompt += guidance + " "
        
        # Risk-specific instructions
        if risk_level in ['critical', 'high']:
            system_prompt += "This person needs extra care and validation. "
        
        # Add brief context if available (limit to last 2 exchanges only)
        if conversation_history and len(conversation_history) > 0:
            recent = conversation_history[-2:] if len(conversation_history) > 2 else conversation_history
            if recent:
                system_prompt += f"Recent context: {' | '.join(recent)}. "
        
        # Core guidelines (simplified)
        system_prompt += (
            # "Respond with: 1) Brief validation (1-2 sentences), "
            # "2) Empathetic guidance (2-3 sentences), "
            # "3) ONE follow-up question. Be warm, natural, and conversational. Keep it concise."
            "Respond in MAXIMUM 4 lines only. "
            "Each line must be short (under 12 words). "
            "Include: validation, brief guidance, and one short question. "
            "No extra explanation, no paragraphs, no long sentences."
        )
        
        return system_prompt
    
    def generate_response(self, emotion: str, user_message: str, intensity: int, 
                         risk_level: str, conversation_history: List[str] = None,
                         timeout: int = 90) -> Dict[str, any]:
        """
        Generate AI coach response using Ollama
        
        Args:
            emotion: Detected emotion from fine-tuned model
            user_message: User's original message
            intensity: Emotion intensity (1-10)
            risk_level: Risk assessment (low, medium, high, critical)
            conversation_history: Previous conversation for context
            timeout: Request timeout in seconds
            
        Returns:
            Dictionary with 'response' and metadata
        """
        try:
            # Build the system prompt with all context
            system_prompt = self._build_system_prompt(
                emotion=emotion,
                intensity=intensity,
                risk_level=risk_level,
                conversation_history=conversation_history
            )
            
            # Prepare the payload for Ollama
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "stream": False,
                # "options": {
                #     "temperature": 0.7,
                #     "top_p": 0.9,
                #     "num_predict": 60,  # Limit response length for speed
                # }
                "options": {
                    "temperature": 0.3,          # more controlled output
                    "top_p": 0.8,
                    "num_predict": 60,           # ~40–70 words max
                    "stop": ["\n\n", "User:", "Assistant:"]
                }
            }
            
            print(f"[OLLAMA] Sending request to Llama 3.2:3b...")
            print(f"[OLLAMA] Emotion: {emotion} | Intensity: {intensity}/10 | Risk: {risk_level}")
            print(f"[OLLAMA] System prompt length: {len(system_prompt)} chars")
            print(f"[OLLAMA] Timeout: {timeout}s")
            
            # Make the API call
            response = requests.post(
                self.api_endpoint,
                json=payload,
                timeout=timeout
            )
            
            response.raise_for_status()
            
            # Parse the response
            result = response.json()
            ai_response_text = result.get('message', {}).get('content', '')
            
            if not ai_response_text:
                raise ValueError("Empty response from Ollama")
            
            print(f"[OLLAMA] ✓ Response generated successfully ({len(ai_response_text)} chars)")
            
            # Add crisis resources if needed
            if risk_level == 'critical':
                ai_response_text += (
                    "\n\n🆘 **If you're in immediate crisis:**\n"
                    "📞 National Suicide Prevention Lifeline: **988**\n"
                    "💬 Crisis Text Line: Text **'HELLO'** to **741741**\n"
                    "🌐 International: https://findahelpline.com"
                )
            elif risk_level == 'high' and intensity >= 8:
                ai_response_text += (
                    "\n\n💙 Remember, you don't have to go through this alone. "
                    "If things feel overwhelming, crisis support is available 24/7 at 988."
                )
            
            return {
                'success': True,
                'response': ai_response_text,
                'model': self.model_name,
                'emotion_used': emotion,
                'intensity': intensity,
                'risk_level': risk_level,
                'tokens_used': result.get('eval_count', 0),
                'generation_time': result.get('total_duration', 0) / 1e9  # Convert to seconds
            }
            
        except requests.exceptions.Timeout:
            print(f"[OLLAMA] ✗ Request timeout after {timeout}s")
            return self._fallback_response(emotion, intensity, risk_level, "timeout")
        
        except requests.exceptions.RequestException as e:
            print(f"[OLLAMA] ✗ Request error: {e}")
            return self._fallback_response(emotion, intensity, risk_level, "connection_error")
        
        except Exception as e:
            print(f"[OLLAMA] ✗ Unexpected error: {e}")
            return self._fallback_response(emotion, intensity, risk_level, "unexpected_error")
    
    def _fallback_response(self, emotion: str, intensity: int, risk_level: str, 
                          error_type: str) -> Dict[str, any]:
        """
        Provide a safe fallback response if Ollama fails
        
        Args:
            emotion: Detected emotion
            intensity: Emotion intensity
            risk_level: Risk level
            error_type: Type of error that occurred
            
        Returns:
            Dictionary with fallback response
        """
        print(f"[OLLAMA] Using fallback response due to: {error_type}")
        
        # Simple emotion-based fallback responses
        fallback_responses = {
            'sadness': "I hear that you're going through a difficult time. Your feelings are valid, and I'm here to listen. What's been weighing on your mind?",
            'joy': "That's wonderful! I'm glad to hear things are going well for you. What brought about this positive change?",
            'anger': "I understand you're feeling frustrated. That's a valid emotion. What's at the heart of this frustration?",
            'fear': "I can sense your worry. Your concerns are real and valid. What specific worries are on your mind?",
            'anxiety': "I understand you're feeling anxious. Let's take this one step at a time. What's your biggest concern right now?",
            'nervousness': "I can sense your nervousness. That's completely normal when facing something challenging. What's making you feel most nervous right now?",
            'grief': "I'm deeply sorry for what you're going through. Grief is incredibly difficult. Would you like to talk about it?",
            'neutral': "I'm here to listen and support you. What's on your mind today? How can I help?",
            'confusion': "It's okay to feel uncertain. Let's work through this together. What feels most unclear to you?",
        }
        
        response_text = fallback_responses.get(
            emotion.lower(),
            f"I'm here to support you. Thank you for sharing. What would you like to focus on today?"
        )
        
        # Add crisis resources for high-risk situations
        if risk_level == 'critical':
            response_text += (
                "\n\n🆘 **If you're in immediate crisis:**\n"
                "📞 National Suicide Prevention Lifeline: **988**\n"
                "💬 Crisis Text Line: Text **'HELLO'** to **741741**"
            )
        
        return {
            'success': False,
            'response': response_text,
            'model': 'fallback',
            'emotion_used': emotion,
            'intensity': intensity,
            'risk_level': risk_level,
            'error': error_type
        }
    
    def test_connection(self) -> Dict[str, any]:
        """
        Test Ollama connection and model availability
        
        Returns:
            Dictionary with connection status
        """
        try:
            # Test basic connection
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            response.raise_for_status()
            
            models = response.json().get('models', [])
            model_names = [m.get('name') for m in models]
            
            is_model_available = self.model_name in model_names
            
            return {
                'connected': True,
                'ollama_url': self.ollama_url,
                'model_name': self.model_name,
                'model_available': is_model_available,
                'available_models': model_names,
                'status': 'ready' if is_model_available else 'model_not_found'
            }
            
        except Exception as e:
            return {
                'connected': False,
                'ollama_url': self.ollama_url,
                'model_name': self.model_name,
                'error': str(e),
                'status': 'connection_failed',
                'message': 'Make sure Ollama is running: ollama serve'
            }


# Convenience function for quick testing
def test_ollama_integration():
    """Test the Ollama integration"""
    print("=" * 60)
    print("OLLAMA INTEGRATION TEST")
    print("=" * 60)
    
    generator = OllamaResponseGenerator()
    
    # Test connection
    print("\n1. Testing connection...")
    conn_status = generator.test_connection()
    print(json.dumps(conn_status, indent=2))
    
    if not conn_status['connected']:
        print("\n❌ Ollama is not running or not accessible")
        print("Please start Ollama: 'ollama serve'")
        return
    
    # Test response generation
    print("\n2. Testing response generation...")
    test_result = generator.generate_response(
        emotion="anxiety",
        user_message="I'm really worried about my job interview tomorrow. I can't stop thinking about all the things that could go wrong.",
        intensity=7,
        risk_level="medium",
        conversation_history=None
    )
    
    print(f"\n{'='*60}")
    print("GENERATED RESPONSE:")
    print(f"{'='*60}")
    print(test_result['response'])
    print(f"\n{'='*60}")
    print("METADATA:")
    print(json.dumps({k: v for k, v in test_result.items() if k != 'response'}, indent=2))
    print(f"{'='*60}")


if __name__ == "__main__":
    test_ollama_integration()
