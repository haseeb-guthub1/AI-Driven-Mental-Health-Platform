"""
Sarcasm Detection Module
Detects sarcastic messages and adjusts emotion classification accordingly
"""
import re
from typing import Dict, Tuple


class SarcasmDetector:
    """Detect sarcasm and irony in user messages"""
    
    def __init__(self):
        self.sarcasm_indicators = self._initialize_indicators()
    
    def _initialize_indicators(self) -> Dict[str, any]:
        """Initialize sarcasm detection patterns"""
        return {
            # Strong sarcasm markers
            'quotation_emphasis': [
                r"'[^']+'\s+(has|have|is|are|was|were)",  # 'brilliant' has, 'expertise' is
                r'"[^"]+"\s+(really|totally|definitely|absolutely)',
            ],
            
            # Exaggerated praise patterns
            'exaggerated_praise': [
                r'\b(oh|wow),?\s+(brilliant|amazing|wonderful|fantastic|excellent|perfect)',
                r'\b(such|so)\s+(brilliant|amazing|wonderful|great)\s+idea',
                r'infinite\s+(wisdom|knowledge|genius)',
                r'unmatched\s+(expertise|brilliance|genius)',
                r'never\s+(doubt|question).*(wisdom|genius|brilliance)',
                r'(so|such|really|very|absolutely|totally)\s+much\s+for',  # "thank you so much for"
            ],
            
            # Contradiction patterns (positive + negative)
            'contradictions': [
                r'(brilliant|great|wonderful|amazing|perfect|fantastic).*(disaster|failure|mess|problem|wrong|broke|broken|useless)',
                r'(disaster|failure|mess|problem).*(brilliant|great|wonderful)',
                r'(love|enjoy|appreciate).*(fail|disaster|mess|worse|problem)',
                r'(absolutely|totally|perfectly|completely)\s+(perfect|great|wonderful).*(mess|disaster|problem)',
                r'(help|helping|helped).*(worse|worst|disaster|mess)',
            ],
            
            # Ironic thanks/gratitude
            'ironic_gratitude': [
                r'(thanks|thank you)\s+(for|to).*(disaster|mess|failure|problem|nothing|worse)',
                r'really\s+appreciate.*(mess|disaster|failure)',
                r'so\s+much\s+for.*(help|helping)',  # "so much for your help"
            ],
            
            # Rhetorical questions with obvious negative answer
            'rhetorical_negative': [
                r'what could possibly go wrong',
                r"couldn't be better",  # when clearly things are bad
                r'exactly what I (wanted|needed|hoped for)',  # when it's not
                r'(totally|really|definitely)\s+(didn\'t|didnt|did not).*(backfire|fail|work)',
            ],
            
            # Extreme modifiers with negative outcome
            'extreme_modifiers': [
                r'(absolutely|totally|completely|utterly|perfectly).*(disaster|awful|terrible|wrong|useless|mess)',
                r'(never|always).*(doubt|question).*(again)',  # sarcastic commitment
                r'(totally|really|definitely).*(didn\'t|didnt).*(work|help|backfire)',
            ],
            
            # Negation with positive words (often sarcastic)
            'negated_positive': [
                r'(didn\'t|didnt|did not|not).*(backfire|fail|go wrong)\s+at all',
                r'not.*(problem|issue|disaster)\s+at all',
            ],
        }
    
    def detect(self, message: str) -> Tuple[bool, float, str]:
        """
        Detect if message is sarcastic
        
        Args:
            message: User's message
            
        Returns:
            Tuple of (is_sarcastic, confidence, reason)
        """
        message_lower = message.lower()
        indicators_found = []
        
        # Check for quotation emphasis (strong indicator)
        for pattern in self.sarcasm_indicators['quotation_emphasis']:
            if re.search(pattern, message):
                indicators_found.append("quotation_emphasis")
                return (True, 0.9, "Quotation marks around positive words suggest sarcasm")
        
        # Check for exaggerated praise
        for pattern in self.sarcasm_indicators['exaggerated_praise']:
            if re.search(pattern, message_lower):
                indicators_found.append("exaggerated_praise")
        
        # Check for contradictions
        for pattern in self.sarcasm_indicators['contradictions']:
            if re.search(pattern, message_lower):
                indicators_found.append("contradiction")
                return (True, 0.95, "Message contains contradictory positive/negative words")
        
        # Check for ironic gratitude
        for pattern in self.sarcasm_indicators['ironic_gratitude']:
            if re.search(pattern, message_lower):
                indicators_found.append("ironic_gratitude")
                return (True, 0.85, "Thanking for negative outcome suggests sarcasm")
        
        # Check for rhetorical questions
        for pattern in self.sarcasm_indicators['rhetorical_negative']:
            if re.search(pattern, message_lower):
                indicators_found.append("rhetorical")
                return (True, 0.8, "Rhetorical question pattern detected")
        
        # Check for extreme modifiers with negative outcomes
        for pattern in self.sarcasm_indicators['extreme_modifiers']:
            if re.search(pattern, message_lower):
                indicators_found.append("extreme_modifier")
                return (True, 0.85, "Extreme modifier with negative outcome")
        
        # Check for negated positive (sarcastic negation)
        for pattern in self.sarcasm_indicators.get('negated_positive', []):
            if re.search(pattern, message_lower):
                indicators_found.append("negated_positive")
                return (True, 0.8, "Sarcastic negation detected (didn't backfire, etc.)")
        
        # Multiple weaker indicators = likely sarcasm
        if len(indicators_found) >= 2:
            return (True, 0.75, f"Multiple sarcasm indicators: {', '.join(indicators_found)}")
        
        # Single weak indicator = possible sarcasm
        if len(indicators_found) == 1:
            return (True, 0.5, f"Possible sarcasm: {indicators_found[0]}")
        
        # No sarcasm detected
        return (False, 0.0, "No sarcasm detected")
    
    def adjust_emotion(self, original_emotion: str, confidence: float, 
                       is_sarcastic: bool, sarcasm_confidence: float) -> Tuple[str, str]:
        """
        Adjust detected emotion if sarcasm is detected
        
        Args:
            original_emotion: Emotion detected by model
            confidence: Confidence of emotion detection
            is_sarcastic: Whether message is sarcastic
            sarcasm_confidence: Confidence of sarcasm detection
            
        Returns:
            Tuple of (adjusted_emotion, reason)
        """
        if not is_sarcastic or sarcasm_confidence < 0.7:
            return (original_emotion, "No adjustment needed")
        
        # Map commonly misclassified emotions when sarcastic
        sarcasm_emotion_map = {
            'admiration': ('anger', 'Sarcastic admiration indicates frustration/anger'),
            'approval': ('disapproval', 'Sarcastic approval indicates disapproval'),
            'gratitude': ('anger', 'Sarcastic gratitude indicates anger/frustration'),
            'joy': ('anger', 'Sarcastic joy indicates frustration'),
            'excitement': ('disappointment', 'Sarcastic excitement indicates disappointment'),
            'optimism': ('pessimism', 'Sarcastic optimism indicates pessimism'),
            'pride': ('embarrassment', 'Sarcastic pride indicates embarrassment'),
            'relief': ('stress', 'Sarcastic relief indicates ongoing stress'),
        }
        
        if original_emotion in sarcasm_emotion_map:
            new_emotion, reason = sarcasm_emotion_map[original_emotion]
            return (new_emotion, reason)
        
        # If emotion is already negative, likely detected correctly
        negative_emotions = ['anger', 'annoyance', 'disappointment', 'frustration', 
                            'sadness', 'disapproval', 'disgust']
        if original_emotion in negative_emotions:
            return (original_emotion, "Already negative emotion, no adjustment")
        
        # Default: convert to frustration/annoyance
        return ('annoyance', 'Sarcasm detected, adjusting to annoyance')


