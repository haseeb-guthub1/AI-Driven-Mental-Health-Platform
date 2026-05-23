"""
Ollama-Powered Emotion Aggregation Service
Analyzes last 10 emotion logs + journal entry for refined emotion assessment
"""
import requests
import json
from typing import Dict, List, Optional
import re


class OllamaEmotionAnalyzer:
    """Analyze emotion trends using Ollama Llama model"""
    
    def __init__(self, model_name: str = "llama3.2:3b", ollama_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_url = ollama_url
        self.api_endpoint = f"{ollama_url}/api/chat"
        
    def _build_analysis_prompt(self, emotions: List[Dict], journal_entry: Optional[str] = None) -> str:
        """
        Build comprehensive prompt for Ollama emotion analysis
        
        Args:
            emotions: List of last 10 emotion records with emotion, intensity, timestamp
            journal_entry: Optional latest journal entry text
        """
        # Format emotion history
        emotion_list = []
        for idx, emo in enumerate(emotions, 1):
            emotion_list.append(
                f"{idx}. {emo['emotion']} (Intensity: {emo['intensity']}/10) - {emo['created_at']}"
            )
        
        emotion_history = "\n".join(emotion_list)
        
        # Build system prompt
        system_prompt = f"""You are an expert mental health assistant with training in emotion analysis and psychological assessment.

**TASK:** Analyze the following emotion data to determine the user's dominant emotional state.

**RECENT EMOTION HISTORY (Last 10 entries):**
{emotion_history}
"""
        
        if journal_entry:
            system_prompt += f"""
**LATEST JOURNAL ENTRY:**
"{journal_entry}"
"""
        
        system_prompt += """
**ANALYSIS REQUIREMENTS:**
1. Identify the dominant "Final Emotion" considering both frequency and recency
2. If emotions conflict (e.g., "Grief" in logs but "Hope" in journal), provide balanced assessment
3. Assign a refined intensity score (1-10) based on overall emotional trajectory
4. Provide a brief, empathetic recommendation (2-3 sentences maximum)
5. Estimate your confidence in this assessment (0.0 to 1.0)

**CRITICAL EMOTION PRIORITY:**
If any of these appear: grief, severe depression, suicidal, crisis, panic - they must be weighted heavily.

**OUTPUT FORMAT (JSON only, no other text):**
{
  "final_emotion": "dominant_emotion",
  "intensity": 7,
  "recommendation": "Brief empathetic guidance here",
  "confidence": 0.85,
  "analysis_notes": "Short explanation of reasoning"
}

Respond with valid JSON only."""
        
        return system_prompt
    
    def analyze_emotions(self, emotions: List[Dict], journal_entry: Optional[str] = None) -> Dict:
        """
        Send emotion data to Ollama for analysis
        
        Returns:
            {
                "final_emotion": str,
                "intensity": int,
                "recommendation": str,
                "confidence": float,
                "analysis_notes": str
            }
        """
        if not emotions:
            return {
                "final_emotion": "neutral",
                "intensity": 5,
                "recommendation": "No emotion data available for analysis. Begin tracking your emotions to receive personalized insights.",
                "confidence": 0.0,
                "analysis_notes": "Insufficient data"
            }
        
        print(f"[OLLAMA-ANALYZER] Analyzing {len(emotions)} emotion records...")
        
        try:
            # Build prompt
            prompt = self._build_analysis_prompt(emotions, journal_entry)
            
            # Call Ollama API
            payload = {
                "model": self.model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "stream": False,
                "format": "json",  # Request JSON response
                "options": {
                    "temperature": 0.3,  # Lower temperature for more consistent analysis
                    "top_p": 0.9
                }
            }
            
            print(f"[OLLAMA-ANALYZER] Sending request to {self.api_endpoint}...")
            
            response = requests.post(
                self.api_endpoint,
                json=payload,
                timeout=60  # 60 second timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get('message', {}).get('content', '{}')
                
                print(f"[OLLAMA-ANALYZER] Raw response: {content[:200]}...")
                
                # Parse JSON response
                try:
                    analysis = json.loads(content)
                    
                    # Validate and normalize response
                    final_emotion = analysis.get('final_emotion', 'neutral').lower()
                    intensity = int(analysis.get('intensity', 5))
                    intensity = max(1, min(10, intensity))  # Clamp between 1-10
                    
                    recommendation = analysis.get('recommendation', 'Continue your wellness journey with regular self-reflection.')
                    confidence = float(analysis.get('confidence', 0.5))
                    confidence = max(0.0, min(1.0, confidence))  # Clamp between 0-1
                    
                    analysis_notes = analysis.get('analysis_notes', '')
                    
                    print(f"[OLLAMA-ANALYZER] ✓ Analysis complete:")
                    print(f"[OLLAMA-ANALYZER]   - Final Emotion: {final_emotion}")
                    print(f"[OLLAMA-ANALYZER]   - Intensity: {intensity}/10")
                    print(f"[OLLAMA-ANALYZER]   - Confidence: {confidence:.2f}")
                    print(f"[OLLAMA-ANALYZER]   - Notes: {analysis_notes}")
                    
                    return {
                        "final_emotion": final_emotion,
                        "intensity": intensity,
                        "recommendation": recommendation,
                        "confidence": confidence,
                        "analysis_notes": analysis_notes
                    }
                    
                except json.JSONDecodeError as e:
                    print(f"[OLLAMA-ANALYZER] ✗ JSON parse error: {e}")
                    # Fallback to text parsing
                    return self._fallback_parse(content, emotions)
                    
            else:
                print(f"[OLLAMA-ANALYZER] ✗ API error: {response.status_code}")
                return self._fallback_analysis(emotions)
                
        except requests.exceptions.RequestException as e:
            print(f"[OLLAMA-ANALYZER] ✗ Connection error: {e}")
            return self._fallback_analysis(emotions)
        except Exception as e:
            print(f"[OLLAMA-ANALYZER] ✗ Unexpected error: {e}")
            return self._fallback_analysis(emotions)
    
    def _fallback_parse(self, content: str, emotions: List[Dict]) -> Dict:
        """Attempt to extract JSON from malformed response"""
        try:
            # Try to find JSON object in response
            match = re.search(r'\{[^{}]*"final_emotion"[^{}]*\}', content, re.DOTALL)
            if match:
                analysis = json.loads(match.group())
                return {
                    "final_emotion": analysis.get('final_emotion', 'neutral').lower(),
                    "intensity": int(analysis.get('intensity', 5)),
                    "recommendation": analysis.get('recommendation', ''),
                    "confidence": float(analysis.get('confidence', 0.5)),
                    "analysis_notes": "Parsed from text response"
                }
        except:
            pass
        
        return self._fallback_analysis(emotions)
    
    def _fallback_analysis(self, emotions: List[Dict]) -> Dict:
        """
        Rule-based fallback if Ollama is unavailable
        Uses simple frequency and recency weighting
        """
        print("[OLLAMA-ANALYZER] Using rule-based fallback analysis")
        
        if not emotions:
            return {
                "final_emotion": "neutral",
                "intensity": 5,
                "recommendation": "No emotion data available.",
                "confidence": 0.3,
                "analysis_notes": "Fallback: Insufficient data"
            }
        
        # Count emotion frequencies, weight recent emotions more
        emotion_scores = {}
        for idx, emo in enumerate(emotions):
            emotion = emo['emotion'].lower()
            intensity = emo['intensity']
            
            # Recent emotions get higher weight (reverse index)
            recency_weight = (len(emotions) - idx) / len(emotions)
            score = intensity * recency_weight
            
            emotion_scores[emotion] = emotion_scores.get(emotion, 0) + score
        
        # Find dominant emotion
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        avg_intensity = int(sum(e['intensity'] for e in emotions) / len(emotions))
        
        # Latest emotion
        latest = emotions[0]
        print(f"[OLLAMA-ANALYZER] Fallback dominant emotion: {dominant_emotion} (Score: {emotion_scores[dominant_emotion]:.2f})")
        return {
            "final_emotion": dominant_emotion,  # Use dominant emotion
            "intensity": latest['intensity'],
            "recommendation": f"Based on recent patterns, your emotional state shows {dominant_emotion}. Continue self-monitoring and reach out for support if needed.",
            "confidence": 0.6,
            "analysis_notes": f"Fallback analysis - Ollama unavailable. Dominant: {dominant_emotion}"
        }