"""
Quick test of BERT detector
"""
from goemotions_bert_detector import GoEmotionsBERTDetector

detector = GoEmotionsBERTDetector()

tests = [
    "hello",
    "hurrah",
    "I am very happy",
    "I am so sad",
    "kill me",
    "Great, just what I needed",
]

print("="*60)
print("BERT MODEL TEST")
print("="*60)

for text in tests:
    result = detector.detect_emotion(text)
    print(f"\n'{text}'")
    print(f"  Emotion: {result['emotion']}")
    print(f"  Confidence: {result['confidence']*100:.1f}%")
    print(f"  Intensity: {result['intensity']}/10")
    print(f"  Approach: {result['approach']}")