# Quick test function
def test_sarcasm_detector():
    """Test the sarcasm detector"""
    detector = SarcasmDetector()
    
    test_cases = [
        "Oh, brilliant! Your 'unmatched expertise' has once again led us into a complete disaster.",
        "Thank you so much for this absolutely perfect mess you created.",
        "Wow, what a great idea! This totally didn't backfire at all.",
        "I'm really grateful for all your help in making everything worse.",
        "Your infinite wisdom never ceases to amaze me. Now everything's broken.",
        "I'm genuinely happy with how things turned out.",  # Not sarcasm
        "This is actually really helpful, thank you!",  # Not sarcasm
        "I'm feeling frustrated with this situation.",  # Direct, not sarcasm
    ]
    
    print("=" * 70)
    print("SARCASM DETECTOR TEST")
    print("=" * 70)
    
    for msg in test_cases:
        is_sarcastic, confidence, reason = detector.detect(msg)
        print(f"\nMessage: {msg}")
        print(f"Sarcastic: {is_sarcastic} | Confidence: {confidence:.0%}")
        print(f"Reason: {reason}")
        
        if is_sarcastic:
            # Test emotion adjustment
            adjusted, adj_reason = detector.adjust_emotion('admiration', 0.9, is_sarcastic, confidence)
            print(f"Emotion Adjustment: admiration → {adjusted}")
            print(f"Adjustment Reason: {adj_reason}")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    test_sarcasm_detector()
