import React, { useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Calendar, MessageSquare, Activity,
    ChevronRight, Search, Clock, TrendingUp,
    FileText, Download, X, AlertTriangle, CheckCircle2
} from 'lucide-react';
import './SessionLogs.css';

interface SessionLog {
    id: number;
    client_name: string;
    client_avatar: string;
    date: string;
    duration: number;
    emotion: string;
    intensity: number;
    status: 'completed' | 'cancelled' | 'pending';
    messages: number;
    summary?: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
}

const MOCK_SESSIONS: SessionLog[] = [
    {
        id: 1,
        client_name: 'Nadia Shah',
        client_avatar: 'NS',
        date: '2026-06-25T10:00:00',
        duration: 60,
        emotion: 'grief',
        intensity: 9,
        status: 'completed',
        messages: 24,
        summary: 'Client expressed deep feelings of loss and hopelessness. Crisis intervention protocols initiated. Safety plan reviewed and a 48-hour follow-up scheduled.',
        risk: 'critical',
        notes: 'Referred to psychiatry. Emergency contact notified per consent.'
    },
    {
        id: 2,
        client_name: 'Alice Thompson',
        client_avatar: 'AT',
        date: '2026-06-24T14:00:00',
        duration: 45,
        emotion: 'anxiety',
        intensity: 6,
        status: 'completed',
        messages: 18,
        summary: 'CBT techniques applied for work-related anxiety. Client responded positively to breathing exercises and cognitive restructuring tasks.',
        risk: 'medium',
        notes: 'Assigned homework: thought diary for the next week.'
    },
    {
        id: 3,
        client_name: 'Marcus Wright',
        client_avatar: 'MW',
        date: '2026-06-24T11:00:00',
        duration: 60,
        emotion: 'sadness',
        intensity: 7,
        status: 'completed',
        messages: 31,
        summary: 'Session focused on grief processing following recent bereavement. Significant emotional release observed. Introduced journaling as coping strategy.',
        risk: 'high',
        notes: 'Monitor closely. Next session in 3 days.'
    },
    {
        id: 4,
        client_name: 'Hana Lee',
        client_avatar: 'HL',
        date: '2026-06-23T15:30:00',
        duration: 50,
        emotion: 'optimism',
        intensity: 7,
        status: 'completed',
        messages: 22,
        summary: 'Client showing significant improvement. Goals review completed. Positive reinforcement techniques effective. Considering transition to bi-weekly sessions.',
        risk: 'low',
        notes: 'Progress milestone reached. Excellent engagement.'
    },
    {
        id: 5,
        client_name: 'David Chen',
        client_avatar: 'DC',
        date: '2026-06-23T09:00:00',
        duration: 60,
        emotion: 'neutral',
        intensity: 5,
        status: 'completed',
        messages: 16,
        summary: 'Routine check-in. No acute issues identified. Mindfulness exercises introduced and discussed stress management strategies.',
        risk: 'low',
    },
    {
        id: 6,
        client_name: 'Nadia Shah',
        client_avatar: 'NS',
        date: '2026-06-22T16:00:00',
        duration: 90,
        emotion: 'fear',
        intensity: 8,
        status: 'completed',
        messages: 42,
        summary: 'Extended emergency session addressing acute anxiety and fear response. Safety plan reviewed and updated. Crisis hotline numbers provided.',
        risk: 'critical',
        notes: 'Mandatory coach assignment completed. Risk score 89%.'
    },
    {
        id: 7,
        client_name: 'Sara Malik',
        client_avatar: 'SM',
        date: '2026-06-21T13:00:00',
        duration: 60,
        emotion: 'sadness',
        intensity: 6,
        status: 'cancelled',
        messages: 0,
        risk: 'medium',
        notes: 'Client cancelled 2 hours before. Rescheduled to next week.'
    },
    {
        id: 8,
        client_name: 'Marcus Wright',
        client_avatar: 'MW',
        date: '2026-06-27T10:00:00',
        duration: 60,
        emotion: 'neutral',
        intensity: 5,
        status: 'pending',
        messages: 0,
        risk: 'high',
        notes: 'Follow-up session for grief processing.'
    },
    {
        id: 9,
        client_name: 'Nadia Shah',
        client_avatar: 'NS',
        date: '2026-06-28T09:00:00',
        duration: 60,
        emotion: 'neutral',
        intensity: 5,
        status: 'pending',
        messages: 0,
        risk: 'critical',
        notes: '48-hour mandatory follow-up session.'
    },
];

