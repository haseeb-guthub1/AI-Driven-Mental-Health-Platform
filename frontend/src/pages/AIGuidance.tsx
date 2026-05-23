import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Shield, User, Bot, Mic, MicOff, XCircle, FileText } from 'lucide-react'; // Added Mic icons
import axios from 'axios';
import { getCurrentUser } from '../services/authService';
import './AIGuidance.css';

interface Message {
    id: string | number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    emotion?: string;        // NEW: detected emotion
    emotionConfidence?: number; // NEW: confidence score
    emotionIntensity?: number;  // NEW: intensity (1-10)
}

interface SessionSummary {
    session_id: number;
    summary: string;
    final_emotion: string;
    emotion_intensity: number;
    message_count: number;
    session_date: string;
    emotion_analysis?: {
        dominant_emotion: string;
        total_emotional_data_points: number;
        emotion_distribution: {
            [emotion: string]: {
                count: number;
                percentage: number;
                avg_intensity: number;
                weighted_score: number;
            }
        }
    }
}

const AIGuidance: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null); // Dynamic session ID
    const [isLoadingSession, setIsLoadingSession] = useState(true); // NEW: Loading state for session initialization
    const scrollRef = useRef<HTMLDivElement>(null);
    const user = getCurrentUser();

    // Voice to Text Logic
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Your browser does not support voice recognition. Please try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false; // Stops after one sentence
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript); // Set transcribed text to input field
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // 1. Initialize or Load Active Session
    useEffect(() => {
        const initializeSession = async () => {
            console.log("[Session] User object:", user);
            
            if (!user) {
                console.error("[Session] No user logged in");
                setIsLoadingSession(false);
                return;
            }
            
            // Get client_id from user object (could be user.id or user.client_id)
            const clientId = user.id || user.client_id || user.user_id;
            
            if (!clientId) {
                console.error("[Session] No client ID found in user object:", user);
                alert("Unable to initialize session. Please log out and log back in.");
                setIsLoadingSession(false);
                return;
            }

            setIsLoadingSession(true);
            try {
                // Check if there's an active session in localStorage for this user
                const storedSessionId = localStorage.getItem(`activeSession_${clientId}`);
                
                if (storedSessionId) {
                    // Load existing session
                    setSessionId(parseInt(storedSessionId));
                    console.log(`[Session] Loading existing session: ${storedSessionId}`);
                } else {
                    // Create new session
                    console.log(`[Session] Creating new session for client: ${clientId}`);
                    const sessionResponse = await axios.post('http://127.0.0.1:8000/api/sessions/', {
                        client_id: clientId,
                        coach_id: null // Can be set if coach is assigned
                    });
                    
                    console.log(`[Session] Response:`, sessionResponse.data);
                    const newSessionId = sessionResponse.data.session_id;
                    setSessionId(newSessionId);
                    localStorage.setItem(`activeSession_${clientId}`, newSessionId.toString());
                    console.log(`[Session] Created new session: ${newSessionId}`);
                }
            } catch (err: any) {
                console.error("Failed to initialize session", err);
                console.error("Error response:", err.response);
                console.error("Error details:", err.response?.data);
                const errorMsg = err.response?.data?.error || JSON.stringify(err.response?.data) || err.message;
                alert(`Failed to initialize session: ${errorMsg}`);
            } finally {
                setIsLoadingSession(false);
            }
        };

        initializeSession();
    }, [user]);

    // 2. Fetch Chat History for Active Session
    useEffect(() => {
        const fetchHistory = async () => {
            const clientId = user?.id || user?.client_id || user?.user_id;
            if (!clientId || !sessionId) return;

            try {
                // Fetch conversations for this specific session
                const response = await axios.get(`http://127.0.0.1:8000/api/ai-guidance/?client_id=${clientId}&session_id=${sessionId}`);
                
                const history = response.data.flatMap((chat: any) => [
                    { 
                        id: `u-${chat.guidance_id}`, 
                        text: chat.user_message, 
                        sender: 'user', 
                        timestamp: new Date(chat.created_at),
                        emotion: chat.emotion_name,
                        emotionIntensity: chat.emotion_intensity,
                        emotionConfidence: 0.85
                    },
                    { 
                        id: `a-${chat.guidance_id}`, 
                        text: chat.ai_response, 
                        sender: 'ai', 
                        timestamp: new Date(chat.created_at) 
                    }
                ]);
                
                console.log(`[History] Loaded ${response.data.length} conversations for session ${sessionId}`);
                
                if (history.length > 0) {
                    setMessages(history);
                } else {
                    // New session welcome message
                    setMessages([{ 
                        id: 1, 
                        text: "Hello! I'm here to listen. How are you feeling today?", 
                        sender: 'ai', 
                        timestamp: new Date() 
                    }]);
                }
            } catch (err) {
                console.error("Failed to load history", err);
                setMessages([{ 
                    id: 1, 
                    text: "Hello! I'm here to listen. How are you feeling today?", 
                    sender: 'ai', 
                    timestamp: new Date() 
                }]);
            }
        };
        
        if (sessionId) {
            fetchHistory();
        }
    }, [user?.id, sessionId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 2. Real HandleSend with Django/Gemini Integration + Emotion Detection
    const handleSend = async () => {
        if (!input.trim()) return;

        if (!sessionId) {
            console.error('[Error] No active session. Cannot send message.');
            alert('Session not initialized. Please refresh the page and try again.');
            return;
        }

        const clientId = user?.id || user?.client_id || user?.user_id || 1;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            console.log('[Send] Sending message to backend...');
            console.log('[Send] Session ID:', sessionId);
            console.log('[Send] Client ID:', clientId);
            
            // Send message WITHOUT dummy emotion_id - backend will detect it!
            const response = await axios.post('http://127.0.0.1:8000/api/ai-guidance/', {
                client_id: clientId,
                user_message: input,
                session_id: sessionId
                // emotion_id removed - backend detects it automatically!
            });

            console.log('[Response] Received from backend:', response.data);

            // AI response with detected emotion data
            const aiMsg: Message = { 
                id: `ai-${Date.now()}`, 
                text: response.data.response, 
                sender: 'ai', 
                timestamp: new Date() 
            };
            
            // Update user message with detected emotion
            if (response.data.emotion_detected) {
                const emotionData = response.data.emotion_detected;
                setMessages(prev => prev.map(msg => 
                    msg.id === userMsg.id 
                        ? { 
                            ...msg, 
                            emotion: emotionData.emotion,
                            emotionConfidence: emotionData.confidence,
                            emotionIntensity: emotionData.intensity
                          }
                        : msg
                ));
                
                console.log(`[Emotion] Detected: ${emotionData.emotion} (${(emotionData.confidence * 100).toFixed(1)}% confidence, intensity: ${emotionData.intensity})`);
            }
            
            setMessages(prev => [...prev, aiMsg]);
            console.log('[Success] Message saved and displayed');
        } catch (err) {
            console.error("[Error] AI Error:", err);
            setMessages(prev => [...prev, { 
                id: `err-${Date.now()}`, 
                text: "I'm having trouble connecting right now. Please try again.", 
                sender: 'ai', 
                timestamp: new Date() 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // End Session and Generate Summary
    const endSession = async () => {
        if (messages.length === 0) {
            alert("No messages to summarize. Start a conversation first!");
            return;
        }

        if (!sessionId) {
            alert("No active session found.");
            return;
        }

        setIsGeneratingSummary(true);
        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/sessions/${sessionId}/summary/`
            );
            
            setSessionSummary(response.data);
            setShowSummary(true);
            
            // Clear the active session from localStorage
            if (user?.id) {
                localStorage.removeItem(`activeSession_${user.id}`);
                console.log(`[Session] Ended session ${sessionId}, cleared from storage`);
            }
            
            // Reset session ID to allow new session creation
            setSessionId(null);
            
            // Clear messages to start fresh
            setMessages([{ 
                id: 1, 
                text: "Session ended. Start a new conversation when you're ready.", 
                sender: 'ai', 
                timestamp: new Date() 
            }]);
        } catch (err) {
            // console.error("Failed to generate summary:", err);
            alert("Summary already generated or session ended.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    return (
        <div className="ai-guidance-container">
            {/* Loading State for Session Initialization */}
            {isLoadingSession ? (
                <div className="loading-session">
                    <div className="spinner"></div>
                    <p>Initializing your session...</p>
                </div>
            ) : (
                <>
                    {/* End Session Button */}
                    <div className="session-controls">
                        <button 
                            className="end-session-btn" 
                            onClick={endSession}
                            disabled={isGeneratingSummary || messages.length === 0}
                            title="End Session & Generate Summary"
                        >
                            <XCircle size={18} />
                            {isGeneratingSummary ? 'Generating Summary...' : 'End Session'}
                        </button>
                        {/* Debug: Show session ID */}
                        <small style={{ color: '#999', fontSize: '10px', marginLeft: '10px' }}>
                            Session: {sessionId || 'Not initialized'}
                        </small>
                    </div>
                    <div className="chat-window">
                {messages.map((msg) => (
                    <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`message-wrapper ${msg.sender}`}
                    >
                        <div className="avatar-icon">
                            {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
                        </div>
                        <div className="message-bubble">
                            <p>{msg.text}</p>
                            {msg.emotion && (
                                <div className="emotion-badge">
                                    <Sparkles size={12} />
                                    <span>{msg.emotion}</span>
                                    {msg.emotionConfidence && (
                                        <span className="confidence">
                                            {(msg.emotionConfidence * 100).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            )}
                            <span className="time">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <footer className="chat-input-area">
                <div className="input-wrapper">
                    {/* Microphone Toggle Button */}
                    <button 
                        className={`voice-btn ${isListening ? 'active' : ''}`} 
                        onClick={startListening}
                        title="Voice to Text"
                        type="button"
                    >
                        {isListening ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} />}
                    </button>

                    <input 
                        type="text" 
                        placeholder={isListening ? "Listening..." : "Share what's on your mind..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isTyping}>
                        <Send size={20} />
                    </button>
                </div>
                <p className="disclaimer">Not a crisis line. If you are in immediate danger, please contact emergency services.</p>
            </footer>

            {/* Summary Modal */}
            {showSummary && sessionSummary && (
                <div className="summary-modal" onClick={() => setShowSummary(false)}>
                    <motion.div 
                        className="summary-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="summary-header">
                            <FileText size={32} color="#667eea" />
                            <h2>Session Summary</h2>
                        </div>
                        
                        <div className="emotion-display">
                            <div className="emotion-info">
                                <span className="emotion-label">Final Emotion:</span>
                                <span className={`emotion-value ${sessionSummary.final_emotion}`}>
                                    {sessionSummary.final_emotion}
                                </span>
                            </div>
                            <div className="intensity-info">
                                <span className="intensity-label">Intensity:</span>
                                <div className="intensity-bar">
                                    <div 
                                        className="intensity-fill" 
                                        style={{ width: `${sessionSummary.emotion_intensity * 10}%` }}
                                    />
                                </div>
                                <span className="intensity-value">{sessionSummary.emotion_intensity}/10</span>
                            </div>
                        </div>

                        <div className="summary-text">
                            <h3>Conversation Summary:</h3>
                            <p>{sessionSummary.summary}</p>
                        </div>

                        {/* Emotion Distribution */}
                        {sessionSummary.emotion_analysis && (
                            <div className="emotion-distribution">
                                <h3>Emotion Distribution (Session Overview):</h3>
                                <div className="distribution-bars">
                                    {Object.entries(sessionSummary.emotion_analysis.emotion_distribution)
                                        .sort((a, b) => b[1].count - a[1].count) // Sort by count descending
                                        .map(([emotion, data]) => (
                                            <div key={emotion} className="distribution-item">
                                                <div className="distribution-header">
                                                    <span className={`emotion-name ${emotion}`}>
                                                        {emotion}
                                                        {emotion === sessionSummary.final_emotion && 
                                                            <span className="dominant-badge"> (Dominant)</span>
                                                        }
                                                    </span>
                                                    <span className="emotion-count">
                                                        {data.count} times ({data.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="distribution-bar-container">
                                                    <div 
                                                        className={`distribution-bar ${emotion}`}
                                                        style={{ width: `${data.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <p className="distribution-note">
                                    <strong>Note:</strong> The dominant emotion is determined by which emotion appeared most frequently (count) throughout the session.
                                </p>
                            </div>
                        )}

                        <div className="meta-info">
                            <div className="meta-item">
                                <span className="meta-label">Messages:</span>
                                <span className="meta-value">{sessionSummary.message_count}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Date:</span>
                                <span className="meta-value">{sessionSummary.session_date}</span>
                            </div>
                        </div>

                        <button className="close-summary-btn" onClick={() => setShowSummary(false)}>
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
                </>
            )}
        </div>
    );
};

export default AIGuidance;