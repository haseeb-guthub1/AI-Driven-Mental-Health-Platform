import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Book,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Heart,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../services/authService";
import CoachAppointmentModal from "../components/CoachAppointmentModal";
import "./Overview.css";

interface EmotionData {
  emotion: string;
  intensity: number;
  notes: string;
  created_at: string;
}

interface SessionSummary {
  session_id: number;
  summary: string;
  final_emotion: string;
  emotion_intensity: number;
  message_count: number;
  date: string;
}

interface FinalAssessment {
  assessment_id: number;
  client_id: number;
  raw_emotion: string;
  raw_intensity: number;
  final_emotion: string;
  final_intensity: number;
  recommendation: string;
  confidence_score: number;
  emotions_analyzed: string;
  journal_entry: string | null;
  created_at: string;
  updated_at: string;
}

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const clientId = user?.id || user?.client_id || user?.user_id;

  const [latestMood, setLatestMood] = useState<EmotionData | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>(
    []
  );
  const [resilienceScore, setResilienceScore] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  
  // NEW: Final Assessment states
  const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  
  // NEW: Coach Appointment Modal state
  const [showCoachModal, setShowCoachModal] = useState(false);

  // Refresh data when component mounts or when navigating back to this page
  useEffect(() => {
    fetchOverviewData();
    fetchFinalAssessment();
  }, [clientId, location.pathname]);

  // Auto-refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/dashboard') {
        console.log('[OVERVIEW] Page visible, refreshing data...');
        refreshAllData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  // Manual refresh function
  const refreshAllData = async () => {
    setRefreshing(true);
    setShowRefreshSuccess(false);
    
    await Promise.all([
      fetchOverviewData(),
      fetchFinalAssessment()
    ]);
    
    setRefreshing(false);
    setShowRefreshSuccess(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowRefreshSuccess(false);
    }, 2000);
  };

  const fetchFinalAssessment = async () => {
    if (!clientId) return;

    try {
      setAiAnalyzing(true);
      setAssessmentError(null);
      
      // Try to get existing assessment
      const response = await axios.get(
        `http://127.0.0.1:8000/api/emotion-data/final-assessment/?client_id=${clientId}`
      );
      
      setFinalAssessment(response.data);
      console.log("[FINAL-ASSESSMENT] Loaded existing assessment:", response.data);
      
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No assessment exists, generate one
        console.log("[FINAL-ASSESSMENT] No existing assessment, generating new one...");
        await generateFinalAssessment();
      } else {
        console.error("[FINAL-ASSESSMENT] Error fetching:", error);
        setAssessmentError("Unable to load emotional analysis");
      }
    } finally {
      setAiAnalyzing(false);
    }
  };

  const generateFinalAssessment = async () => {
    if (!clientId) return;

    try {
      setAiAnalyzing(true);
      setAssessmentError(null);
      
      console.log("[FINAL-ASSESSMENT] Generating new assessment via Ollama...");
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/emotion-data/final-assessment/`,
        { client_id: clientId }
      );
      
      setFinalAssessment(response.data);
      console.log("[FINAL-ASSESSMENT] ✓ Generated:", response.data);
      
    } catch (error: any) {
      console.error("[FINAL-ASSESSMENT] Generation error:", error);
      setAssessmentError(error.response?.data?.error || "Failed to generate assessment");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const fetchOverviewData = async () => {
    if (!clientId) return;

    if (!refreshing) {
      setLoading(true);
    }
    
    try {
      // Fetch emotion data
      const emotionRes = await axios.get(
        `http://127.0.0.1:8000/api/emotion-data/?client_id=${clientId}`
      );
      
      let sortedEmotions: any[] = [];
      
      if (emotionRes.data.length > 0) {
        sortedEmotions = emotionRes.data.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setLatestMood(sortedEmotions[0]);
        setEntryCount(emotionRes.data.length);

        // Calculate resilience score based on recent emotions
        const resilience = calculateResilienceScore(
          sortedEmotions.slice(0, 10)
        );
        setResilienceScore(resilience);
        
        console.log('[OVERVIEW] Updated emotion data:', sortedEmotions[0]);
      }

      // Fetch session summaries
      const sessionsRes = await axios.get(
        `http://127.0.0.1:8000/api/sessions/?client_id=${clientId}`
      );
      const completedSessions = sessionsRes.data.filter((s: any) => s.summary);
      setSessionSummaries(completedSessions.slice(0, 3));

      console.log("Sessions Response:", sessionsRes.data);
      console.log("Completed Sessions:", completedSessions);
      console.log("Session Summaries State:", sessionSummaries);
      // Fetch conversation count
      const guidanceRes = await axios.get(
        `http://127.0.0.1:8000/api/ai-guidance/?client_id=${clientId}`
      );
      setConversationCount(guidanceRes.data.length);

      // Generate AI suggestion based on latest mood
      if (sortedEmotions.length > 0) {
        const suggestion = generateAISuggestion(sortedEmotions[0]);
        setAiSuggestion(suggestion);
      }
    } catch (err) {
      console.error("Failed to fetch overview data", err);
    } finally {
      if (!refreshing) {
        setLoading(false);
      }
    }
  };

  const calculateResilienceScore = (recentEmotions: any[]): number => {
    if (recentEmotions.length === 0) return 50;

    const positiveEmotions = [
      "joy",
      "gratitude",
      "love",
      "optimism",
      "pride",
      "relief",
      "excitement",
      "admiration",
    ];
    const negativeEmotions = [
      "sadness",
      "anger",
      "fear",
      "anxiety",
      "grief",
      "disappointment",
      "nervousness",
    ];
    const criticalEmotions = [
      "suicidal",
      "self_harm",
      "severe_depression",
      "panic",
      "crisis",
    ];

    let score = 50; // Base score

    recentEmotions.forEach((emotion, index) => {
      const weight = 1 - index * 0.1; // More recent emotions have more weight

      if (criticalEmotions.includes(emotion.emotion)) {
        score -= 20 * weight;
      } else if (negativeEmotions.includes(emotion.emotion)) {
        score -= emotion.intensity * 0.5 * weight;
      } else if (positiveEmotions.includes(emotion.emotion)) {
        score += emotion.intensity * 0.3 * weight;
      }
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const generateAISuggestion = (mood: EmotionData): string => {
    const suggestions: Record<string, string> = {
      suicidal:
        'URGENT: Please reach out for immediate professional help. Call 988 (Suicide & Crisis Lifeline) or text "HELLO" to 741741.',
      self_harm:
        "Your safety is our priority. Consider calling 988 or reaching out to a trusted mental health professional immediately.",
      severe_depression:
        "Consider trying the 5-4-3-2-1 grounding technique: Identify 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
      panic:
        "Practice box breathing to regulate your nervous system: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times.",
      anxiety:
        "Progressive muscle relaxation may help: Systematically tense and relax each muscle group, starting from your toes and working upward.",
      sadness:
        "Consider journaling your thoughts or engaging in light physical activity. Movement can positively influence mood regulation.",
      anger:
        "Try the STOP technique: Stop what you're doing, Take a deep breath, Observe your feelings without judgment, Proceed mindfully.",
      fear: "Ground yourself in the present: Identify 3 things that make you feel safe right now. Focus on your immediate environment.",
      joy: "This is a positive emotional state. Consider documenting what contributed to this feeling for future reference.",
      gratitude:
        "Expanding on this positive emotion can be beneficial. Consider listing 3 additional things you're grateful for today.",
      love: "Express your appreciation to someone meaningful in your life. Positive social connections support mental wellbeing.",
      neutral:
        "This is an optimal time to establish a mindfulness practice. Begin with 5 minutes of focused meditation.",
    };

    return (
      suggestions[mood.emotion] ||
      "Continue your mental health journey with regular self-assessments and professional consultations."
    );
  };

  const getResilienceStatus = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Support";
  };

  const getResilienceColor = (score: number): string => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="overview-container loading-state">
        <div className="spinner"></div>
        <p>Loading your overview...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="overview-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Floating Background Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Success Toast */}
      {showRefreshSuccess && (
        <motion.div 
          className="refresh-toast"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          ✓ Data refreshed successfully
        </motion.div>
      )}

      {/* 3D Perspective Cards Grid */}
      <div className="cards-3d-grid">
        {/* Mood Card with Raw vs AI-Refined Comparison */}
        <motion.div
          className={`card-3d mood-card-3d ${
            finalAssessment && ['grief', 'crisis', 'panic', 'severe_depression'].includes(finalAssessment.final_emotion) 
            ? 'critical-pulse' 
            : ''
          }`}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ 
            rotateY: 5, 
            rotateX: 5,
            scale: 1.05,
            z: 50
          }}
        >
          <div className="card-3d-inner">
            <div className="card-glow mood-glow"></div>
            <div className="card-icon-3d">
              <Activity size={32} />
            </div>
            <h3 className="card-title-3d">Emotion State</h3>
            
            {finalAssessment && !aiAnalyzing ? (
              <div className="emotion-comparison">
                <div className="raw-emotion">
                  <span className="emotion-label">Raw</span>
                  <div className="card-value-3d small">{finalAssessment.raw_emotion}</div>
                  <span className="intensity-mini">{finalAssessment.raw_intensity}/10</span>
                </div>
                <div className="arrow-separator">→</div>
                <div className="refined-emotion">
                  <span className="emotion-label">AI Refined</span>
                  <div className="card-value-3d small">{finalAssessment.final_emotion}</div>
                  <span className="intensity-mini">{finalAssessment.final_intensity}/10</span>
                </div>
              </div>
            ) : aiAnalyzing ? (
              <div className="ai-analyzing-skeleton">
                <div className="skeleton-pulse"></div>
                <p className="analyzing-text">AI is analyzing your mood...</p>
              </div>
            ) : (
              <>
                <div className="card-value-3d">{latestMood?.emotion || "neutral"}</div>
                <div className="card-meta-3d">
                  Intensity: <span className="highlight">{latestMood ? `${latestMood.intensity}/10` : "--"}</span>
                </div>
              </>
            )}
            
            {finalAssessment && (
              <div className="confidence-badge">
                Confidence: {(finalAssessment.confidence_score * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </motion.div>

        {/* Resilience Card with 3D Effect */}
        <motion.div
          className="card-3d resilience-card-3d"
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ 
            rotateY: -5, 
            rotateX: 5,
            scale: 1.05,
            z: 50
          }}
        >
          <div className="card-3d-inner">
            <div className="card-glow resilience-glow"></div>
            <div className="card-icon-3d">
              <TrendingUp size={32} />
            </div>
            <h3 className="card-title-3d">Resilience</h3>
            <div className="card-value-3d" style={{ color: getResilienceColor(resilienceScore) }}>
              {resilienceScore}%
            </div>
            <div className="card-meta-3d">
              Status: <span className="highlight">{getResilienceStatus(resilienceScore)}</span>
            </div>
          </div>
        </motion.div>

        {/* Wellbeing Trend Card */}
        <motion.div
          className="card-3d wellbeing-card-3d"
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ 
            rotateY: 5, 
            rotateX: -5,
            scale: 1.05,
            z: 50
          }}
        >
          <div className="card-3d-inner">
            <div className="card-glow wellbeing-glow"></div>
            <div className="card-icon-3d">
              <Heart size={32} />
            </div>
            <h3 className="card-title-3d">Wellbeing</h3>
            <div className="card-value-3d trend-icon">
              {resilienceScore >= 60 ? "↗" : resilienceScore >= 40 ? "→" : "↘"}
            </div>
            <div className="card-meta-3d">
              {resilienceScore >= 60 ? "Improving" : resilienceScore >= 40 ? "Stable" : "Monitor"}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero Section with 3D Effect */}
      <motion.div 
        className="welcome-hero-3d"
        initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-glass-effect">
          {/* Refresh Button */}
          <button 
            className={`refresh-floating-btn ${refreshing ? 'spinning' : ''}`}
            onClick={refreshAllData}
            disabled={refreshing}
            title="Refresh all data"
          >
            <RefreshCw size={20} />
          </button>
          
          <div className="hero-content-3d">
            <div className="stats-inline">
              <div className="stat-bubble">
                <span className="bubble-number">{conversationCount}</span>
                <span className="bubble-label">Sessions</span>
              </div>
              <div className="stat-bubble">
                <span className="bubble-number">{entryCount}</span>
                <span className="bubble-label">Assessments</span>
              </div>
              <div className="stat-bubble">
                <span className="bubble-number">{resilienceScore}%</span>
                <span className="bubble-label">Resilience</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="main-grid">
        {/* Recent Reflection */}
        <motion.div
          className="content-card journal-preview"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h3>
              <Book size={20} /> Recent Emotional Assessment
            </h3>
            <button onClick={() => navigate("/dashboard/mood-tracker")}>
              View All
            </button>
          </div>
          <div className="preview-body">
            {latestMood?.notes ? (
              <>
                <p className="reflection-text">
                  "{latestMood.notes.substring(0, 200)}
                  {latestMood.notes.length > 200 ? "..." : ""}"
                </p>
                <p className="reflection-meta">
                  <span className="emotion-tag">{latestMood.emotion}</span>
                  <span className="time-ago">
                    {new Date(latestMood.created_at).toLocaleDateString()}
                  </span>
                </p>
              </>
            ) : (
              <p className="empty-text">
                No emotional assessments recorded yet. Begin documenting your emotional state today.
              </p>
            )}
          </div>
        </motion.div>

        {/* AI Clinical Recommendation */}
        <motion.div
          className={`content-card ai-card ${
            finalAssessment && ['grief', 'crisis', 'panic', 'severe_depression'].includes(finalAssessment.final_emotion) 
            ? 'critical-pulse-border' 
            : ''
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h3>
              <Sparkles size={20} /> Clinical Recommendation
            </h3>
            {finalAssessment && (
              <button 
                onClick={generateFinalAssessment}
                disabled={aiAnalyzing}
                className="refresh-btn"
              >
                🔄 Refresh
              </button>
            )}
          </div>
          <div className="ai-body">
            {aiAnalyzing ? (
              <div className="ai-analyzing-skeleton">
                <div className="skeleton-pulse"></div>
                <p className="analyzing-text">AI is analyzing your emotional patterns...</p>
              </div>
            ) : finalAssessment ? (
              <>
                <p className="ai-recommendation">{finalAssessment.recommendation}</p>
                <div className="assessment-meta">
                  <span className="refined-badge">
                    AI Analysis: <strong>{finalAssessment.final_emotion}</strong>
                  </span>
                  <span className="confidence-indicator">
                    {(finalAssessment.confidence_score * 100).toFixed(0)}% confident
                  </span>
                </div>
              </>
            ) : assessmentError ? (
              <p className="error-text">{assessmentError}</p>
            ) : (
              <p>{aiSuggestion}</p>
            )}
            <button
              className="action-link"
              onClick={() => navigate("/dashboard/ai-assistant")}
            >
              Talk to AI <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Session Summaries Section */}
      {sessionSummaries.length > 0 && (
        <motion.div
          className="content-card session-summaries"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h3>
              <FileText size={20} /> Recent Therapy Summaries
            </h3>
          </div>
          <div className="summaries-list">
            {sessionSummaries.map((session) => (
              <motion.div
                key={session.session_id}
                className="summary-card"
                onClick={() =>
                  navigate(`/dashboard/session/${session.session_id}`)
                }
                style={{ cursor: "pointer" }}
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 4px 12px rgba(168, 216, 234, 0.2)",
                }}
              >
                <div className="summary-header-mini">
                  <div className="session-meta">
                    <MessageSquare size={16} />
                    <span>Session {session.session_id}</span>
                    <span className="session-date">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                    <span className="message-count">
                      {session.message_count} messages
                    </span>
                  </div>
                  <div className="emotion-badge-mini">
                    <span
                      className={`emotion-dot ${session.final_emotion}`}
                    ></span>
                    <span className="emotion-text">
                      {session.final_emotion}
                    </span>
                    <span className="intensity-mini">
                      {session.emotion_intensity}/10
                    </span>
                  </div>
                </div>
                <p className="summary-preview">
                  {session.summary.substring(0, 200)}
                  {session.summary.length > 200 ? "..." : ""}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <motion.button
          className="quick-btn primary"
          onClick={() => navigate("/dashboard/ai-assistant")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles size={20} />
          Begin Therapy Session
        </motion.button>
        <motion.button
          className="quick-btn secondary"
          onClick={() => navigate("/dashboard/mood-tracker")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Activity size={20} />
          Record Emotional State
        </motion.button>
        <motion.button
          className="quick-btn tertiary"
          onClick={() => setShowCoachModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar size={20} />
          Book Coach Appointment
        </motion.button>
      </div>

      {/* Coach Appointment Modal */}
      <CoachAppointmentModal 
        isOpen={showCoachModal} 
        onClose={() => setShowCoachModal(false)} 
      />
    </motion.div>
  );
};

export default Overview;
