"""
Cognitive AI Coach - Response Generator
Generates intelligent, context-aware responses based on user intent and emotional state
"""
import re
import random
from typing import Dict, List, Tuple, Optional

class EmotionResponseGenerator:
    """Generate empathetic, actionable responses using Acknowledge-Address-Action framework"""
    
    def __init__(self):
        self.response_templates = self._initialize_templates()
        self.follow_up_questions = self._initialize_questions()
        self.coping_strategies = self._initialize_strategies()
    
    def _initialize_templates(self) -> Dict[str, List[str]]:
        """Response templates for each emotion"""
        return {
            'sadness': [
                "I hear that you're going through a difficult time. It's completely valid to feel this way. {question}",
                "Thank you for sharing this with me. Sadness is a natural response to loss or disappointment. {strategy}",
                "I can sense the heaviness you're carrying. Remember, it's okay to not be okay sometimes. {question}",
                "Your feelings are valid and important. Sometimes sitting with sadness can help us understand ourselves better. {strategy}"
            ],
            'joy': [
                "That's wonderful! I can feel your positive energy. {question}",
                "I'm so glad to hear things are going well for you! {question}",
                "It's great to see you in such good spirits! Keep nurturing this positive feeling. {strategy}",
                "Your happiness is contagious! Let's explore what's bringing you this joy. {question}"
            ],
            'anger': [
                "I understand you're feeling frustrated right now. That's a valid emotion. {question}",
                "It sounds like something has really upset you. Let's work through this together. {strategy}",
                "Anger often signals that a boundary has been crossed or a need hasn't been met. {question}",
                "I hear your frustration. Let's explore what's underneath this anger. {question}"
            ],
            'fear': [
                "I can sense your worry. Fear is our mind's way of trying to protect us. {question}",
                "It's brave of you to share your fears. Let's work through this together. {strategy}",
                "Anxiety can feel overwhelming, but you're not alone in this. {question}",
                "What you're feeling is real and valid. Let's find ways to help you feel more grounded. {strategy}"
            ],
            'anxiety': [
                "I understand you're feeling anxious. Let's take this one step at a time. {strategy}",
                "Anxiety can be overwhelming, but we can work through this together. {question}",
                "Your feelings are valid. Many people experience anxiety, and there are ways to manage it. {strategy}",
                "Let's focus on what we can control right now. {question}"
            ],
            'love': [
                "It's beautiful to hear about the love and connection in your life. {question}",
                "Love and connection are fundamental to our wellbeing. I'm glad you're experiencing this. {question}",
                "Those feelings of care and connection are precious. {strategy}",
                "It's wonderful that you're open to experiencing and expressing love. {question}"
            ],
            'grief': [
                "I'm deeply sorry for what you're going through. Grief is one of the most profound emotions we experience. {question}",
                "Thank you for trusting me with your grief. Loss is incredibly difficult, and healing takes time. {strategy}",
                "There's no right way to grieve. Your feelings, whatever they are, are valid. {question}",
                "⚠️ If you're in crisis, please reach out: 📞 National Suicide Prevention Lifeline: 988 | 💬 Crisis Text Line: Text 'HELLO' to 741741. {question}"
            ],
            'surprise': [
                "That sounds unexpected! How are you processing this new information? {question}",
                "Surprises can take a moment to digest. {question}",
                "It's natural to need time to adjust to unexpected changes. {strategy}",
                "Tell me more about what surprised you. {question}"
            ],
            'disgust': [
                "It sounds like something has really bothered you. Your feelings are valid. {question}",
                "I can sense your strong reaction to this. Let's explore what's behind these feelings. {question}",
                "Sometimes disgust is our body's way of protecting us from what feels harmful. {strategy}",
                "I hear that this situation isn't sitting well with you. {question}"
            ],
            'confusion': [
                "It's okay to feel uncertain or confused. Let's work through this together. {question}",
                "Confusion often means we're processing something complex. That's actually a sign of growth. {strategy}",
                "Let's break this down together and find some clarity. {question}",
                "I'm here to help you sort through these mixed feelings. {question}"
            ],
            'disappointment': [
                "I hear your disappointment. It's hard when things don't go as we hoped. {question}",
                "Disappointment is a natural response when expectations aren't met. {strategy}",
                "Your feelings are completely understandable. Let's explore what this means for you. {question}",
                "Sometimes disappointment can teach us important things about ourselves. {question}"
            ],
            'nervousness': [
                "I can sense your nervousness. That's completely normal when facing something new or uncertain. {strategy}",
                "Nervous energy shows you care about the outcome. Let's channel that into preparation. {question}",
                "Many people feel nervous in situations like this. You're not alone. {strategy}",
                "Let's work on some techniques to help you feel more grounded. {strategy}"
            ],
            'neutral': [
                "I'm here to listen. What's on your mind today? {question}",
                "Thank you for sharing with me. {question}",
                "I appreciate you opening up. How can I best support you right now? {question}",
                "I'm here for you. {question}"
            ],
            'gratitude': [
                "It's wonderful that you're feeling grateful. Gratitude is such a powerful emotion for wellbeing. {question}",
                "I love hearing about what you're thankful for. Gratitude helps us focus on the positive. {strategy}",
                "That's beautiful. Recognizing what we appreciate can shift our whole perspective. {question}",
                "Your ability to feel gratitude, even in difficult times, shows real strength. {question}"
            ],
            'admiration': [
                "It's great that you're recognizing positive qualities in others. That shows self-awareness. {question}",
                "Admiration can inspire us to grow. What about this resonates with you? {question}",
                "I can hear the respect and appreciation in what you're sharing. {question}",
                "Sometimes the qualities we admire in others are ones we have or want to develop ourselves. {strategy}"
            ],
            'excitement': [
                "I can feel your enthusiasm! That energy is wonderful. {question}",
                "It's great to hear you so excited! Let's explore what's bringing you this joy. {question}",
                "Your excitement is infectious! {strategy}",
                "I love your positive energy! Tell me more about what has you so excited. {question}"
            ],
            'optimism': [
                "I appreciate your hopeful outlook. Optimism can be a real strength. {question}",
                "Your positive perspective is refreshing. Let's build on that. {strategy}",
                "It sounds like you're seeing possibilities ahead. That's wonderful. {question}",
                "Maintaining hope and optimism, especially during challenges, takes real courage. {question}"
            ],
            'remorse': [
                "I hear that you're struggling with regret. That shows self-awareness and empathy. {question}",
                "It takes courage to acknowledge our mistakes. That's the first step toward growth. {strategy}",
                "Remorse shows you care about the impact of your actions. That's actually a positive quality. {question}",
                "Self-forgiveness is just as important as making amends. {strategy}"
            ],
            'curiosity': [
                "I love your curiosity and desire to understand more. That's how we grow. {question}",
                "Your questioning mindset is wonderful. Let's explore this together. {question}",
                "Curiosity is a sign of an active, engaged mind. {strategy}",
                "Let's dive deeper into what you're curious about. {question}"
            ],
            'realization': [
                "That sounds like an important insight. How does this realization make you feel? {question}",
                "It's powerful when things click into place like that. {strategy}",
                "These moments of clarity can be transformative. Let's explore what this means for you. {question}",
                "I can hear that something has become clearer for you. That's wonderful progress. {question}"
            ]
        }
    
    def _initialize_questions(self) -> Dict[str, List[str]]:
        """Follow-up questions for each emotion"""
        return {
            'sadness': [
                "What has been weighing on your mind?",
                "Is there something specific that triggered these feelings?",
                "Have you been able to talk to anyone about how you're feeling?",
                "What usually helps you when you feel this way?"
            ],
            'joy': [
                "What brought about this positive change?",
                "How can you hold onto this feeling?",
                "What other good things are happening in your life?",
                "Who can you share this happiness with?"
            ],
            'anger': [
                "What's at the heart of this frustration?",
                "What would help you feel heard right now?",
                "What boundaries might need to be set?",
                "What's the most important thing you need to communicate?"
            ],
            'fear': [
                "What specific worries are on your mind?",
                "What helps you feel safer or more secure?",
                "Are these fears based on past experiences or future possibilities?",
                "What small step could help you feel more in control?"
            ],
            'anxiety': [
                "What's your biggest concern right now?",
                "When do you feel most at ease?",
                "What physical sensations are you noticing?",
                "What would help you feel more grounded in this moment?"
            ],
            'love': [
                "What makes this relationship meaningful to you?",
                "How do you express your care for them?",
                "What does love mean to you?",
                "How does this connection enrich your life?"
            ],
            'grief': [
                "Would you like to talk about what you've lost?",
                "What memories are most precious to you?",
                "How are you taking care of yourself during this time?",
                "Is there support available to you right now?"
            ],
            'surprise': [
                "How do you feel about this unexpected development?",
                "What aspects of this surprise you most?",
                "How are you adjusting to this new information?",
                "What opportunities might this unexpected change bring?"
            ],
            'disgust': [
                "What about this situation feels wrong to you?",
                "How would you like things to be different?",
                "What values are being challenged here?",
                "What boundaries might need attention?"
            ],
            'confusion': [
                "What feels most unclear to you right now?",
                "What information might help you understand better?",
                "What are the different perspectives you're considering?",
                "What would clarity look like for you?"
            ],
            'disappointment': [
                "What were you hoping for?",
                "How significant is this disappointment in the bigger picture?",
                "What can you learn from this experience?",
                "What's your next step forward?"
            ],
            'nervousness': [
                "What specific aspect makes you most nervous?",
                "What's the best possible outcome you can imagine?",
                "What preparation have you done so far?",
                "What helps you feel more confident?"
            ],
            'neutral': [
                "What's been on your mind lately?",
                "How have things been going for you?",
                "What would you like to focus on today?",
                "Is there anything you'd like to explore together?"
            ],
            'gratitude': [
                "What are you most grateful for right now?",
                "How does this gratitude affect your overall mood?",
                "Who might you want to express appreciation to?",
                "What other blessings have you noticed recently?"
            ],
            'admiration': [
                "What specific qualities do you admire?",
                "How might you cultivate similar qualities in yourself?",
                "What does this person's example teach you?",
                "How does this admiration inspire you?"
            ],
            'excitement': [
                "What are you most looking forward to?",
                "How are you preparing for this?",
                "What makes this so exciting for you?",
                "Who else shares your excitement?"
            ],
            'optimism': [
                "What gives you hope right now?",
                "What positive changes are you seeing?",
                "How can you maintain this hopeful perspective?",
                "What goals are inspiring you?"
            ],
            'remorse': [
                "What would you like to do differently?",
                "What have you learned from this experience?",
                "How can you make amends if needed?",
                "What steps toward self-forgiveness feel right?"
            ],
            'curiosity': [
                "What sparked your interest in this?",
                "What would you like to understand better?",
                "What questions are you exploring?",
                "Where might you find the answers you seek?"
            ],
            'realization': [
                "How does this new understanding change things?",
                "What led you to this realization?",
                "What does this mean for you moving forward?",
                "How can you apply this insight?"
            ]
        }
    
    def _initialize_strategies(self) -> Dict[str, List[str]]:
        """Coping strategies for each emotion"""
        return {
            'sadness': [
                "Consider journaling your feelings or talking to someone you trust.",
                "Self-compassion is important - treat yourself with the same kindness you'd offer a friend.",
                "Gentle movement like walking or stretching can help process difficult emotions.",
                "Remember that sadness, while painful, is temporary and part of being human."
            ],
            'joy': [
                "Savor this moment - maybe write it down or share it with someone.",
                "Consider what contributed to this happiness so you can nurture more of it.",
                "Gratitude practices can help extend positive feelings.",
                "Let yourself fully experience and celebrate this joy."
            ],
            'anger': [
                "Try taking some deep breaths before responding to the situation.",
                "Physical activity can help release angry energy constructively.",
                "Writing down your thoughts might help you see the situation more clearly.",
                "Consider what unmet need this anger might be pointing to."
            ],
            'fear': [
                "Grounding techniques like 5-4-3-2-1 (5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste) can help.",
                "Deep, slow breathing activates your body's relaxation response.",
                "Challenge anxious thoughts: Is this fear based on facts or assumptions?",
                "Focus on what you can control in this moment."
            ],
            'anxiety': [
                "Try progressive muscle relaxation or deep breathing exercises.",
                "Break overwhelming tasks into smaller, manageable steps.",
                "Practice mindfulness - focus on the present moment rather than future worries.",
                "Regular sleep, exercise, and limiting caffeine can help manage anxiety."
            ],
            'love': [
                "Express your appreciation directly to the people you care about.",
                "Practice loving-kindness meditation to extend compassion to yourself and others.",
                "Nurture your relationships through quality time and open communication.",
                "Remember that healthy love includes respecting boundaries."
            ],
            'grief': [
                "Allow yourself to feel your emotions without judgment - grief has no timeline.",
                "Connect with supportive people who understand your loss.",
                "Self-care is crucial - eat, sleep, and move your body even when it's hard.",
                "Consider professional grief counseling if you need additional support."
            ],
            'surprise': [
                "Give yourself time to process unexpected information.",
                "Talk through your reactions with someone you trust.",
                "Stay flexible and open to new possibilities.",
                "Focus on what you can learn from this unexpected development."
            ],
            'disgust': [
                "Trust your instincts - disgust often signals values violations.",
                "Set clear boundaries around what you will and won't accept.",
                "Consider whether action is needed to address the situation.",
                "Talk to someone who shares your values to validate your feelings."
            ],
            'confusion': [
                "Write down what you know versus what you're unsure about.",
                "Break complex situations into smaller pieces to analyze.",
                "Seek information from reliable sources.",
                "It's okay to take time to make decisions when things are unclear."
            ],
            'disappointment': [
                "Allow yourself to acknowledge and feel the disappointment fully.",
                "Consider what you can learn from this experience.",
                "Adjust your expectations and make a new plan.",
                "Practice self-compassion - setbacks are part of everyone's journey."
            ],
            'nervousness': [
                "Prepare as much as you can, then practice self-compassion.",
                "Visualization - imagine yourself handling the situation successfully.",
                "Deep breathing exercises can calm your nervous system.",
                "Remember that some nervousness can actually enhance performance."
            ],
            'neutral': [
                "Sometimes neutral feelings give us space to rest and recharge.",
                "Consider checking in with yourself: How am I really feeling?",
                "Use this calm to reflect on what matters most to you.",
                "Contentment and peace are valuable emotional states too."
            ],
            'gratitude': [
                "Keep a gratitude journal to build on this positive practice.",
                "Express your appreciation to others - it strengthens relationships.",
                "Notice the small things you're grateful for each day.",
                "Gratitude practices are linked to improved mental health."
            ],
            'admiration': [
                "Let inspiring people motivate your own growth.",
                "Consider mentorship or learning opportunities in areas you admire.",
                "Express your admiration authentically - it can strengthen connections.",
                "Reflect on the qualities you admire and how they align with your values."
            ],
            'excitement': [
                "Channel your energy into productive preparation.",
                "Share your excitement with others who will celebrate with you.",
                "Use this positive energy to tackle challenges.",
                "Enjoy the anticipation - it's part of the joy!"
            ],
            'optimism': [
                "Set realistic goals that align with your hopeful vision.",
                "Share your positive outlook with others - optimism is contagious.",
                "Build on this foundation with concrete action steps.",
                "Balance optimism with practical planning for best results."
            ],
            'remorse': [
                "Make amends where possible and appropriate.",
                "Learn from the experience and commit to different choices going forward.",
                "Practice self-forgiveness - you're human and growth comes from mistakes.",
                "Consider how this experience has increased your empathy and wisdom."
            ],
            'curiosity': [
                "Follow your curiosity - it often leads to growth and discovery.",
                "Ask questions, read, research, and explore.",
                "Stay open-minded as you learn new things.",
                "Curiosity is a strength that keeps life interesting and meaningful."
            ],
            'realization': [
                "Take time to integrate this new understanding.",
                "Consider how this insight might change your perspective or actions.",
                "Journal about your realization to deepen your understanding.",
                "Share your insight with trusted others who might benefit from it."
            ]
        }
    
    def _extract_key_topics(self, user_message: str) -> Dict[str, any]:
        """Extract key topics and themes from user message"""
        message_lower = user_message.lower()
        
        topics = {
            'work_related': any(word in message_lower for word in ['work', 'job', 'boss', 'career', 'office', 'colleague', 'project', 'deadline']),
            'relationship': any(word in message_lower for word in ['relationship', 'partner', 'boyfriend', 'girlfriend', 'husband', 'wife', 'friend', 'family']),
            'health': any(word in message_lower for word in ['health', 'sick', 'pain', 'doctor', 'hospital', 'illness', 'diagnosis']),
            'loss': any(word in message_lower for word in ['lost', 'died', 'death', 'passed away', 'funeral', 'loss', 'gone']),
            'financial': any(word in message_lower for word in ['money', 'debt', 'financial', 'bills', 'rent', 'afford', 'broke', 'loan']),
            'sleep': any(word in message_lower for word in ['sleep', 'insomnia', 'tired', 'exhausted', 'rest', 'awake']),
            'future': any(word in message_lower for word in ['future', 'tomorrow', 'next', 'plan', 'goal', 'dream', 'hope']),
            'loneliness': any(word in message_lower for word in ['alone', 'lonely', 'isolated', 'nobody', 'no one', 'by myself']),
            'achievement': any(word in message_lower for word in ['achieved', 'accomplished', 'succeeded', 'won', 'got', 'made it', 'passed']),
        }
        
        return topics
    
    def _create_personalized_opening(self, user_message: str, emotion: str, topics: Dict[str, bool]) -> str:
        """Create a personalized opening that references the user's specific situation"""
        openings = []
        
        # Work-related openings
        if topics['work_related']:
            openings.extend([
                f"I understand that work situations can be really challenging. ",
                f"It sounds like you're dealing with something difficult at work. ",
                f"Work-related stress can really take a toll on us. "
            ])
        
        # Relationship openings
        if topics['relationship']:
            openings.extend([
                f"Relationships can bring both joy and pain. I hear what you're going through. ",
                f"The people we care about have such a profound impact on our wellbeing. ",
                f"Thank you for sharing what's happening in your relationship. "
            ])
        
        # Loss openings
        if topics['loss']:
            openings.extend([
                f"I'm so sorry for your loss. Grief is one of the most difficult emotions to navigate. ",
                f"Losing someone is incredibly painful, and I'm here to support you through this. ",
                f"There are no words that can take away this pain, but I want you to know I'm here to listen. "
            ])
        
        # Financial openings
        if topics['financial']:
            openings.extend([
                f"Financial stress is one of the most common sources of anxiety, and your concerns are completely valid. ",
                f"Money worries can be overwhelming. Let's talk about what you're facing. ",
                f"Financial challenges can affect every part of our lives. I hear your concern. "
            ])
        
        # Health openings
        if topics['health']:
            openings.extend([
                f"Health concerns can be really frightening and overwhelming. ",
                f"Dealing with health issues affects not just our body but our emotional wellbeing too. ",
                f"I understand that health challenges can create a lot of worry and stress. "
            ])
        
        # Loneliness openings
        if topics['loneliness']:
            openings.extend([
                f"Feeling alone is such a heavy burden to carry. I want you to know you're not alone in this conversation. ",
                f"Loneliness can be one of the most painful feelings. I'm here with you. ",
                f"I hear that you're feeling isolated, and I want you to know that reaching out like this shows real strength. "
            ])
        
        # Achievement openings
        if topics['achievement']:
            openings.extend([
                f"That's wonderful news! I can feel your excitement about this accomplishment. ",
                f"Congratulations! You should be proud of what you've achieved. ",
                f"What a great success! It sounds like your hard work is paying off. "
            ])
        
        # Future-related openings
        if topics['future']:
            openings.extend([
                f"Thinking about the future can bring up a lot of different emotions. ",
                f"It's natural to have concerns about what lies ahead. ",
                f"Your thoughts about the future show that you're being thoughtful about your path. "
            ])
        
        # Default emotion-based opening if no topics matched
        if not openings:
            emotion_openings = {
                'sadness': "I hear that you're going through a difficult time right now. ",
                'joy': "I can sense the positive energy in what you're sharing! ",
                'anger': "I understand you're feeling frustrated about this situation. ",
                'fear': "I can tell that you're worried, and your concerns are valid. ",
                'anxiety': "Anxiety can make everything feel overwhelming. I'm here to help. ",
                'grief': "I'm so deeply sorry for what you're experiencing. ",
                'love': "It's beautiful to hear about the connection you're feeling. ",
                'neutral': "Thank you for sharing this with me. "
            }
            openings.append(emotion_openings.get(emotion, "I'm listening and here to support you. "))
        
        return random.choice(openings)
    
    def _get_situation_specific_advice(self, topics: Dict[str, bool], emotion: str, intensity: int) -> str:
        """Provide specific advice based on the situation and emotion"""
        advice_parts = []
        
        # Work-related advice
        if topics['work_related']:
            work_advice = [
                "For work-related stress, try setting clear boundaries between work and personal time.",
                "Consider having an honest conversation with your supervisor about workload if it's becoming unmanageable.",
                "Remember that your worth isn't defined by your job performance - you are valuable as a person.",
                "Taking regular breaks during work can actually improve productivity and reduce stress."
            ]
            advice_parts.append(random.choice(work_advice))
        
        # Relationship advice
        if topics['relationship']:
            relationship_advice = [
                "Open and honest communication is key in any relationship. Consider expressing how you feel using 'I' statements.",
                "Healthy relationships require both connection and individual space. It's okay to have needs.",
                "If patterns feel unhealthy or unsafe, reaching out to a counselor can provide clarity and support.",
                "Remember that you deserve respect, kindness, and understanding in your relationships."
            ]
            advice_parts.append(random.choice(relationship_advice))
        
        # Loss advice
        if topics['loss']:
            loss_advice = [
                "Grief comes in waves, and it's okay to have good days and bad days. There's no 'right' way to grieve.",
                "Consider creating a small ritual or memorial to honor what you've lost when you feel ready.",
                "Connecting with others who have experienced similar loss can help you feel less alone.",
                "Allow yourself to feel all emotions - anger, sadness, guilt, even moments of joy. They're all part of healing."
            ]
            advice_parts.append(random.choice(loss_advice))
        
        # Financial advice
        if topics['financial']:
            financial_advice = [
                "Consider reaching out to a financial counselor - many community organizations offer free services.",
                "Breaking down financial challenges into smaller steps can make them feel more manageable.",
                "Remember that financial situations can change, and asking for help is a sign of strength, not weakness.",
                "Focus on what you can control: small budget adjustments, exploring assistance programs, or finding additional income sources."
            ]
            advice_parts.append(random.choice(financial_advice))
        
        # Health advice
        if topics['health']:
            health_advice = [
                "Don't hesitate to ask your healthcare provider questions or seek a second opinion if you need clarity.",
                "Taking care of your mental health is just as important as physical health - they're deeply connected.",
                "Consider enlisting support from friends or family for appointments or daily tasks if you need it.",
                "Small self-care acts - staying hydrated, gentle movement, rest - can make a difference during health challenges."
            ]
            advice_parts.append(random.choice(health_advice))
        
        # Loneliness advice
        if topics['loneliness']:
            loneliness_advice = [
                "Consider joining a group or class that aligns with your interests - shared activities naturally build connection.",
                "Even brief interactions like chatting with a barista or neighbor can help you feel more connected.",
                "Volunteering is a wonderful way to meet people while contributing to something meaningful.",
                "Online communities focused on your hobbies or interests can provide connection when in-person feels difficult."
            ]
            advice_parts.append(random.choice(loneliness_advice))
        
        # Achievement advice
        if topics['achievement']:
            achievement_advice = [
                "Take time to truly celebrate this achievement - you've earned it! Consider how you want to mark this moment.",
                "Reflect on what skills and strengths helped you succeed - recognizing these will help in future challenges.",
                "Sharing your joy with others who supported you can deepen your connections and their happiness too.",
                "Use this positive momentum to set your next meaningful goal, but also give yourself permission to rest and enjoy this success."
            ]
            advice_parts.append(random.choice(achievement_advice))
        
        # Future-related advice
        if topics['future']:
            future_advice = [
                "While planning is good, try to balance future thinking with present moment awareness to reduce anxiety.",
                "Break big future goals into small, actionable steps you can take today or this week.",
                "Remember that uncertainty is part of life - flexibility and adaptability are strengths.",
                "Consider creating a 'Plan A, Plan B' approach to give yourself options and reduce pressure."
            ]
            advice_parts.append(random.choice(future_advice))
        
        # Sleep advice
        if topics['sleep']:
            sleep_advice = [
                "Try establishing a calming bedtime routine - dim lights, cool room, no screens 30 minutes before bed.",
                "If worries keep you awake, try keeping a notepad by your bed to write them down and address tomorrow.",
                "Avoid caffeine after 2pm and try gentle stretching or meditation before bed.",
                "If sleep problems persist for more than a few weeks, consider talking to your doctor - quality sleep is crucial for wellbeing."
            ]
            advice_parts.append(random.choice(sleep_advice))
        
        # Return combined advice or empty string
        return " ".join(advice_parts) if advice_parts else ""
    
    def generate_response(self, emotion: str, user_message: str, intensity: int, 
                         risk_level: str, conversation_history: List[str] = None) -> str:
        """
        Generate an empathetic response based on detected emotion AND user message content
        
        Args:
            emotion: Primary detected emotion
            user_message: User's original message
            intensity: Emotion intensity (1-10)
            risk_level: Risk assessment (low, medium, high, critical)
            conversation_history: Previous messages for context
        
        Returns:
            Generated therapeutic response personalized to user's situation
        """
        # Normalize emotion to handle variations
        emotion = emotion.lower()
        
        # Extract topics from user message for personalization
        topics = self._extract_key_topics(user_message)
        
        # Create personalized opening that acknowledges their specific situation
        personalized_opening = self._create_personalized_opening(user_message, emotion, topics)
        
        # Get templates for this emotion (fallback to neutral)
        templates = self.response_templates.get(emotion, self.response_templates['neutral'])
        questions = self.follow_up_questions.get(emotion, self.follow_up_questions['neutral'])
        strategies = self.coping_strategies.get(emotion, self.coping_strategies['neutral'])
        
        # Select template based on intensity and risk
        template = random.choice(templates)
        
        # Add question or strategy
        if intensity >= 7 or risk_level in ['high', 'critical']:
            # High intensity - focus on support and strategies
            question_text = random.choice(questions)
            strategy_text = random.choice(strategies)
            template_filled = template.format(
                question=f"{strategy_text} {question_text}",
                strategy=f"{strategy_text} {question_text}"
            )
        else:
            # Normal intensity - balance question and strategy
            if random.random() > 0.5:
                question_text = random.choice(questions)
                template_filled = template.format(question=question_text, strategy=question_text)
            else:
                strategy_text = random.choice(strategies)
                template_filled = template.format(question=strategy_text, strategy=strategy_text)
        
        # Combine personalized opening with emotion-based template
        response = personalized_opening + template_filled
        
        # Add situation-specific advice
        specific_advice = self._get_situation_specific_advice(topics, emotion, intensity)
        if specific_advice:
            response += f"\n\n{specific_advice}"
        
        # Add crisis resources for high-risk situations
        if risk_level == 'critical':
            response += "\n\n🆘 **If you're in immediate crisis:**\n"
            response += "📞 National Suicide Prevention Lifeline: **988**\n"
            response += "💬 Crisis Text Line: Text **'HELLO'** to **741741**\n"
            response += "🌐 International: https://findahelpline.com"
        elif risk_level == 'high' and intensity >= 8:
            response += "\n\n💙 Remember, you don't have to go through this alone. "
            response += "If things feel overwhelming, crisis support is available 24/7 at 988."
        
        # Add conversational context if history exists
        if conversation_history and len(conversation_history) > 0:
            # Reference previous conversation naturally
            follow_ups = [
                "\n\nI'm glad you're continuing to share with me. ",
                "\n\nI've been thinking about what you shared earlier. ",
                "\n\nBuilding on our previous conversation, ",
                "\n\nI want to make sure I'm understanding your journey. "
            ]
            if random.random() > 0.7:  # 30% chance to reference history
                response = random.choice(follow_ups) + response
        
        return response
    
    def get_emotion_insight(self, emotion: str, confidence: float) -> str:
        """Get brief insight about the detected emotion"""
        insights = {
            'sadness': f"I detect sadness (confidence: {confidence:.0%}). This is a natural response to loss or difficult circumstances.",
            'joy': f"I detect joy (confidence: {confidence:.0%}). It's wonderful to see you feeling positive!",
            'anger': f"I detect anger (confidence: {confidence:.0%}). This often signals an unmet need or boundary violation.",
            'fear': f"I detect fear/anxiety (confidence: {confidence:.0%}). Your concerns are valid and worth exploring.",
            'anxiety': f"I detect anxiety (confidence: {confidence:.0%}). Let's work through these worries together.",
            'love': f"I detect feelings of love/connection (confidence: {confidence:.0%}). These bonds are precious.",
            'grief': f"I detect grief (confidence: {confidence:.0%}). I'm here to support you through this profound loss.",
            'surprise': f"I detect surprise (confidence: {confidence:.0%}). Unexpected changes can take time to process.",
            'neutral': f"I'm here to listen and support you.",
        }
        return insights.get(emotion.lower(), f"I hear you (confidence: {confidence:.0%}).")
    
    @staticmethod
    def aggregate_session_emotions(emotion_records) -> Dict[str, any]:
        """
        Analyze all emotions from a session to determine the dominant/overall emotion
        
        Args:
            emotion_records: QuerySet or list of emotion_data objects with 'emotion' and 'intensity' fields
        
        Returns:
            Dict with:
                - dominant_emotion: The most significant emotion for the session
                - average_intensity: Overall emotional intensity
                - emotion_distribution: Breakdown of all emotions
                - total_messages: Number of emotional data points
        """
        if not emotion_records or len(emotion_records) == 0:
            return {
                'dominant_emotion': 'neutral',
                'average_intensity': 0,
                'emotion_distribution': {},
                'total_messages': 0
            }
        
        # Collect emotion data
        emotion_scores = {}  # {emotion: {'count': n, 'total_intensity': sum, 'weighted_score': float}}
        total_intensity = 0
        
        for record in emotion_records:
            emotion = record.emotion.lower()
            intensity = record.intensity
            
            if emotion not in emotion_scores:
                emotion_scores[emotion] = {
                    'count': 0,
                    'total_intensity': 0,
                    'avg_intensity': 0,
                    'weighted_score': 0
                }
            
            emotion_scores[emotion]['count'] += 1
            emotion_scores[emotion]['total_intensity'] += intensity
            total_intensity += intensity
        
        # Calculate weighted scores
        # Weighted score = (frequency × 0.7) + (average_intensity × 0.3)
        # This prioritizes frequency (count) while still considering intensity
        total_records = len(emotion_records)
        
        for emotion, data in emotion_scores.items():
            data['avg_intensity'] = data['total_intensity'] / data['count']
            
            # Normalize frequency (0-100)
            frequency_score = (data['count'] / total_records) * 100
            
            # Calculate weighted score - heavily favor count/frequency
            data['weighted_score'] = (frequency_score * 0.7) + (data['avg_intensity'] * 0.3)
        
        # Find dominant emotion (highest weighted score - primarily based on count)
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1]['weighted_score'])
        
        # Create emotion distribution for analysis
        emotion_distribution = {
            emotion: {
                'count': data['count'],
                'percentage': round((data['count'] / total_records) * 100, 1),
                'avg_intensity': round(data['avg_intensity'], 1),
                'weighted_score': round(data['weighted_score'], 2)
            }
            for emotion, data in emotion_scores.items()
        }
        
        return {
            'dominant_emotion': dominant_emotion[0],
            'average_intensity': round(total_intensity / total_records, 1),
            'emotion_distribution': emotion_distribution,
            'total_messages': total_records,
            'dominant_emotion_count': dominant_emotion[1]['count'],
            'dominant_emotion_intensity': round(dominant_emotion[1]['avg_intensity'], 1)
        }
