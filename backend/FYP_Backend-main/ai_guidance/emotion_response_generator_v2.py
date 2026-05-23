"""
Cognitive AI Coach - Response Generator
Generates intelligent, context-aware responses based on user intent and emotional state
"""
import re
from typing import Dict, List, Tuple, Optional

class EmotionResponseGenerator:
    """Generate empathetic, actionable responses using Acknowledge-Address-Action framework"""
    
    def __init__(self):
        self.action_strategies = self._initialize_action_strategies()
        self.crisis_resources = self._get_crisis_resources()
    
    def _classify_intent(self, user_message: str) -> Tuple[str, float]:
        """
        Classify user's intent using linguistic patterns (not keywords alone)
        Returns: (intent_type, confidence_score)
        """
        msg = user_message.lower().strip()
        msg_len = len(msg.split())
        
        # Handle very short/ambiguous inputs
        if msg_len <= 2 or len(msg) <= 5:
            return ('unclear', 0.3)
        
        # Question patterns (seeking help/advice)
        question_patterns = [
            r'\b(how|what|why|when|where|can|could|should|would)\b.*\?',
            r'\b(how do i|how can i|how would i|what should i|help me|show me)\b',
            r'\b(steps? to|ways? to|tips? for|advice|strategies|techniques)\b',
            r'\b(improve|overcome|manage|handle|deal with|cope|fix|solve)\b',
            r'\b(struggling with|having trouble|dont know|unsure|confused about)\b'
        ]
        
        if any(re.search(pattern, msg) for pattern in question_patterns):
            # Strong intent for actionable advice
            return ('seeking_advice', 0.9 if '?' in msg or 'how' in msg else 0.8)
        
        # Sharing/venting patterns (emotional expression)
        sharing_patterns = [
            r'\b(i feel|i am|im|i\'m|feeling|felt)\b',
            r'\b(just|today|right now|lately|recently)\b',
            r'\b(my|me|i)\b.*\b(is|was|been|have|has)\b'
        ]
        
        sharing_count= sum(1 for pattern in sharing_patterns if re.search(pattern, msg))
        if sharing_count >= 2:
            return ('sharing_emotion', 0.7)
        
        # Crisis indicators (immediate support needed)
        crisis_patterns = [
            r'\b(want to die|kill myself|suicide|end it|cant go on|no point)\b',
            r'\b(harm myself|hurt myself|cutting|self.?harm)\b'
        ]
        
        if any(re.search(pattern, msg) for pattern in crisis_patterns):
            return ('crisis', 1.0)
        
        # Informational (wants to understand)
        info_patterns = [
            r'\b(what is|define|meaning of|explain|tell me about)\b',
            r'\b(is it|does it|will it|can it)\b.*\?'
        ]
        
        if any(re.search(pattern, msg) for pattern in info_patterns):
            return ('seeking_information', 0.8)
        
        # Default: emotional sharing if nothing else matches
        return ('sharing_emotion', 0.6)
    
    def _extract_context(self, user_message: str) -> Dict[str, any]:
        """Extract contextual elements from user message"""
        msg = user_message.lower()
        
        return {
            # Life domains
            'work': any(w in msg for w in ['work', 'job', 'boss', 'career', 'office', 'colleague', 'coworker', 'meeting', 'deadline', 'project']),
            'relationships': any(w in msg for w in ['relationship', 'partner', 'spouse', 'boyfriend', 'girlfriend', 'husband', 'wife', 'friend', 'family', 'parent', 'sibling']),
            'social': any(w in msg for w in ['social', 'people', 'crowd', 'public', 'party', 'gathering', 'presentation', 'speaking', 'strangers', 'anxiety']),
            'health': any(w in msg for w in ['health', 'sick', 'pain', 'doctor', 'medical', 'hospital', 'illness', 'diagnosis', 'symptoms']),
            'financial': any(w in msg for w in ['money', 'debt', 'financial', 'bills', 'rent', 'mortgage', 'afford', 'broke', 'loan', 'budget']),
            'academic': any(w in msg for w in ['school', 'study', 'exam', 'test', 'grade', 'homework', 'class', 'university', 'college']),
            
            # Specific issues
            'sleep_issues': any(w in msg for w in ['sleep', 'insomnia', 'cant sleep', 'tired', 'exhausted', 'awake', 'nightmares']),
            'loneliness': any(w in msg for w in ['alone', 'lonely', 'isolated', 'nobody', 'no one', 'no friends']),
            'future_anxiety': any(w in msg for w in ['future', 'tomorrow', 'worried about', 'uncertain', 'dont know what']),
        }
    
    def _acknowledge_emotion(self, emotion: str, intensity: int, context: Dict) -> str:
        """Acknowledge emotion briefly based on intensity - STEP 1 of AAA framework"""
        
        # For low intensity (1-3), skip or minimal acknowledgment
        if intensity <= 3:
            return ""  # Let the content speak for itself
        
        # For medium intensity (4-6), brief validation
        if intensity <= 6:
            brief = {
                'anxiety': 'Nervous energy is natural.',
                'nervousness': 'That uncertainty makes sense.',
                'fear': 'Those worries are understandable.',
                'sadness': 'That sounds difficult.',
                'anger': 'I hear your frustration.',
                'confusion': "It's okay to feel unclear about this.",
                'disappointment': 'Not getting what we hoped for is hard.',
                'joy': 'Great to hear positive news.',
                'excitement': 'That enthusiasm is wonderful.',
                'curiosity': 'Good question.',
            }
            return brief.get(emotion, '') 
        
        # For high intensity (7-10), stronger but still concise acknowledgment
        strong = {
            'anxiety': 'This anxiety feels overwhelming right now.',
            'fear': 'These fears are weighing heavily on you.',
            'sadness': "You're carrying real pain.",
            'anger': "You're dealing with serious frustration.",
            'grief': 'This loss is profound and painful.',
            'disappointment': 'This setback hits hard.',
        }
        return strong.get(emotion, 'What you're feeling is real and valid.')
    
    def _get_actionable_response(self, intent: str, context: Dict, emotion: str, intensity: int) -> str:
        """Generate actionable response - STEP 2 & 3 of AAA framework (Address & Action)"""
        
        # Get the primary life domain
        primary_domain = next((k for k, v in context.items() if v), None)
        
        # Build response based on domain and intent
        if intent == 'seeking_advice':
            return self._get_advice_response(primary_domain, emotion, context)
        elif intent == 'seeking_information':
            return self._get_informational_response(primary_domain, emotion)
        elif intent == 'sharing_emotion':
            # Balance empathy with gentle guidance
            return self._get_supportive_response(primary_domain, emotion, intensity)
        elif intent == 'unclear':
            return "Could you tell me more about what's on your mind? I want to make sure I understand how to best help you."
        else:
            return self._get_supportive_response(primary_domain, emotion, intensity)
    
    def _get_advice_response(self, domain: str, emotion: str, context: Dict) -> str:
        """Generate specific, actionable advice"""
        strategies = self.action_strategies.get(domain, {})
        
        # Social anxiety gets special treatment (your specific use case)
        if context.get('social'):
            return self._get_social_anxiety_advice(emotion)
        
        # Get domain-specific advice if available
        if domain and domain in self.action_strategies:
            advice = strategies.get(emotion, strategies.get('default', []))
            if advice:
                # Return first strategy (most relevant)
                return advice[0] if isinstance(advice, list) else advice
        
        # Fallback to general emotion-based strategies
        return self._get_general_strategy(emotion)
    
    def _get_social_anxiety_advice(self, emotion: str) -> str:
        """Detailed social anxiety strategies"""
        strategies = {
            'anxiety': """Here's a practical approach:

**Before social situations:**
• Practice the 4-7-8 breathing technique (inhale 4 counts, hold 7, exhale 8)
• Arrive early so you're not walking into an established group
• Prepare 2-3 conversation starters or questions

**During:**
• Focus on the other person - ask questions and listen (shifts attention away from yourself)
• Remember: people are mostly thinking about themselves, not judging you
• It's okay to take breaks (bathroom, get water, step outside briefly)

**Long term:**
• Start small: practice brief interactions with cashiers, baristas
• Challenge anxious thoughts: "What's the evidence this will go badly?"
• Consider cognitive behavioral therapy (CBT) - it's highly effective for social anxiety""",
            
            'nervousness': """Let's break this down into manageable steps:

1. **Preparation**: Know your material but don't over-rehearse (causes rigidity)
2. **Physical**: Light exercise beforehand burns off nervous energy  
3. **Mental reframe**: "I'm excited" works better than "don't be nervous" (same physiological state, different interpretation)
4. **In the moment**: Make eye contact with friendly faces, pause for water if needed
5. **Remember**: Some nervousness actually enhances performance (inverted-U curve)

**Practical technique**: Power pose for 2 minutes before (research shows it reduces cortisol)""",
            
            'fear': """To minimize fear in public situations:

**Grounding technique (5-4-3-2-1):**  
• Name 5 things you see
• 4 things you can touch
• 3 things you hear  
• 2 things you smell
• 1 thing you taste

This pulls you from future worries into the present moment.

**Cognitive approach:**
• Identify the specific fear (embarrassment? judgment? panic attack?)
• Ask: "What's the worst that could realistically happen?"
• Then: "How would I handle that?"
• Usually the answer shows you're more capable than the fear suggests

**Gradual exposure** is key - start with slightly uncomfortable situations and build tolerance over time."""
        }
        
        return strategies.get(emotion, self._get_general_strategy(emotion))
    
    def _get_supportive_response(self, domain: str, emotion: str, intensity: int) -> str:
        """Respond to emotional sharing with empathy + gentle guidance"""
        
        support = {
            'work': "Work stress is incredibly common. What would help most right now - talking through the situation, or focusing on what you can control?",
            'relationships': "Relationship challenges affect us deeply. Are you looking to improve communication, set boundaries, or process your feelings?",
            'financial': "Financial stress touches everything. Small steps often help: list what you can control, then tackle one thing at a time.",
            'health': "Health concerns carry emotional weight. Make sure you're getting clear information from your providers, and don't hesitate to ask for support.",
            'academic': "Academic pressure is real. Break big goals into daily tasks, and remember that grades don't define your worth.",
            'sleep_issues': "Sleep problems often signal stress. Try: cool room, dark space, no screens 30min before bed, same wake time daily.",
            'loneliness': "Loneliness is painful. Small connections help: join interest-based groups, volunteer, or even brief chats with neighbors.",
        }
        
        return support.get(domain, "I'm here to support you. What would be most helpful right now?")
    
    def _get_informational_response(self, domain: str, emotion: str) -> str:
        """Provide educational information"""
        return f"That's a thoughtful question about {domain or 'managing emotions'}. What specific aspect would you like to understand better?"
    
    def _get_general_strategy(self, emotion: str) -> str:
        """General emotion management strategies"""
        strategies = {
            'anxiety': "Try: deep breathing (4-7-8 technique), break worries into controllable vs uncontrollable, physical movement, grounding techniques.",
            'fear': "Acknowledge the fear, assess if it's based on facts or assumptions, focus on what you can control, use grounding techniques.",
            'sadness': "Allow yourself to feel it. Self-compassion, gentle movement, journaling, or talking to someone can help process difficult emotions.",
            'anger': "Physical activity releases angry energy. Identify the unmet need underneath. Set boundaries if needed.",
            'confusion': "Write down what you know vs don't know. Break complex situations into smaller pieces. Seek reliable information.",
            'disappointment': "Allow the feeling. Adjust expectations. Consider what you learned. Make a new plan forward.",
            'loneliness': "Small connections matter: join groups aligned with interests, volunteer, brief interactions count, online communities help.",
        }
        return strategies.get(emotion, "Focus on what you can control, and take things one step at a time.")
    
    def _initialize_action_strategies(self) -> Dict[str, Dict]:
        """Initialize domain-specific action strategies"""
        return {
            'work': {
                'anxiety': ["Set clear work-life boundaries. Take regular breaks. Have an honest conversation with your supervisor about workload if needed."],
                'default': ["Prioritize tasks, delegate when possible, remember your worth isn't defined by productivity."]
            },
            'relationships': {
                'anger': ["Use 'I' statements to express feelings without blame. Example: 'I feel hurt when...' instead of 'You always...'"],
                'sadness': ["Open communication is key. Express what you need clearly. Remember that healthy relationships include individual space."],
                'default': ["Honest communication, clear boundaries, mutual respect - these are the foundations of healthy relationships."]
            },
            'financial': {
                'anxiety': ["List all income and expenses. Identify one controllable thing to address first. Many communities offer free financial counseling."],
                'default': ["Break challenges into small steps. Focus on what you can control. Asking for help is strength, not weakness."]
            },
            'health': {
                'anxiety': ["Write down questions for your doctor. Don't hesitate to seek second opinions. Mind and body are connected - care for both."],
                'default': ["Get clear information from providers, enlist support from friends/family, small self-care acts matter."]
            },
            'social': {
                'anxiety': ["Start with small, low-stakes social interactions. Practice deep breathing. Challenge negative thoughts with evidence."],
                'nervousness': ["Prepare conversation topics. Arrive early. Focus on others, not your self-consciousness. Take breaks when needed."],
                'fear': ["Use grounding techniques (5-4-3-2-1). Practice gradual exposure. Remember most people are focused on themselves, not judging you."],
                'default': ["Social skills improve with practice. Start small, be patient with yourself, celebrate small wins."]
            }
        }
    
    def _get_crisis_resources(self) -> str:
        """Crisis support resources"""
        return """
🆘 **If you're in immediate crisis:**
📞 National Suicide Prevention Lifeline: **988**
💬 Crisis Text Line: Text **'HELLO'** to **741741**
🌐 International: https://findahelpline.com
🚨 Emergency services: **911**
"""
    
    def generate_response(self, emotion: str, user_message: str, intensity: int, 
                         risk_level: str, conversation_history: List[str] = None) -> str:
        """
        Generate intelligent, context-aware response using AAA framework
        (Acknowledge-Address-Action)
        
        Args:
            emotion: Primary detected emotion
            user_message: User's original message (PRIMARY source of truth)
            intensity: Emotion intensity (1-10)
            risk_level: Risk assessment (low, medium, high, critical)
            conversation_history: Previous messages for context
        
        Returns:
            Natural, helpful response prioritizing user's intent
        """
        # Normalize emotion
        emotion = emotion.lower()
        
        # 1. Classify user's intent (what they actually want)
        intent, intent_confidence = self._classify_intent(user_message)
        
        # 2. Extract context from message
        context = self._extract_context(user_message)
        
        # 3. Handle crisis situations immediately
        if risk_level == 'critical' or intent == 'crisis':
            return f"I'm deeply concerned about what you're sharing. Your safety is the priority.{self.crisis_resources}\n\nPlease reach out to one of these resources immediately. They're available 24/7 and specifically trained for crisis support."
        
        # 4. Build response using AAA framework
        parts = []
        
        # ACKNOWLEDGE (brief, intensity-based)
        acknowledgment = self._acknowledge_emotion(emotion, intensity, context)
        if acknowledgment:
            parts.append(acknowledgment)
        
        # ADDRESS & ACTION (the main content)
        actionable_response = self._get_actionable_response(intent, context, emotion, intensity)
        parts.append(actionable_response)
        
        # Combine parts naturally
        response = " ".join(parts) if len(parts) > 1 else parts[0] if parts else actionable_response
        
        # 5. Add high-risk support (not critical, but elevated)
        if risk_level == 'high' and intensity >= 8:
            response += "\n\n💙 If things feel overwhelming, support is available 24/7 at 988."
        
        return response
    
    def get_emotion_insight(self, emotion: str, confidence: float) -> str:
        """Get brief insight about detected emotion (for debugging/logs)"""
        return f"Detected: {emotion} ({confidence:.0%})"
