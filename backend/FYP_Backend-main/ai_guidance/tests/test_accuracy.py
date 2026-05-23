"""
Quick Accuracy Test for Current Model
"""

from lightweight_classifier import LightweightEmotionClassifier

# Initialize classifier
print("Loading model...")
clf = LightweightEmotionClassifier()
print("Model loaded successfully!\n")

# Test cases covering 28 emotions
test_cases = [
    # Basic emotions
    ("I am extremely happy today", "joy"),
    ("I feel so sad and depressed", "sadness"),
    ("This makes me very angry", "anger"),
    ("I am scared and afraid", "fear"),
    ("I love you so much", "love"),
    ("Thank you, I'm so grateful", "gratitude"),
    
    # More emotions
    ("I am so surprised by this", "surprise"),
    ("I feel disgusted by this behavior", "disgust"),
    ("I am very curious about this", "curiosity"),
    ("I am so excited for tomorrow", "excitement"),
    ("I feel nervous about the exam", "nervousness"),
    ("I am disappointed with the results", "disappointment"),
    ("I am so proud of you", "pride"),
    ("I approve of this decision", "approval"),
    ("I am optimistic about the future", "optimism"),
    ("I have relief now", "relief"),
    ("I feel embarrassed", "embarrassment"),
    ("I am annoyed by this", "annoyance"),
    ("I am confused about this", "confusion"),
    ("I desire this so much", "desire"),
    ("I am caring for you", "caring"),
    ("I feel remorse for my actions", "remorse"),
    ("I am grieving the loss", "grief"),
    ("I am envious of their success", "admiration"),  # Note: envy not in dataset
    ("I feel neutral about this", "neutral"),
    
    # Complex cases
    ("I want to kill myself", "grief"),  # Should detect critical keyword
    ("I'm on cloud nine", "joy"),  # Should detect idiom
    ("Great, just what I needed", "annoyance"),  # Should detect sarcasm
]

print("="*70)
print("TESTING MODEL ACCURACY")
print("="*70)

correct = 0
total = len(test_cases)

for text, expected in test_cases:
    result = clf.predict(text)
    predicted = result['emotion']
    confidence = result['confidence']
    
    is_correct = predicted == expected
    correct += 1 if is_correct else 0
    
    status = "✓" if is_correct else "✗"
    print(f"{status} '{text}'")
    print(f"   Expected: {expected} | Got: {predicted} ({confidence:.1f}%)")
    if not is_correct:
        print(f"   ⚠️  MISMATCH!")
    print()

print("="*70)
print(f"OVERALL ACCURACY: {correct}/{total} = {correct/total*100:.1f}%")
print("="*70)

if correct/total < 0.7:
    print("\n⚠️  WARNING: Accuracy below 70%!")
    print("Model needs improvement or retraining.")
elif correct/total < 0.85:
    print("\n⚠️  Accuracy is moderate (70-85%).")
    print("Consider fine-tuning or adding more training data.")
else:
    print("\n✅ Good accuracy (85%+)")
