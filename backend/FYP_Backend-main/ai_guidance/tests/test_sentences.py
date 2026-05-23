from lightweight_classifier import get_lightweight_emotion_classifier

clf = get_lightweight_emotion_classifier()

# Test with various sentence types
test_sentences = [
    # Short expressions (should use keywords)
    "happy",
    "sad",
    "Hurrrahhh",
    
    # Simple sentences
    "I am happy",
    "I feel sad",
    "I am excited",
    "I am angry",
    
    # Complex sentences
    "I'm so happy today because I got a promotion at work",
    "I feel really sad and lonely after my friend moved away",
    "I'm extremely excited about the upcoming vacation",
    "I'm absolutely furious about what happened yesterday",
    "I'm terrified of what might happen tomorrow",
    
    # Mixed emotion sentences
    "I'm happy but also nervous about the interview",
    "I feel sad but hopeful things will get better",
    
    # Conversational sentences
    "My heart starts racing every time I hear that floorboard creak",
    "I can't believe this happened to me",
    "This is the best day of my life",
    "I hate everything about this situation",
    "I'm so grateful for your help",
    
    # Longer narratives
    "Today was amazing! I finally achieved my goal after months of hard work. I couldn't be happier!",
    "Everything is falling apart. I don't know what to do anymore. I feel completely lost and hopeless.",
    "I'm really worried about my exam tomorrow. I've studied so hard but I'm still anxious about failing.",
]

print("=" * 80)
print("Testing Sentence-Level Emotion Detection")
print("=" * 80)

for text in test_sentences:
    result = clf.predict(text)
    print(f"\nText: '{text}'")
    print(f"  → {result['emotion']} ({result['confidence']:.1%}) | Intensity: {result['intensity']}/10")
    if len(result['all_emotions']) > 1:
        other_emotions = [f"{e['emotion']}({e['confidence']:.0%})" for e in result['all_emotions'][1:3]]
        print(f"  → Also detected: {', '.join(other_emotions)}")
