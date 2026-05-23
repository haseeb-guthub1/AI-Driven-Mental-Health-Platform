"""
Test mental health specific terms with current model
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_guidance.transformers_classifier import TransformersEmotionClassifier

def test_mental_health_terms():
    """Test problematic mental health terms"""
    print("="*70)
    print("TESTING MENTAL HEALTH TERMS - CURRENT MODEL")
    print("="*70)
    
    classifier = TransformersEmotionClassifier()
    
    test_cases = [
        "I am tired",
        "i am tried",  # User's typo
        "Feeling numb",
        "Floating",
        "I'm floating",
        "Fine",
        "I'm fine",
        "I'm totally fine",
        "Everyone else seems to have their life figured out except for me",
        "I feel heartbroken",
        "Anxious",
        "I'm anxious",
        "Speechless",
        "Flabbergasted",
        "I feel empty",
        "Emotionally numb",
        "I'm exhausted",
        "Feeling drained",
        "I feel stuck",
        "Overwhelmed",
        "I'm hopeless",
        "Nobody understands me",
        "I'm all alone",
    ]
    
    print(f"\nTesting {len(test_cases)} mental health expressions:\n")
    
    correct = 0
    total = len(test_cases)
    
    for text in test_cases:
        result = classifier.predict_emotion(text)
        emotion = result['emotion']
        confidence = result['confidence']
        
        # Expected emotions (for evaluation)
        expected = "varies"
        is_correct = "?"
        
        if "tired" in text.lower() or "exhausted" in text.lower() or "drained" in text.lower():
            expected = "sadness"
            is_correct = "✅" if emotion == "sadness" else "❌"
        elif "numb" in text.lower() or "empty" in text.lower():
            expected = "sadness/grief"
            is_correct = "✅" if emotion in ["sadness", "grief"] else "❌"
        elif "floating" in text.lower():
            expected = "confusion/dissociation"
            is_correct = "✅" if emotion in ["confusion", "curiosity", "realization", "neutral"] else "❌"
        elif text.lower() == "fine" or text.lower() == "i'm fine":
            expected = "neutral/sadness"
            is_correct = "✅" if emotion in ["neutral", "sadness"] else "❌"
        elif "totally fine" in text.lower():
            expected = "sadness (sarcasm)"
            is_correct = "✅" if emotion == "sadness" else "❌"
        elif "figured out except" in text.lower():
            expected = "sadness/disappointment"
            is_correct = "✅" if emotion in ["sadness", "disappointment", "grief"] else "❌"
        elif "heartbroken" in text.lower():
            expected = "sadness"
            is_correct = "✅" if emotion == "sadness" else "❌"
        elif "anxious" in text.lower():
            expected = "fear/nervousness"
            is_correct = "✅" if emotion in ["fear", "nervousness"] else "❌"
        elif "speechless" in text.lower() or "flabbergasted" in text.lower():
            expected = "surprise"
            is_correct = "✅" if emotion == "surprise" else "❌"
        elif "stuck" in text.lower() or "overwhelmed" in text.lower():
            expected = "sadness/fear"
            is_correct = "✅" if emotion in ["sadness", "fear"] else "❌"
        elif "hopeless" in text.lower() or "alone" in text.lower() or "nobody understands" in text.lower():
            expected = "sadness"
            is_correct = "✅" if emotion == "sadness" else "❌"
        
        if is_correct == "✅":
            correct += 1
        
        status = is_correct if is_correct != "?" else "  "
        print(f"{status} '{text}'")
        print(f"   → {emotion} ({confidence:.1%}) | Expected: {expected}")
    
    print(f"\n{'='*70}")
    print(f"ACCURACY: {correct}/{total} = {correct/total*100:.1f}%")
    print(f"{'='*70}")
    
    if correct/total < 0.8:
        print("\n⚠️  Current model needs fine-tuning on mental health terms")
        print("   Run: python finetune_transformer.py")
    else:
        print("\n✅ Model performing well on mental health terms!")

if __name__ == "__main__":
    test_mental_health_terms()
