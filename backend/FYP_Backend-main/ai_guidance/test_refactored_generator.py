"""
Quick test script for the refactored ResponseGenerator
Run: python test_refactored_generator.py
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from emotion_response_generator_v2 import EmotionResponseGenerator

def test_generator():
    """Test the new response generator with various scenarios"""
    
    generator = EmotionResponseGenerator()
    
    print("="*80)
    print("TESTING REFACTORED EMOTION RESPONSE GENERATOR")
    print("="*80)
    
    test_cases = [
        {
            'name': 'Advice-Seeking: Social Anxiety',
            'emotion': 'anxiety',
            'message': 'i have social anxiety how would i improve that',
            'intensity': 6,
            'risk': 'low'
        },
        {
            'name': 'Advice-Seeking: Public Speaking',
            'emotion': 'nervousness',
            'message': 'what are the steps to minimizing nervousness in public',
            'intensity': 5,
            'risk': 'low'
        },
        {
            'name': 'Sharing Emotion: Work Stress',
            'emotion': 'anxiety',
            'message': 'im feeling really anxious about work deadlines',
            'intensity': 7,
            'risk': 'medium'
        },
        {
            'name': 'Short/Ambiguous Input',
            'emotion': 'sadness',
            'message': 'sad',
            'intensity': 3,
            'risk': 'low'
        },
        {
            'name': 'Crisis Situation',
            'emotion': 'grief',
            'message': 'i want to end it all',
            'intensity': 10,
            'risk': 'critical'
        },
        {
            'name': 'Low Intensity Share',
            'emotion': 'curiosity',
            'message': 'i wonder if therapy would help me',
            'intensity': 2,
            'risk': 'low'
        },
        {
            'name': 'Informational Question',
            'emotion': 'neutral',
            'message': 'what is cognitive behavioral therapy',
            'intensity': 2,
            'risk': 'low'
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*80}")
        print(f"TEST {i}: {test['name']}")
        print(f"{'='*80}")
        print(f"User Message: \"{test['message']}\"")
        print(f"Emotion: {test['emotion']} | Intensity: {test['intensity']}/10 | Risk: {test['risk']}")
        print(f"\n{'-'*80}")
        print("AI RESPONSE:")
        print(f"{'-'*80}")
        
        response = generator.generate_response(
            emotion=test['emotion'],
            user_message=test['message'],
            intensity=test['intensity'],
            risk_level=test['risk'],
            conversation_history=None
        )
        
        print(response)
        print("\n")
    
    print("="*80)
    print("TESTING COMPLETE")
    print("="*80)
    
    # Test intent classification separately
    print("\n\nINTENT CLASSIFICATION TESTS:")
    print("="*80)
    
    intent_tests = [
        "how do i overcome anxiety",
        "im feeling sad today",
        "sad",
        "what is depression",
        "i want to hurt myself",
        "help me manage stress"
    ]
    
    for msg in intent_tests:
        intent, confidence = generator._classify_intent(msg)
        print(f"Message: \"{msg}\"")
        print(f"  → Intent: {intent} (confidence: {confidence:.0%})\n")

if __name__ == "__main__":
    test_generator()
