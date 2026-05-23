from lightweight_classifier import get_lightweight_emotion_classifier

clf = get_lightweight_emotion_classifier()

# Test problematic cases
test_cases = [
    # Double meanings / Sarcasm / Irony
    ("Great, just what I needed", "Should detect sarcasm/disappointment"),
    ("Oh wonderful, another problem", "Sarcastic, should be annoyance/anger"),
    ("I'm totally fine", "Often means NOT fine - sadness/anger"),
    ("Yeah, I'm really happy about this", "Sarcastic - should detect negative"),
    
    # Complex sentences
    ("I should be happy about the promotion, but I feel overwhelmed and anxious", "Mixed: joy + fear/anxiety"),
    ("Everyone thinks I'm doing great, but inside I'm falling apart", "Surface joy, deep sadness"),
    ("I'm smiling on the outside but crying on the inside", "Hidden sadness"),
    
    # Figurative language
    ("My world is crashing down", "Despair/sadness, not literal"),
    ("I'm walking on sunshine", "Extreme joy, figurative"),
    ("I could kill for a coffee right now", "Desire, NOT violence"),
    ("I'm dying of boredom", "Boredom, NOT literal death"),
    ("I'm on cloud nine", "Extreme happiness"),
    ("I'm at my breaking point", "Stress/despair"),
    
    # Contextual phrases
    ("I can't even", "Overwhelmed/frustrated"),
    ("I'm done", "Giving up/frustration"),
    ("Whatever", "Apathy/anger"),
    ("It is what it is", "Acceptance/resignation"),
    
    # Complex emotional states
    ("I don't know if I should laugh or cry", "Confusion/mixed emotions"),
    ("I'm happy for them but jealous at the same time", "Mixed: joy + envy"),
    ("I love you but I can't be with you", "Love + sadness"),
    
    # Negative phrased positively
    ("I'm not sad, I'm just tired", "Denial of sadness, likely sad"),
    ("I'm okay, really", "Often means NOT okay"),
    
    # Metaphors and idioms
    ("I'm drowning in work", "Overwhelmed/stressed"),
    ("This is the last straw", "Anger/frustration at limit"),
    ("I'm over the moon", "Extreme happiness"),
    ("I'm under the weather", "Feeling unwell/down"),
]

print("=" * 80)
print("Testing Double Meanings & Complex Sentences")
print("=" * 80)

for text, expected in test_cases:
    result = clf.predict(text)
    print(f"\nText: '{text}'")
    print(f"Expected: {expected}")
    print(f"Detected: {result['emotion']} ({result['confidence']:.1%}) | Intensity: {result['intensity']}/10")
    if len(result['all_emotions']) > 1:
        other = [f"{e['emotion']}({e['confidence']:.0%})" for e in result['all_emotions'][1:3]]
        print(f"Also: {', '.join(other)}")
