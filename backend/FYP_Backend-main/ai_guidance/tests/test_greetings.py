"""
Quick test for greetings
"""
from transformers_classifier import TransformersEmotionClassifier

clf = TransformersEmotionClassifier()

test_cases = [
    "hello",
    "hi",
    "hey",
    "hi how are you",
    "hello there",
    "good morning",
    "hey what's up",
]

print("Testing greetings:")
print("="*50)

for text in test_cases:
    result = clf.predict(text)
    print(f"'{text}' -> {result['emotion']} ({result['confidence']*100:.1f}%)")