const SessionLogs: React.FC = () => {
    const currentUser = getCurrentUser();
    // Show dummy data only for the 4 built-in demo coaches (Sara Khan, Hassan Mirza, Amna Rauf, Zain Ali)
    const DEMO_COACH_IDS = [18, 19, 20, 21];
    const isDemoCoach = DEMO_COACH_IDS.includes(currentUser?.coach_id);
    const sessions = isDemoCoach ? MOCK_SESSIONS : [];

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled' | 'pending'>('all');
    const [selectedSession, setSelectedSession] = useState<SessionLog | null>(null);

    const filteredSessions = sessions.filter(s => {
        const matchesSearch = s.client_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const completed = sessions.filter(s => s.status === 'completed');
    const stats = {
        total: completed.length,
        thisWeek: completed.filter(s => {
            const d = new Date(s.date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return d >= weekAgo;
        }).length,
        highRisk: completed.filter(s => s.risk === 'high' || s.risk === 'critical').length,
        avgDuration: Math.round(completed.reduce((a, s) => a + s.duration, 0) / (completed.length || 1)),
    };

    const getEmotionColor = (emotion: string) => {
        const colors: Record<string, string> = {
            joy: '#22c55e', gratitude: '#84cc16', love: '#ec4899',
            optimism: '#3b82f6', sadness: '#6366f1', anger: '#ef4444',
            fear: '#f59e0b', anxiety: '#f97316', grief: '#7c3aed', neutral: '#64748b',
        };
        return colors[emotion] || '#64748b';
    };

    const getRiskStyle = (risk: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            critical: { bg: '#FEF2F2', color: '#DC2626' },
            high: { bg: '#FFF7ED', color: '#EA580C' },
            medium: { bg: '#FEFCE8', color: '#CA8A04' },
            low: { bg: '#F0FDF4', color: '#16A34A' },
        };
        return styles[risk] || styles.low;
    };

    const getAvatarBg = (risk: string, name: string) => {
        if (risk === 'critical') return 'linear-gradient(135deg,#DC2626,#9B1C1C)';
        if (risk === 'high') return 'linear-gradient(135deg,#EA580C,#C2410C)';
        const palettes = [
            'linear-gradient(135deg,#4F46E5,#7C3AED)',
            'linear-gradient(135deg,#0891B2,#0E7490)',
            'linear-gradient(135deg,#059669,#047857)',
            'linear-gradient(135deg,#D97706,#B45309)',
        ];
        const idx = name.charCodeAt(0) % palettes.length;
        return palettes[idx];
    };

    return (
        <motion.div
            className="session-logs-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="sl-header">
                <div className="sl-header-left">
                    <div className="sl-header-icon">
                        <History size={22} />
                    </div>
                    <div>
                        <h1>Session Logs</h1>
                        <p>Complete therapy session history across all your clients</p>
                    </div>
                </div>
                <button className="sl-export-btn" onClick={() => alert('Export feature coming soon!')}>
                    <Download size={16} /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="sl-stats">
                <div className="sl-stat-card">
                    <div className="sl-stat-icon blue"><FileText size={20} /></div>
                    <div><h3>{stats.total}</h3><p>Total Sessions</p></div>
                </div>
                <div className="sl-stat-card">
                    <div className="sl-stat-icon green"><TrendingUp size={20} /></div>
                    <div><h3>{stats.thisWeek}</h3><p>This Week</p></div>
                </div>
                <div className="sl-stat-card">
                    <div className="sl-stat-icon red"><AlertTriangle size={20} /></div>
                    <div><h3>{stats.highRisk}</h3><p>High Risk Sessions</p></div>
                </div>
                <div className="sl-stat-card">
                    <div className="sl-stat-icon purple"><Clock size={20} /></div>
                    <div><h3>{stats.avgDuration}m</h3><p>Avg Duration</p></div>
                </div>
            </div>

            {/* Controls */}
            <div className="sl-controls">
                <div className="sl-search">
                    <Search size={16} />
                    <input
                        placeholder="Search by client name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sl-filter-tabs">
                    {(['all', 'completed', 'pending', 'cancelled'] as const).map(f => (
                        <button
                            key={f}
                            className={`sl-filter-tab ${filterStatus === f ? 'active' : ''}`}
                            onClick={() => setFilterStatus(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f === 'all' && <span className="sl-tab-count">{sessions.length}</span>}
                            {f !== 'all' && <span className="sl-tab-count">{sessions.filter(s => s.status === f).length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessions List */}
            <div className="sl-list">
                <div className="sl-list-header">
                    <span>Client</span>
                    <span>Date &amp; Time</span>
                    <span>Emotion</span>
                    <span>Duration</span>
                    <span>Risk Level</span>
                    <span>Status</span>
                    <span></span>
                </div>

                {filteredSessions.length === 0 ? (
                    <div className="sl-empty">
                        <History size={40} />
                        <p>No sessions found matching your filters</p>
                    </div>
                ) : (
                    filteredSessions.map((session, index) => {
                        const riskStyle = getRiskStyle(session.risk);
                        return (
                            <motion.div
                                key={session.id}
                                className="sl-session-row"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => setSelectedSession(session)}
                                whileHover={{ backgroundColor: '#F5F7FF' }}
                            >
                                <div className="sl-client">
                                    <div className="sl-avatar" style={{ background: getAvatarBg(session.risk, session.client_name) }}>
                                        {session.client_avatar}
                                        {session.risk === 'critical' && <span className="sl-avatar-alert">!</span>}
                                    </div>
                                    <div>
                                        <strong>{session.client_name}</strong>
                                        <span>{session.messages > 0 ? `${session.messages} messages` : '—'}</span>
                                    </div>
                                </div>

                                <div className="sl-date">
                                    <span>{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span>{new Date(session.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="sl-emotion">
                                    <span className="sl-emotion-dot" style={{ background: getEmotionColor(session.emotion), boxShadow: `0 0 6px ${getEmotionColor(session.emotion)}` }}></span>
                                    <span style={{ color: getEmotionColor(session.emotion), fontWeight: 700 }}>{session.emotion}</span>
                                    <span className="sl-intensity">{session.intensity}/10</span>
                                </div>

                                <div className="sl-duration">
                                    <Clock size={13} />
                                    {session.duration}min
                                </div>

                                <div className="sl-risk-badge" style={{ background: riskStyle.bg, color: riskStyle.color }}>
                                    {session.risk}
                                </div>

                                <div className={`sl-status ${session.status}`}>
                                    {session.status === 'completed' && <CheckCircle2 size={13} />}
                                    {session.status === 'pending' && <Clock size={13} />}
                                    {session.status === 'cancelled' && <X size={13} />}
                                    {session.status}
                                </div>

                                <button className="sl-view-btn" onClick={e => { e.stopPropagation(); setSelectedSession(session); }}>
                                    View <ChevronRight size={14} />
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Session Detail Modal */}
            <AnimatePresence>
                {selectedSession && (
                    <motion.div
                        className="sl-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSession(null)}
                    >
                        <motion.div
                            className="sl-modal"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sl-modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div className="sl-avatar" style={{ width: 46, height: 46, borderRadius: 12, background: getAvatarBg(selectedSession.risk, selectedSession.client_name), fontSize: 14, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {selectedSession.client_avatar}
                                    </div>
                                    <div>
                                        <h2>Session with {selectedSession.client_name}</h2>
                                        <p>{new Date(selectedSession.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {new Date(selectedSession.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <button className="sl-modal-close" onClick={() => setSelectedSession(null)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="sl-modal-body">
                                {/* Meta stats row */}
                                <div className="sl-modal-stats">
                                    <div className="sl-modal-stat">
                                        <Clock size={15} />
                                        <span>{selectedSession.duration} minutes</span>
                                    </div>
                                    <div className="sl-modal-stat">
                                        <MessageSquare size={15} />
                                        <span>{selectedSession.messages > 0 ? `${selectedSession.messages} messages` : 'No messages'}</span>
                                    </div>
                                    <div className="sl-modal-stat" style={{ color: getEmotionColor(selectedSession.emotion) }}>
                                        <Activity size={15} />
                                        <span>{selectedSession.emotion} · {selectedSession.intensity}/10</span>
                                    </div>
                                </div>

                                {/* Risk badge */}
                                <div className={`sl-modal-risk ${selectedSession.risk}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <strong>Risk Level: {selectedSession.risk.toUpperCase()}</strong>
                                        <div className={`sl-status ${selectedSession.status}`} style={{ fontSize: '0.78rem' }}>
                                            {selectedSession.status}
                                        </div>
                                    </div>
                                    {selectedSession.risk === 'critical' && (
                                        <p>Crisis intervention protocols were activated. Safety plan reviewed and emergency contacts notified.</p>
                                    )}
                                    {selectedSession.risk === 'high' && (
                                        <p>Elevated distress detected. Close monitoring and weekly follow-ups required.</p>
                                    )}
                                </div>

                                {/* AI Summary */}
                                {selectedSession.summary && (
                                    <div className="sl-modal-summary">
                                        <h3><FileText size={15} /> Session Summary</h3>
                                        <p>{selectedSession.summary}</p>
                                    </div>
                                )}

                                {/* Coach Notes */}
                                {selectedSession.notes && (
                                    <div className="sl-modal-notes">
                                        <h3>Clinical Notes</h3>
                                        <p>{selectedSession.notes}</p>
                                    </div>
                                )}

                                {/* No summary for future/cancelled */}
                                {!selectedSession.summary && (
                                    <div className="sl-modal-empty">
                                        <Calendar size={28} />
                                        <p>{selectedSession.status === 'pending' ? 'This session has not taken place yet.' : 'Session was cancelled — no summary available.'}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SessionLogs;
