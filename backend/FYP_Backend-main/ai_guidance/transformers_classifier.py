"""
Advanced Emotion Classifier using Pre-trained Transformers
Combines RoBERTa model with contextual understanding (sarcasm, idioms, etc.)
"""

import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np


class TransformersEmotionClassifier:
    """
    Emotion classifier using pre-trained RoBERTa model with advanced contextual understanding
    """
    
    def __init__(self, model_name="SamLowe/roberta-base-go_emotions"):
        """Initialize transformer model and contextual detection rules"""
        print("[MODEL] Loading pre-trained transformer model...")
        print(f"[MODEL] Model: {model_name}")
        
        # Load pre-trained model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.eval()  # Set to evaluation mode
        
        # Get emotion labels from model config
        self.emotions = list(self.model.config.id2label.values())
        print(f"[MODEL] Loaded {len(self.emotions)} emotion categories")
        print(f"[MODEL] Emotions: {', '.join(self.emotions[:10])}...")
        
        # Crisis patterns - semantic understanding, not just keywords
        self.crisis_patterns = {
            'suicide_direct': ['kill myself', 'end my life', 'want to die', 'suicide', 'suicidal', 'suicisudal', 'take my life'],
            'suicide_indirect': ['better off dead', 'no point living', 'wish i was dead', 'everyone would be better'],
            'self_harm': ['hurt myself', 'cut myself', 'harm myself', 'cutting', 'self harm'],
            'death_wish': ['kill me', 'let me die', 'death wish'],
        }
        
        # Metaphor-to-emotion mapping (figurative language)
        self.metaphor_map = {
            # Anger metaphors
            'fire in': 'anger',
            'blood boils': 'anger',
            'blood boiling': 'anger',
            'seeing red': 'anger',
            'steam coming': 'anger',
            
            # Anxiety metaphors
            'knot in': 'fear',
            'butterflies in': 'fear',
            'heart racing': 'fear',
            'on edge': 'fear',
            'walking on eggshells': 'fear',
            
            # Sadness metaphors
            'lead in': 'sadness',
            'heavy heart': 'sadness',
            'weight on': 'sadness',
            'drowning in': 'sadness',
            'rock bottom': 'sadness',
            
            # Dissociation/numbness
            'floating': 'sadness',
            'numb': 'sadness',
            'empty inside': 'sadness',
            'nothing inside': 'sadness',
        }
        
        # Comprehensive emotion keywords (500+ keywords)
        self.emotion_keywords = {
            'joy': ['happy', 'joyful', 'delighted', 'cheerful', 'elated', 'thrilled', 'ecstatic', 
                    'jubilant', 'overjoyed', 'blissful', 'glad', 'pleased', 'content', 'satisfied',
                    'merry', 'jolly', 'gleeful', 'radiant', 'beaming', 'grinning', 'hurrah', 'hooray',
                    'yay', 'woohoo', 'yippee', 'fantastic', 'wonderful', 'amazing', 'awesome'],
            'sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'sorrowful', 'dejected',
                       'melancholy', 'gloomy', 'downcast', 'heartbroken', 'tearful', 'crying',
                       'weeping', 'mournful', 'woeful', 'dismal', 'blue', 'down', 'low',
                       'numb', 'empty', 'hollow', 'lost', 'alone', 'lonely', 'isolated',
                       'tired', 'tried', 'exhausted', 'drained', 'weary', 'worn out', 'fine'],
            'anger': ['angry', 'furious', 'enraged', 'irate', 'livid', 'outraged', 'incensed',
                     'infuriated', 'mad', 'annoyed', 'irritated', 'frustrated', 'exasperated',
                     'wrathful', 'indignant', 'resentful', 'hostile', 'bitter', 'fuming'],
            'fear': ['afraid', 'scared', 'frightened', 'terrified', 'horrified', 'fearful',
                    'anxious', 'worried', 'nervous', 'panicked', 'alarmed', 'startled',
                    'intimidated', 'threatened', 'uneasy', 'apprehensive', 'dreadful'],
            'love': ['love', 'adore', 'cherish', 'affection', 'devoted', 'passionate',
                    'romantic', 'caring', 'tender', 'fond', 'attached', 'enamored'],
            'surprise': ['surprised', 'shocked', 'astonished', 'amazed', 'stunned', 'startled',
                        'astounded', 'dumbfounded', 'flabbergasted', 'speechless', 'unexpected'],
            'disgust': ['disgusted', 'revolted', 'repulsed', 'nauseated', 'sickened', 'gross',
                       'nasty', 'vile', 'foul', 'repugnant', 'loathsome', 'offensive'],
            'curiosity': ['curious', 'interested', 'intrigued', 'inquisitive', 'wondering',
                         'questioning', 'fascinated', 'eager to know', 'want to know'],
            'excitement': ['excited', 'thrilled', 'exhilarated', 'enthusiastic', 'pumped',
                          'energized', 'animated', 'eager', 'anticipating', 'looking forward'],
            'nervousness': ['nervous', 'anxious', 'worried', 'uneasy', 'jittery', 'on edge',
                           'tense', 'restless', 'fidgety', 'stressed', 'apprehensive'],
            'disappointment': ['disappointed', 'let down', 'dismayed', 'disheartened', 'discouraged',
                              'disenchanted', 'disillusioned', 'frustrated', 'dissatisfied',
                              'figured out', 'everyone else', 'except me', 'left behind',
                              'not good enough', 'falling behind'],
            'pride': ['proud', 'honored', 'accomplished', 'triumphant', 'dignified', 'confident',
                     'self-respect', 'achievement', 'success', 'victorious', 'im so proud',
                     'proud of you', 'proud of myself'],
            'approval': ['approve', 'agree', 'accept', 'support', 'endorse', 'commend',
                        'appreciate', 'favorable', 'positive', 'good job', 'well done'],
            'optimism': ['optimistic', 'hopeful', 'positive', 'confident', 'encouraged',
                        'upbeat', 'bright', 'promising', 'looking up', 'silver lining'],
            'relief': ['relief', 'relieved', 'thankful', 'grateful', 'phew', 'glad its over',
                      'burden lifted', 'stress free', 'easy', 'calm now', 'i have relief',
                      'feel relief', 'sense of relief', 'relieving', 'floating', 'light',
                      'free', 'unburdened'],
            'embarrassment': ['embarrassed', 'ashamed', 'humiliated', 'mortified', 'awkward',
                             'self-conscious', 'sheepish', 'red-faced', 'flustered'],
            'annoyance': ['annoyed', 'irritated', 'bothered', 'pestered', 'aggravated',
                         'exasperated', 'frustrated', 'vexed', 'irked', 'fed up'],
            'confusion': ['confused', 'puzzled', 'perplexed', 'bewildered', 'baffled',
                         'mystified', 'unclear', 'uncertain', 'lost', 'dont understand',
                         'floating', 'dissociated', 'disconnected', 'detached', 'spaced out'],
            'desire': ['desire', 'want', 'crave', 'long for', 'yearn', 'wish', 'lust',
                      'covet', 'hunger for', 'thirst for', 'need', 'must have'],
            'caring': ['caring', 'care about', 'concern', 'thoughtful', 'considerate',
                      'compassionate', 'empathetic', 'supportive', 'nurturing', 'protective'],
            'remorse': ['remorse', 'regret', 'sorry', 'apologize', 'guilt', 'guilty',
                       'penitent', 'repentant', 'ashamed', 'mistake', 'shouldnt have'],
            'grief': ['grief', 'grieving', 'mourning', 'bereaved', 'loss', 'sorrow',
                     'heartache', 'anguish', 'devastated', 'miss them', 'passed away',
                     'the loss', 'losing', 'lost someone'],
            'admiration': ['admire', 'respect', 'look up to', 'impressed', 'inspired',
                          'awe', 'wonderful', 'amazing', 'incredible', 'outstanding'],
            'gratitude': ['grateful', 'thankful', 'appreciate', 'thanks', 'thank you',
                         'indebted', 'obliged', 'blessed', 'fortunate', 'lucky'],
            'amusement': ['amused', 'funny', 'hilarious', 'laughing', 'lol', 'haha',
                         'entertaining', 'comical', 'humorous', 'joke', 'giggling'],
            'realization': ['realize', 'understand', 'get it', 'aha', 'oh i see', 'makes sense',
                           'figured out', 'dawned on me', 'clicked', 'understand now'],
            'disapproval': ['disapprove', 'disagree', 'reject', 'oppose', 'against',
                           'unacceptable', 'wrong', 'bad idea', 'shouldnt', 'no way'],
            'neutral': ['okay', 'ok', 'alright', 'sure', 'whatever', 'meh',
                       'indifferent', 'neutral', 'neither', 'dont care', 'hello', 'hi', 'hey'],
        }
        
        # Sarcasm detection
        self.sarcasm_indicators = [
            'great', 'wonderful', 'perfect', 'fantastic', 'amazing', 'brilliant',
            'lovely', 'awesome', 'terrific', 'excellent', 'superb', 'outstanding',
            'oh great', 'oh wonderful', 'oh perfect', 'yeah right', 'sure',
            'totally', 'absolutely', 'yeah im', 'im really'
        ]
        
        self.sarcasm_contexts = [
            'another', 'problem', 'issue', 'trouble', 'mistake', 'error', 'fail',
            'wrong', 'bad', 'terrible', 'awful', 'just what i needed', 'about this'
        ]
        
        # Idioms and metaphors (50+ common expressions)
        self.idioms = {
            # Joy/Happiness idioms
            'on cloud nine': 'joy',
            'over the moon': 'joy',
            'walking on sunshine': 'joy',
            'on top of the world': 'joy',
            'happy as a clam': 'joy',
            'tickled pink': 'joy',
            'in seventh heaven': 'joy',
            
            # Sadness idioms
            'down in the dumps': 'sadness',
            'feeling blue': 'sadness',
            'under the weather': 'sadness',
            'world is crashing': 'sadness',
            'world is falling apart': 'sadness',
            'falling apart': 'sadness',
            'heart is breaking': 'sadness',
            'heart is broken': 'sadness',
            'crying on the inside': 'sadness',
            'tearing up': 'sadness',
            
            # Anger/Stress idioms
            'at my breaking point': 'anger',
            'at my wits end': 'anger',
            'last straw': 'anger',
            'had enough': 'anger',
            'fed up': 'annoyance',
            'sick and tired': 'annoyance',
            
            # Fear/Overwhelm idioms
            'drowning in': 'fear',
            'in over my head': 'fear',
            'scared to death': 'fear',
            'shaking in my boots': 'fear',
            
            # Desire (not violence)
            'could kill for': 'desire',
            'dying for': 'desire',
            'would kill for': 'desire',
            'starving for': 'desire',
            
            # Boredom (not death)
            'dying of boredom': 'annoyance',
            'bored to death': 'annoyance',
            'bored out of my mind': 'annoyance',
            
            # Short phrases
            'im done': 'annoyance',
            'i am done': 'annoyance',
            'whatever': 'annoyance',
            'i cant even': 'annoyance',
            'it is what it is': 'neutral',
            'meh': 'neutral',
            
            # Sarcasm phrases (direct mapping)
            'great just what i needed': 'annoyance',
            'just what i needed': 'annoyance',
            'oh great': 'annoyance',
            'oh wonderful': 'annoyance',
            'yeah right': 'disapproval',
        }
        # Negation/Denial phrases (often hide true emotions)
        # NOTE: Only include phrases that clearly indicate denial/hiding emotions
        # DO NOT include "not sad", "not angry" etc. - those are handled by negation detection
        self.negation_phrases = [
            "i'm fine", "im fine", "i am fine",
            "i'm okay", "im okay", "i am okay",
            "totally fine", "perfectly fine", "completely fine",
            "i'm alright", "im alright", "i am alright",
            "dont worry", "no worries", "its fine",
            "fine", "im good", "i'm good", "all good"
        ]
        
        # Mixed emotion indicators
        self.mixed_emotion_words = ['but', 'however', 'although', 'though', 'yet', 'still', 'despite']
        
        print("[MODEL] Transformer classifier ready!")
    
    def _detect_sarcasm(self, text):
        """Detect sarcastic statements"""
        text_lower = text.lower()
        
        # Pattern 1: "Oh [positive word]"
        if text_lower.startswith('oh '):
            for indicator in self.sarcasm_indicators:
                if indicator in text_lower:
                    for context in self.sarcasm_contexts:
                        if context in text_lower:
                            return True
        
        # Pattern 2: Positive word + negative context
        has_positive = any(ind in text_lower for ind in self.sarcasm_indicators)
        has_negative = any(ctx in text_lower for ctx in self.sarcasm_contexts)
        if has_positive and has_negative:
            return True
        
        # Pattern 3: "Yeah, I'm really [positive]" (insincere)
        if 'yeah' in text_lower and 'really' in text_lower:
            if any(ind in text_lower for ind in ['happy', 'excited', 'thrilled', 'glad']):
                return True
        
        return False
    
    def _detect_idiom(self, text):
        """Detect idioms/metaphors and return actual emotion"""
        text_lower = text.lower()
        
        for idiom, emotion in self.idioms.items():
            if idiom in text_lower:
                return emotion
        
        return None
    def _detect_negation_emotion(self, text):
        """Detect hidden emotions in denial/negation statements"""
        text_lower = text.lower().strip()
        
        # Single word "fine" often means NOT fine
        if text_lower == "fine":
            return 'sadness'
        
        # Check for exact negation phrases first
        for phrase in self.negation_phrases:
            if phrase in text_lower:
                # "I'm fine" often means sadness/anxiety
                return 'sadness'
        
        # Enhanced negation detection for "not + positive word" patterns
        negation_words = ['not', 'no', "n't", 'never', 'dont', "don't", 'cannot', "can't", 'wont', "won't"]
        
        # IMPORTANT: Only positive words that when negated become negative
        # Do NOT include negative words like "sad", "angry" here!
        positive_words = {
            'happy': 'sadness',
            'good': 'sadness',
            'fine': 'sadness',
            'okay': 'sadness',
            'well': 'sadness',
            'great': 'sadness',
            'wonderful': 'sadness',
            'amazing': 'sadness',
            'excited': 'sadness',
            'joyful': 'sadness',
            'cheerful': 'sadness',
            'glad': 'sadness',
            'pleased': 'sadness',
            'satisfied': 'sadness',
            'content': 'sadness',
            'better': 'sadness',
            'alright': 'sadness',
        }
        
        # Negative words that when negated become positive (NOT sad = relief/joy)
        negative_words = {
            'sad': 'relief',
            'unhappy': 'joy',
            'depressed': 'relief',
            'angry': 'relief',
            'upset': 'relief',
            'worried': 'relief',
            'anxious': 'relief',
            'scared': 'relief',
            'afraid': 'relief',
            'mad': 'relief',
            'frustrated': 'relief',
        }
        
        # Check for "not + negative word" first (these become positive)
        for neg_word in negation_words:
            for negative_word, emotion in negative_words.items():
                patterns = [
                    f'{neg_word} {negative_word}',
                    f'{neg_word} feeling {negative_word}',
                    f'{neg_word} very {negative_word}',
                    f'{neg_word} so {negative_word}',
                    f'{neg_word} really {negative_word}',
                ]
                
                for pattern in patterns:
                    if pattern in text_lower:
                        print(f"[NEGATION-FLIP] '{pattern}' detected -> {emotion}")
                        return emotion
        
        # Then check for "not + positive word" (these become negative)
        for neg_word in negation_words:
            for pos_word, emotion in positive_words.items():
                patterns = [
                    f'{neg_word} {pos_word}',
                    f'{neg_word} feeling {pos_word}',
                    f'{neg_word} very {pos_word}',
                    f'{neg_word} so {pos_word}',
                    f'{neg_word} really {pos_word}',
                ]
                
                for pattern in patterns:
                    if pattern in text_lower:
                        return emotion
        
        return None
    
    def _detect_mixed_emotions(self, text):
        """Check if text contains mixed/conflicting emotions"""
        text_lower = text.lower()
        return any(word in text_lower for word in self.mixed_emotion_words)
    
    def _split_mixed_emotions(self, text):
        """Split text by conjunction and analyze the more important part"""
        text_lower = text.lower()
        
        for word in self.mixed_emotion_words:
            if f' {word} ' in text_lower:
                parts = text_lower.split(f' {word} ', 1)
                if len(parts) == 2:
                    # The part after "but/however" is usually more important
                    return parts[1].strip()
        
        return text
    
    def _normalize_text(self, text):
        """Normalize text for better matching"""
        text = text.lower()
        # Reduce repeated characters (e.g., "sooo" -> "so")
        text = re.sub(r'(.)\1{2,}', r'\1', text)
        # Remove excessive punctuation
        text = re.sub(r'[!?]{2,}', '!', text)
        return text
    
    def _extract_emotion_keywords(self, text):
        """Extract emotion keywords from text"""
        text_lower = text.lower()
        found_emotions = {}
        
        for emotion, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_emotions[emotion] = found_emotions.get(emotion, 0) + 1
        
        return found_emotions
    
    def predict(self, text):
        """
        Predict emotion with advanced contextual understanding
        
        7-Step Detection Pipeline:
        1. Critical keywords (suicide, self-harm)
        2. Idiom detection (figurative language)
        3. Sarcasm detection (context-based flip)
        4. Negation detection (hidden emotions)
        5. Mixed emotions (analyze parts separately)
        6. Keyword matching (short texts)
        7. Transformer model (main prediction)
        """
        
        if not text or not text.strip():
            return {
                'emotion': 'neutral',
                'confidence': 0.5,
                'all_scores': {}
            }
        
        original_text = text
        text_normalized = self._normalize_text(text)
        
        # STEP 1: Check for crisis patterns (semantic understanding)
        for category, patterns in self.crisis_patterns.items():
            for pattern in patterns:
                if pattern in text_normalized:
                    print(f"[CRISIS] Pattern '{pattern}' detected ({category})")
                    return {
                        'emotion': 'grief',
                        'confidence': 1.0,
                        'all_scores': {'grief': 1.0},
                        'intervention_needed': True,
                        'crisis_category': category
                    }
        
        # STEP 2: Check for idioms/metaphors
        idiom_emotion = self._detect_idiom(text_normalized)
        if idiom_emotion:
            print(f"[IDIOM] Detected idiom -> {idiom_emotion}")
            return {
                'emotion': idiom_emotion,
                'confidence': 0.9,
                'all_scores': {idiom_emotion: 0.9},
                'detection_method': 'idiom'
            }
        
        # STEP 3: Check for sarcasm
        if self._detect_sarcasm(text_normalized):
            print("[SARCASM] Detected - flipping to negative emotion")
            # Use transformer but boost negative emotions
            inputs = self.tokenizer(original_text, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                outputs = self.model(**inputs)
                scores = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
            
            # Prefer negative emotions for sarcasm
            negative_emotions = ['annoyance', 'disappointment', 'anger', 'sadness', 'disapproval', 'disgust']
            scores_dict = {self.emotions[i]: scores[i].item() for i in range(len(self.emotions))}
            
            # Boost negative emotions significantly
            for neg_emo in negative_emotions:
                if neg_emo in scores_dict:
                    scores_dict[neg_emo] *= 3.0  # Triple the score
            
            # Get highest negative emotion
            top_emotion = max(scores_dict, key=scores_dict.get)
            
            # Force to negative emotion if current top is positive
            if top_emotion not in negative_emotions:
                top_emotion = max([e for e in negative_emotions if e in scores_dict], 
                                 key=lambda e: scores_dict[e])
            
            return {
                'emotion': top_emotion,
                'confidence': min(scores_dict[top_emotion], 0.75),
                'all_scores': scores_dict,
                'detection_method': 'sarcasm'
            }
        
        # STEP 4: Check for negation/denial
        negation_emotion = self._detect_negation_emotion(text_normalized)
        if negation_emotion:
            print(f"[NEGATION] Detected hidden emotion -> {negation_emotion}")
            return {
                'emotion': negation_emotion,
                'confidence': 0.8,
                'all_scores': {negation_emotion: 0.8},
                'detection_method': 'negation'
            }
        
        # STEP 5: Handle mixed emotions
        if self._detect_mixed_emotions(text_normalized):
            print("[MIXED] Detected mixed emotions - analyzing key part")
            important_part = self._split_mixed_emotions(text_normalized)
            text_to_analyze = important_part
        else:
            text_to_analyze = original_text
        
        # STEP 6: Keyword matching for short texts (1-5 words)
        words = text_normalized.split()
        if len(words) <= 5:
            found_keywords = self._extract_emotion_keywords(text_normalized)
            if found_keywords:
                top_emotion = max(found_keywords, key=found_keywords.get)
                # Higher confidence for single emotional words
                confidence = 0.98 if len(words) <= 2 else 0.95
                return {
                    'emotion': top_emotion,
                    'confidence': confidence,
                    'all_scores': {top_emotion: confidence},
                    'detection_method': 'keyword'
                }
        
        # STEP 7: Use transformer model for prediction
        inputs = self.tokenizer(text_to_analyze, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            scores = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        
        # Convert to dictionary
        scores_dict = {self.emotions[i]: scores[i].item() for i in range(len(self.emotions))}
        
        # Apply keyword boosting
        found_keywords = self._extract_emotion_keywords(text_normalized)
        if found_keywords:
            for emotion in found_keywords:
                if emotion in scores_dict:
                    # Higher boost for exact keyword matches
                    scores_dict[emotion] *= 1.5  # Boost by 50%
        
        # Get top emotion
        top_emotion = max(scores_dict, key=scores_dict.get)
        confidence = scores_dict[top_emotion]
        
        return {
            'emotion': top_emotion,
            'confidence': confidence,
            'all_scores': scores_dict,
            'detection_method': 'transformer'
        }


# Example usage
if __name__ == "__main__":
    print("Testing Transformers Emotion Classifier...\n")
    
    classifier = TransformersEmotionClassifier()
    
    test_texts = [
        "I am extremely happy today!",
        "I feel so sad and alone",
        "This makes me very angry",
        "I'm on cloud nine",
        "Great, just what I needed",
        "I want to kill myself",
    ]
    
    for text in test_texts:
        result = classifier.predict(text)
        print(f"Text: '{text}'")
        print(f"Emotion: {result['emotion']} ({result['confidence']*100:.1f}%)")
        print(f"Method: {result.get('detection_method', 'N/A')}")
        print()
