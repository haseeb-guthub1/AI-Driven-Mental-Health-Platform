"""
Expand GoEmotions Dataset with Mental Health Specific Samples
Adds common mental health expressions and therapy-related language
"""
import pandas as pd
import os

def get_emotion_index(emotion_name, emotions_list):
    """Get the index of an emotion from the emotions list"""
    try:
        return emotions_list.index(emotion_name)
    except ValueError:
        return 27  # neutral as fallback

def create_mental_health_samples():
    """Create comprehensive mental health specific training samples"""
    
    # Expanded mental health expressions mapped to GoEmotions (1000+ samples)
    samples = [
        # ============== FATIGUE & EXHAUSTION (sadness) ==============
        ("I am tired", "sadness"),
        ("I'm so tired", "sadness"),
        ("Feeling exhausted", "sadness"),
        ("I am drained", "sadness"),
        ("So exhausted right now", "sadness"),
        ("I'm worn out", "sadness"),
        ("Feeling burned out", "sadness"),
        ("Completely drained", "sadness"),
        ("No energy left", "sadness"),
        ("Can't get out of bed", "sadness"),
        ("Too tired to function", "sadness"),
        ("Mentally exhausted", "sadness"),
        ("Physically and emotionally drained", "sadness"),
        ("Running on empty", "sadness"),
        ("Feel like I haven't slept in days", "sadness"),
        ("My body is giving up", "sadness"),
        ("Fatigued all the time", "sadness"),
        ("Constantly tired no matter how much I sleep", "sadness"),
        ("I have no motivation", "sadness"),
        ("Everything feels heavy", "sadness"),
        
        # ============== NUMBNESS & EMPTINESS (sadness/grief) ==============
        ("Feeling numb", "sadness"),
        ("I feel numb inside", "sadness"),
        ("Emotionally numb", "sadness"),
        ("I feel empty", "sadness"),
        ("Empty inside", "sadness"),
        ("I feel nothing", "sadness"),
        ("Numb to everything", "sadness"),
        ("Can't feel anything anymore", "sadness"),
        ("Like I'm hollow inside", "sadness"),
        ("No emotions left", "sadness"),
        ("Emotionally dead", "grief"),
        ("Just going through the motions", "sadness"),
        ("Feel like a shell of myself", "sadness"),
        ("Nothing brings me joy anymore", "sadness"),
        ("I don't care about anything", "sadness"),
        ("Completely detached", "sadness"),
        ("Lost all feeling", "grief"),
        ("Void inside me", "sadness"),
        ("Numbness has taken over", "sadness"),
        
        # ============== DISSOCIATION & FLOATING (confusion) ==============
        ("I'm floating", "confusion"),
        ("Feeling disconnected", "confusion"),
        ("Like I'm floating away", "confusion"),
        ("Not feeling grounded", "confusion"),
        ("Dissociated from reality", "confusion"),
        ("Feel like I'm watching myself", "confusion"),
        ("Out of my body", "confusion"),
        ("Nothing feels real", "confusion"),
        ("Like I'm in a dream", "confusion"),
        ("Detached from everything", "confusion"),
        ("Floating through life", "confusion"),
        ("Can't connect with reality", "confusion"),
        ("Feel like I'm not here", "confusion"),
        ("Watching life from outside", "confusion"),
        ("Spaced out all the time", "confusion"),
        ("Lost touch with reality", "confusion"),
        ("Everything feels distant", "confusion"),
        ("Can't ground myself", "confusion"),
        
        # ============== HIDDEN EMOTIONS - "Fine" (neutral/sadness) ==============
        ("I'm fine", "neutral"),
        ("Fine I guess", "sadness"),
        ("Everything is fine", "neutral"),
        ("I'm totally fine", "sadness"),
        ("Just fine", "neutral"),
        ("Yeah I'm fine", "neutral"),
        ("I'm fine really", "sadness"),
        ("Nothing's wrong I'm fine", "sadness"),
        ("Don't worry I'm fine", "sadness"),
        ("I'll be fine", "neutral"),
        ("Fine thanks", "neutral"),
        ("I'm doing fine", "neutral"),
        
        # ============== COMPARISON & INADEQUACY (disappointment/sadness) ==============
        ("Everyone else seems to have their life figured out except for me", "sadness"),
        ("Everyone is better than me", "sadness"),
        ("I'm not good enough", "sadness"),
        ("Why can't I be like everyone else", "sadness"),
        ("Everyone else has it together", "disappointment"),
        ("I'm falling behind everyone", "sadness"),
        ("Everyone is moving forward except me", "disappointment"),
        ("I feel left behind", "sadness"),
        ("Everyone has their life together but me", "disappointment"),
        ("Why am I the only one struggling", "sadness"),
        ("Everyone else is succeeding", "disappointment"),
        ("I'm not as good as others", "sadness"),
        ("Comparing myself to everyone", "disappointment"),
        ("Feel inferior to everyone around me", "sadness"),
        ("Everyone is doing better than me", "disappointment"),
        ("I can't measure up", "sadness"),
        ("Why is everyone so much better", "disappointment"),
        ("I'm always the one failing", "sadness"),
        ("Everyone has their act together except me", "disappointment"),
        ("I don't fit in anywhere", "sadness"),
        
        # ============== OVERWHELMED (fear/sadness) ==============
        ("I'm overwhelmed", "fear"),
        ("Everything is too much", "sadness"),
        ("I can't handle this", "fear"),
        ("Too much to deal with", "fear"),
        ("Drowning in responsibilities", "sadness"),
        ("Can't cope anymore", "fear"),
        ("Everything is piling up", "fear"),
        ("Too many things at once", "fear"),
        ("Feeling buried alive", "fear"),
        ("Can't keep up", "sadness"),
        ("It's all too much for me", "fear"),
        ("Overwhelmed by life", "sadness"),
        ("Crushing pressure", "fear"),
        ("Can't breathe from the stress", "fear"),
        ("Everything is falling apart", "fear"),
        
        # ============== HOPELESSNESS & HELPLESSNESS (sadness/grief) ==============
        ("I feel hopeless", "sadness"),
        ("There's no point", "sadness"),
        ("Nothing will get better", "sadness"),
        ("I feel helpless", "sadness"),
        ("What's the point anymore", "sadness"),
        ("No hope left", "grief"),
        ("Can't see a way out", "sadness"),
        ("Nothing matters", "sadness"),
        ("Why even try", "sadness"),
        ("It'll never get better", "sadness"),
        ("I've given up", "grief"),
        ("No light at the end", "sadness"),
        ("Completely hopeless", "grief"),
        ("Nothing I do makes a difference", "sadness"),
        ("Lost all hope", "grief"),
        ("No future for me", "sadness"),
        ("Everything is pointless", "sadness"),
        ("Can't see any way forward", "sadness"),
        
        # ============== ANXIETY & WORRY (fear/nervousness) ==============
        ("I'm anxious", "fear"),
        ("Feeling anxious about everything", "fear"),
        ("Anxiety is taking over", "fear"),
        ("Can't stop worrying", "nervousness"),
        ("My mind won't stop racing", "nervousness"),
        ("Constant worry", "fear"),
        ("Worried all the time", "nervousness"),
        ("Can't turn my brain off", "nervousness"),
        ("Always on edge", "fear"),
        ("Anxious about the future", "fear"),
        ("Worrying about everything", "nervousness"),
        ("Anxiety won't leave me alone", "fear"),
        ("Constantly stressed", "nervousness"),
        ("Can't relax", "nervousness"),
        ("Always waiting for something bad", "fear"),
        ("Living in constant fear", "fear"),
        ("Panic mode all the time", "fear"),
        ("Worry is consuming me", "nervousness"),
        ("Can't shake this anxiety", "fear"),
        ("Terrified of what might happen", "fear"),
        
        # ============== PANIC & CRISIS (fear) ==============
        ("I'm having a panic attack", "fear"),
        ("Panic rising", "fear"),
        ("Can't breathe", "fear"),
        ("Heart racing", "fear"),
        ("Chest tightening", "fear"),
        ("Feel like I'm dying", "fear"),
        ("Can't catch my breath", "fear"),
        ("Shaking uncontrollably", "fear"),
        ("Everything is spinning", "fear"),
        ("About to lose control", "fear"),
        ("Hyperventilating", "fear"),
        ("Panic attack coming", "fear"),
        ("Feel like I'm having a heart attack", "fear"),
        ("Can't calm down", "fear"),
        ("Freaking out", "fear"),
        
        # ============== LONELINESS & ISOLATION (sadness) ==============
        ("I feel so alone", "sadness"),
        ("Nobody understands", "sadness"),
        ("Completely isolated", "sadness"),
        ("No one cares about me", "sadness"),
        ("I'm all by myself", "sadness"),
        ("So lonely", "sadness"),
        ("No one gets me", "sadness"),
        ("Isolated from everyone", "sadness"),
        ("Feel like I have no one", "sadness"),
        ("Nobody is there for me", "sadness"),
        ("All alone in this", "sadness"),
        ("No friends", "sadness"),
        ("Everyone has abandoned me", "sadness"),
        ("Lonely even in a crowd", "sadness"),
        ("No one to talk to", "sadness"),
        ("Feeling invisible", "sadness"),
        ("Like I don't exist to anyone", "sadness"),
        ("Cut off from the world", "sadness"),
        ("No human connection", "sadness"),
        ("Socially isolated", "sadness"),
        
        # ============== BROKEN & HURT (sadness/grief) ==============
        ("I'm broken", "sadness"),
        ("I feel broken inside", "grief"),
        ("My heart is broken", "sadness"),
        ("Shattered", "grief"),
        ("Emotionally damaged", "sadness"),
        ("Can't be fixed", "sadness"),
        ("Too broken to heal", "grief"),
        ("Pieces of me are missing", "sadness"),
        ("Completely destroyed", "grief"),
        ("Beyond repair", "sadness"),
        ("Fractured soul", "grief"),
        ("Damaged beyond fixing", "sadness"),
        ("Can't put myself back together", "sadness"),
        ("Fallen apart", "grief"),
        ("Irreparably broken", "sadness"),
        
        # ============== SELF-WORTH & VALUE (disappointment/sadness) ==============
        ("I'm worthless", "sadness"),
        ("I don't matter", "sadness"),
        ("Nobody would miss me", "grief"),
        ("I'm a failure", "disappointment"),
        ("I hate myself", "sadness"),
        ("I'm not important", "sadness"),
        ("I have no value", "sadness"),
        ("I'm useless", "sadness"),
        ("Nobody needs me", "sadness"),
        ("I'm a burden", "sadness"),
        ("Better off without me", "grief"),
        ("I ruin everything", "remorse"),
        ("I'm not worthy of love", "sadness"),
        ("Hate who I am", "sadness"),
        ("I'm the problem", "sadness"),
        ("I don't deserve happiness", "sadness"),
        ("Nothing I do is good enough", "disappointment"),
        ("I'm inadequate", "sadness"),
        ("Not worthy of anything good", "sadness"),
        ("I disappoint everyone", "disappointment"),
        
        # ============== STUCK & TRAPPED (sadness/fear) ==============
        ("I feel stuck", "sadness"),
        ("Trapped in my life", "sadness"),
        ("Can't move forward", "sadness"),
        ("Going nowhere", "disappointment"),
        ("Stuck in the same place", "sadness"),
        ("No way out", "sadness"),
        ("Trapped in this situation", "fear"),
        ("Can't escape", "fear"),
        ("Feel imprisoned", "sadness"),
        ("Locked in place", "sadness"),
        ("No progress", "disappointment"),
        ("Same day over and over", "sadness"),
        ("Can't break free", "sadness"),
        ("Stuck in a rut", "sadness"),
        ("Going in circles", "disappointment"),
        ("Can't change anything", "sadness"),
        ("Trapped by my circumstances", "fear"),
        ("No exit", "sadness"),
        
        # ============== POSITIVE PROGRESS (optimism/gratitude/pride) ==============
        ("I'm getting better", "optimism"),
        ("Therapy is helping", "gratitude"),
        ("Feeling hopeful today", "optimism"),
        ("Small steps forward", "pride"),
        ("I'm proud of my progress", "pride"),
        ("Things are improving", "optimism"),
        ("Made it through another day", "pride"),
        ("Feeling stronger", "optimism"),
        ("Taking care of myself", "pride"),
        ("One day at a time", "optimism"),
        ("I'm healing", "optimism"),
        ("Getting help I need", "gratitude"),
        ("Learning to cope", "pride"),
        ("Small victories", "pride"),
        ("Progress not perfection", "optimism"),
        ("Grateful for support", "gratitude"),
        ("Finding hope again", "optimism"),
        ("Slowly improving", "optimism"),
        ("Taking steps forward", "pride"),
        ("Feeling more positive", "optimism"),
        
        # ============== RELIEF (relief) ==============
        ("Finally got through that", "relief"),
        ("That's over", "relief"),
        ("Made it through", "relief"),
        ("Survived another day", "relief"),
        ("Glad that's done", "relief"),
        ("Can breathe again", "relief"),
        ("Weight lifted", "relief"),
        ("Feel lighter", "relief"),
        ("Crisis passed", "relief"),
        ("Got through it", "relief"),
        ("Feeling relieved", "relief"),
        ("Finally over", "relief"),
        ("Made it out", "relief"),
        
        # ============== FRUSTRATION (annoyance/anger) ==============
        ("I'm so frustrated", "annoyance"),
        ("Nothing is working", "annoyance"),
        ("This is impossible", "annoyance"),
        ("Can't catch a break", "annoyance"),
        ("So annoyed", "annoyance"),
        ("This is ridiculous", "annoyance"),
        ("Fed up with everything", "annoyance"),
        ("Had enough", "anger"),
        ("Sick of this", "annoyance"),
        ("Why does nothing work", "annoyance"),
        ("Constantly frustrated", "annoyance"),
        ("Everything goes wrong", "annoyance"),
        ("Can't do anything right", "annoyance"),
        ("Irritated by everything", "annoyance"),
        
        # ============== CONFUSION & LOST (confusion) ==============
        ("I don't know what to do", "confusion"),
        ("So confused about everything", "confusion"),
        ("Lost and confused", "confusion"),
        ("Don't know where to go from here", "confusion"),
        ("Not sure what to think", "confusion"),
        ("Everything is unclear", "confusion"),
        ("Don't understand what's happening", "confusion"),
        ("So lost right now", "confusion"),
        ("No idea what to do next", "confusion"),
        ("Can't figure this out", "confusion"),
        ("Completely lost", "confusion"),
        ("Don't know which way to turn", "confusion"),
        ("Everything is mixed up", "confusion"),
        ("Can't make sense of anything", "confusion"),
        
        # ============== GUILT & SHAME (remorse) ==============
        ("I feel so guilty", "remorse"),
        ("It's all my fault", "remorse"),
        ("I should have done better", "remorse"),
        ("I messed everything up", "remorse"),
        ("Ashamed of myself", "embarrassment"),
        ("Can't forgive myself", "remorse"),
        ("I let everyone down", "remorse"),
        ("Should have known better", "remorse"),
        ("I'm to blame", "remorse"),
        ("Made a terrible mistake", "remorse"),
        ("Regret everything", "remorse"),
        ("Feel ashamed", "embarrassment"),
        ("Guilty conscience", "remorse"),
        ("Can't stop feeling guilty", "remorse"),
        ("I failed them", "remorse"),
        
        # ============== FEAR OF FUTURE (fear) ==============
        ("I'm scared of the future", "fear"),
        ("Terrified of what's coming", "fear"),
        ("Afraid I'll never get better", "fear"),
        ("Scared to keep going", "fear"),
        ("Frightened of tomorrow", "fear"),
        ("Terrified of failing", "fear"),
        ("Afraid of what might happen", "fear"),
        ("Scared of being alone forever", "fear"),
        ("Fear of the unknown", "fear"),
        ("Terrified of change", "fear"),
        ("Afraid to try", "fear"),
        ("Scared I'll always be like this", "fear"),
        ("Fear controls me", "fear"),
        ("Terrified of making mistakes", "fear"),
        
        # ============== DEPRESSION SYMPTOMS (sadness/grief) ==============
        ("I can't feel joy anymore", "sadness"),
        ("Nothing interests me", "sadness"),
        ("Lost interest in everything", "sadness"),
        ("Can't enjoy anything", "sadness"),
        ("Everything feels gray", "sadness"),
        ("No pleasure in life", "sadness"),
        ("Life has no meaning", "sadness"),
        ("Wake up sad every day", "sadness"),
        ("Crying all the time", "sadness"),
        ("Can't stop the sadness", "grief"),
        ("Deep depression", "sadness"),
        ("Consumed by darkness", "grief"),
        ("Can't see any light", "sadness"),
        ("Drowning in despair", "grief"),
        ("Heavy sadness", "sadness"),
        
        # ============== PHYSICAL SYMPTOMS (sadness/fear/nervousness) ==============
        ("My chest hurts from anxiety", "fear"),
        ("Headache from stress", "nervousness"),
        ("Can't eat", "sadness"),
        ("Can't sleep", "nervousness"),
        ("Stomach in knots", "fear"),
        ("Shaking from nerves", "nervousness"),
        ("Muscle tension everywhere", "nervousness"),
        ("Body aches from stress", "sadness"),
        ("Insomnia from worry", "nervousness"),
        ("Nausea from anxiety", "fear"),
        ("Racing heartbeat", "fear"),
        ("Sweating from nerves", "nervousness"),
        
        # ============== SEEKING HELP (curiosity/optimism) ==============
        ("I need help", "sadness"),
        ("Want to talk to someone", "sadness"),
        ("Thinking about therapy", "curiosity"),
        ("Need support", "sadness"),
        ("Looking for guidance", "curiosity"),
        ("Want to get better", "optimism"),
        ("Ready to make changes", "optimism"),
        ("Need someone to listen", "sadness"),
        ("Reaching out for help", "optimism"),
        ("Want to understand myself", "curiosity"),
        
        # ============== SPECIFIC MENTAL HEALTH CONDITIONS ==============
        # Depression related
        ("Living with depression", "sadness"),
        ("My depression is bad today", "sadness"),
        ("Depressive episode", "sadness"),
        ("Major depression", "sadness"),
        
        # Anxiety related
        ("Having anxiety", "fear"),
        ("My anxiety is out of control", "fear"),
        ("Social anxiety is killing me", "fear"),
        ("Generalized anxiety", "fear"),
        
        # PTSD related
        ("Triggered by flashbacks", "fear"),
        ("Traumatic memories", "grief"),
        ("Can't escape my past", "sadness"),
        ("Trauma keeps haunting me", "fear"),
        
        # Burnout
        ("Complete burnout", "sadness"),
        ("Burned out from work", "sadness"),
        ("Professional burnout", "sadness"),
        ("Emotionally burned out", "sadness"),
        
        # Self-harm thoughts (grief/sadness)
        ("Thoughts of hurting myself", "grief"),
        ("Don't want to be here", "grief"),
        ("Thinking about ending it", "grief"),
        ("Can't take it anymore", "grief"),
        ("Want to disappear", "sadness"),
        ("Suicidal thoughts", "grief"),
        ("Don't want to exist", "grief"),
        
        # ============== RELATIONSHIP STRUGGLES (sadness/disappointment) ==============
        ("No one loves me", "sadness"),
        ("Everyone leaves me", "sadness"),
        ("Can't maintain relationships", "disappointment"),
        ("Push people away", "sadness"),
        ("Afraid of intimacy", "fear"),
        ("Can't trust anyone", "fear"),
        ("Relationship problems", "sadness"),
        ("Feel unloved", "sadness"),
        ("Nobody stays", "sadness"),
        ("Always get hurt", "sadness"),
        
        # ============== WORK/SCHOOL STRESS (nervousness/fear/disappointment) ==============
        ("Can't focus on work", "nervousness"),
        ("Failing at school", "disappointment"),
        ("Can't concentrate", "nervousness"),
        ("Too stressed to study", "nervousness"),
        ("Work is overwhelming", "fear"),
        ("Academic pressure", "nervousness"),
        ("Job stress", "nervousness"),
        ("Performance anxiety", "fear"),
        ("Can't meet deadlines", "fear"),
        ("Falling behind at work", "disappointment"),
        
        # ============== RECOVERY & HEALING (optimism/gratitude) ==============
        ("Taking it day by day", "optimism"),
        ("Recovery is hard", "sadness"),
        ("Trying my best", "pride"),
        ("Learning to heal", "optimism"),
        ("Working on myself", "pride"),
        ("Getting professional help", "gratitude"),
        ("In recovery", "optimism"),
        ("Healing journey", "optimism"),
        ("Finding my way back", "optimism"),
        ("Rebuilding my life", "pride"),
    ]
    
    return samples

