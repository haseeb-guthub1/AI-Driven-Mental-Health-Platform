import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Activity,
  TrendingUp,
  FileText,
  Brain,
  User,
  Bot,
} from "lucide-react";
import axios from "axios";
import "./SessionDetail.css";

interface SessionData {
  session_id: number;
  client_id: number;
  date: string;
  summary: string;
  final_emotion: string;
  emotion_intensity: number;
  message_count: number;
  notes: string;
}

interface ChatMessage {
  message_id: number;
  message_type: "user" | "ai";
  message_text: string;
  timestamp: string;
}

const SessionDetail: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session details
      const sessionRes = await axios.get(
        `http://127.0.0.1:8000/api/sessions/${sessionId}/`
      );
      setSession(sessionRes.data);

      // Fetch chat messages for this session
      try {
        const messagesRes = await axios.get(
          `http://127.0.0.1:8000/api/ai-guidance/messages/?session_id=${sessionId}`
        );
        setMessages(messagesRes.data);
      } catch (err) {
        console.log("No messages found for this session");
        setMessages([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch session data:", err);
      setError("Failed to load session details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion: string): string => {
    const emotionColors: { [key: string]: string } = {
      joy: "#22c55e",
      gratitude: "#84cc16",
      love: "#ec4899",
      optimism: "#3b82f6",
      sadness: "#6366f1",
      anger: "#ef4444",
      fear: "#f59e0b",
      anxiety: "#f97316",
      grief: "#7c3aed",
      neutral: "#64748b",
    };
    return emotionColors[emotion.toLowerCase()] || "#64748b";
  };

  if (loading) {
    return (
      <div className="session-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-detail-container">
        <div className="error-state">
          <p>{error || "Session not found"}</p>
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="session-detail-container">
      {/* Header */}
      <motion.div
        className="session-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="session-title">
          <MessageSquare size={28} />
          <h1>Session {session.session_id}</h1>
        </div>
      </motion.div>

      {/* Session Info Cards */}
      <div className="session-info-grid">
        <motion.div
          className="info-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Calendar size={20} />
          <div>
            <p className="info-label">Date</p>
            <p className="info-value">
              {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="info-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MessageSquare size={20} />
          <div>
            <p className="info-label">Messages</p>
            <p className="info-value">{session.message_count} messages</p>
          </div>
        </motion.div>

        <motion.div
          className="info-card emotion-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{ borderColor: getEmotionColor(session.final_emotion) }}
        >
          <Activity size={20} style={{ color: getEmotionColor(session.final_emotion) }} />
          <div>
            <p className="info-label">Final Emotion</p>
            <p className="info-value" style={{ color: getEmotionColor(session.final_emotion) }}>
              {session.final_emotion}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="info-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TrendingUp size={20} />
          <div>
            <p className="info-label">Intensity</p>
            <p className="info-value">{session.emotion_intensity}/10</p>
          </div>
        </motion.div>
      </div>

      {/* AI Summary Section */}
      {session.summary && (
        <motion.div
          className="summary-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <Brain size={24} />
            <h2>AI-Generated Summary</h2>
          </div>
          <div className="summary-content">
            <p>{session.summary}</p>
          </div>
        </motion.div>
      )}

      {/* Chat Transcript Section */}
      {messages.length > 0 && (
        <motion.div
          className="transcript-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <FileText size={24} />
            <h2>Chat Transcript</h2>
          </div>
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.message_id}
                className={`message-bubble ${msg.message_type}`}
                initial={{ opacity: 0, x: msg.message_type === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
              >
                <div className="message-header">
                  {msg.message_type === "user" ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                  <span className="message-author">
                    {msg.message_type === "user" ? "You" : "AI Therapist"}
                  </span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{msg.message_text}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notes Section */}
      {session.notes && (
        <motion.div
          className="notes-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="section-header">
            <FileText size={24} />
            <h2>Session Notes</h2>
          </div>
          <div className="notes-content">
            <p>{session.notes}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SessionDetail;
