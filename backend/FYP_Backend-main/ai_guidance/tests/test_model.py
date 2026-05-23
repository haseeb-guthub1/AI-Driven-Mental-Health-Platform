from lightweight_classifier import LightweightEmotionClassifier

clf = LightweightEmotionClassifier()

test_cases = [
    "Hurrrahhh",
    "hurrah",
    "yay excited",
    "I'm so happy",
    "kill me",
    "sad and lonely",
    "angry furious",
    "I am feeling really excited about this!",
    "This is making me so happy and joyful",
    "I'm really angry and frustrated with everything",
    "feeling scared and anxious",
    "I love you so much",
    "thank you for everything",
    "happy",
    "sad"
]

for text in test_cases:
    result = clf.predict(text)
    print(f"Text: '{text}'")
    print(f"  → {result['emotion']} ({result['confidence']:.1%})")
    top_3 = [(e['emotion'], f"{e['confidence']:.1%}") for e in result['all_emotions']]
    print(f"  → Top 3: {top_3}")
    print()