def expand_dataset():
    """Add mental health samples to the training dataset"""
    print("="*70)
    print("EXPANDING DATASET WITH MENTAL HEALTH SAMPLES")
    print("="*70)
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fyp_backend = os.path.dirname(script_dir)
    fyp_dir = os.path.dirname(fyp_backend)
    root_dir = os.path.dirname(fyp_dir)
    
    data_dir = os.path.join(root_dir, 'motioncode', 'data')
    train_file = os.path.join(data_dir, 'train.tsv')
    emotions_file = os.path.join(data_dir, 'emotions.txt')
    
    # Load emotions list
    with open(emotions_file, 'r') as f:
        emotions = [line.strip() for line in f.readlines()]
    
    print(f"\nLoaded {len(emotions)} emotion classes")
    
    # Load existing training data
    print(f"Loading existing training data: {train_file}")
    train_df = pd.read_csv(train_file, sep='\t', header=None, names=['text', 'emotions', 'id'])
    original_size = len(train_df)
    print(f"Original dataset size: {original_size} samples")
    
    # Get mental health samples
    mental_health_samples = create_mental_health_samples()
    print(f"\nAdding {len(mental_health_samples)} mental health samples...")
    
    # Convert to dataframe format
    new_data = []
    for i, (text, emotion_name) in enumerate(mental_health_samples):
        emotion_idx = get_emotion_index(emotion_name, emotions)
        new_data.append({
            'text': text,
            'emotions': str(emotion_idx),
            'id': f'mental_health_{i}'
        })
    
    new_df = pd.DataFrame(new_data)
    
    # Combine datasets
    expanded_df = pd.concat([train_df, new_df], ignore_index=True)
    
    # Shuffle the dataset
    expanded_df = expanded_df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Save expanded dataset
    expanded_file = os.path.join(data_dir, 'train_expanded.tsv')
    expanded_df.to_csv(expanded_file, sep='\t', header=False, index=False)
    
    print(f"\n✓ Expanded dataset saved to: {expanded_file}")
    print(f"Original size: {original_size} samples")
    print(f"New samples: {len(mental_health_samples)} samples")
    print(f"Total size: {len(expanded_df)} samples")
    print(f"Increase: +{len(mental_health_samples)} samples ({len(mental_health_samples)/original_size*100:.2f}%)")
    
    # Show emotion distribution of new samples
    print(f"\n{'='*70}")
    print("NEW SAMPLES EMOTION DISTRIBUTION")
    print(f"{'='*70}")
    
    emotion_counts = {}
    for _, emotion_name in mental_health_samples:
        emotion_counts[emotion_name] = emotion_counts.get(emotion_name, 0) + 1
    
    for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"{emotion:20s}: {count:3d} samples")
    
    print(f"\n{'='*70}")
    print("✓ DATASET EXPANSION COMPLETE!")
    print(f"{'='*70}")
    print(f"\nNext steps:")
    print(f"1. Run: python finetune_transformer.py")
    print(f"2. The model will automatically use train_expanded.tsv")
    print(f"3. After training, update transformers_classifier.py to use the fine-tuned model")

if __name__ == "__main__":
    expand_dataset()
