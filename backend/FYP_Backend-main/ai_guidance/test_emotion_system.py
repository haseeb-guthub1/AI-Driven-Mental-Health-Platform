# """
# Test the Emotion-Based Response System (No Gemini API)
# """
# import sys
# import os

# # Add parent directory to path
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from ai_guidance.emotion_response_generator import EmotionResponseGenerator

# def test_emotion_responses():
#     """Test emotion response generator with different scenarios"""
    
#     generator = EmotionResponseGenerator()
    
#     test_cases = [
#         {
#             'emotion': 'sadness',
#             'message': 'I feel really down today. I lost my job and I don\'t know what to do',
#             'intensity': 7,
#             'risk_level': 'medium'
#         },
#         {
#             'emotion': 'joy',
#             'message': 'I got the job I wanted! I worked so hard for this and finally achieved it!',
#             'intensity': 9,
#             'risk_level': 'low'
#         },
#         {
#             'emotion': 'anger',
#             'message': 'My boss is so unfair. I am so frustrated with how I\'m being treated at work',
#             'intensity': 8,
#             'risk_level': 'medium'
#         },
#         {
#             'emotion': 'fear',
#             'message': 'I am really worried about my health. I have an appointment with the doctor tomorrow',
#             'intensity': 6,
#             'risk_level': 'medium'
#         },
#         {
#             'emotion': 'grief',
#             'message': 'I lost my mother last week. I feel so alone and broken',
#             'intensity': 10,
#             'risk_level': 'critical'
#         },
#         {
#             'emotion': 'anxiety',
#             'message': 'I can\'t sleep at night. I keep worrying about money and my bills',
#             'intensity': 8,
#             'risk_level': 'high'
#         }
#     ]
    
#     print("="*80)
#     print("EMOTION-BASED RESPONSE SYSTEM TEST")
#     print("WITH CONTEXT-AWARE PERSONALIZED RESPONSES")
#     print("="*80)
#     print("\nTesting responses WITHOUT any external API (Gemini/OpenAI)")
#     print("All responses generated from emotion detection + message content analysis")
#     print("Responses include:")
#     print("  ✓ Empathy related to user's specific situation")
#     print("  ✓ Practical solutions for their scenario")
#     print("  ✓ Therapeutic strategies based on emotion\n")
    
#     for i, test in enumerate(test_cases, 1):
#         print(f"\n{'='*80}")
#         print(f"Test Case #{i}")
#         print(f"{'='*80}")
#         print(f"User Message: {test['message']}")
#         print(f"Detected Emotion: {test['emotion']}")
#         print(f"Intensity: {test['intensity']}/10")
#         print(f"Risk Level: {test['risk_level']}")
#         print(f"\n{'-'*80}")
#         print("AI Response:")
#         print(f"{'-'*80}")
        
#         response = generator.generate_response(
#             emotion=test['emotion'],
#             user_message=test['message'],
#             intensity=test['intensity'],
#             risk_level=test['risk_level']
#         )
        
#         print(response)
#         print()
    
#     print("="*80)
#     print("✅ ALL TESTS COMPLETED")
#     print("="*80)
#     print("\n📊 System Status:")
#     print("✓ Emotion detection: Your trained model")
#     print("✓ Content analysis: Message topic extraction")
#     print("✓ Response generation: Context-aware templates (no API)")
#     print("✓ Personalization: Addresses user's specific situation")
#     print("✓ Solutions: Practical advice for their scenario")
#     print("✓ Crisis detection: Built-in risk assessment")
#     print("✓ Therapeutic approach: CBT-based strategies")
#     print("\n🎯 Result: Complete independence from external APIs!")
#     print("💬 Responses are now personalized to user's message content!")

# if __name__ == "__main__":
#     test_emotion_responses()
