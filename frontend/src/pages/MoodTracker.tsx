import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Activity, TrendingUp, Brain, FileText, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './MoodTracker.css';

interface SessionSummary {
    session_id: number;
    summary: string;
    final_emotion: string;
    emotion_intensity: number;
    message_count: number;
    date: string;
}

interface EmotionData {
    emotion_id: number;
    emotion: string;
    intensity: number;
    risk_level?: string;
    created_at: string;
    notes?: string;
}

interface ChartDataPoint {
    date: string;
    intensity: number;
    emotion: string;
    risk_level: string;
}

interface EmotionStats {
    totalLogs: number;
    avgIntensity: number;
    dominantEmotion: string;
    highRiskCount: number;
    recentTrend: string;
}

const MoodTracker: React.FC = () => {
    const navigate = useNavigate();
    const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [emotionDistribution, setEmotionDistribution] = useState<any[]>([]);
    const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
    const [statistics, setStatistics] = useState<EmotionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('line');
    const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');
    const [clientId, setClientId] = useState<number | null>(null);
    const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
    const [expandedSummary, setExpandedSummary] = useState<SessionSummary | null>(null);

    useEffect(() => {
        const user = getCurrentUser();
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            const id = userData.id || userData.client_id || userData.user_id;
            setClientId(id);
        } else if (user) {
            setClientId(user.id);
        }
    }, []);

    // Fetch data when clientId or timeRange changes
    useEffect(() => {
        if (clientId) {
            fetchMoods();
            fetchSessionSummaries();
        }
    }, [clientId, timeRange]);

    const fetchSessionSummaries = async () => {
        if (!clientId) return;
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/sessions/?client_id=${clientId}`);
            const withSummary = res.data.filter((s: any) => s.summary);
            setSessionSummaries(withSummary.slice(0, 5));
        } catch {
            // silently ignore
        }
    };

    const fetchMoods = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:8000/api/emotion-data/?client_id=${clientId}`);
            
            const rawData: EmotionData[] = response.data;
            setEmotionData(rawData);
            
            // Filter by time range
            const now = new Date();
            const filteredData = rawData.filter((item: EmotionData) => {
                const itemDate = new Date(item.created_at);
                if (timeRange === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= weekAgo;
                } else if (timeRange === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return itemDate >= monthAgo;
                }
                return true; // all
            });
            
            // Format for time-series chart
            const chartPoints: ChartDataPoint[] = filteredData.map((item: EmotionData) => ({
                date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                intensity: item.intensity,
                emotion: item.emotion,
                risk_level: extractRiskLevel(item.notes, item.intensity)
            }));
            setChartData(chartPoints);
            
            // Calculate emotion distribution
            const distribution: { [key: string]: number } = {};
            filteredData.forEach((item: EmotionData) => {
                distribution[item.emotion] = (distribution[item.emotion] || 0) + 1;
            });
            
            const distributionData = Object.entries(distribution)
                .map(([emotion, count]) => ({ emotion, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            
            setEmotionDistribution(distributionData);
            
            // Calculate risk distribution
            const riskCounts: { [key: string]: number } = { low: 0, medium: 0, high: 0, critical: 0 };
            filteredData.forEach((item: EmotionData) => {
                const risk = extractRiskLevel(item.notes, item.intensity);
                riskCounts[risk] = (riskCounts[risk] || 0) + 1;
            });
            
            const riskData = Object.entries(riskCounts)
                .filter(([_, count]) => count > 0)
                .map(([risk, count]) => ({ risk, count }));
            
            setRiskDistribution(riskData);
            
            // Calculate statistics
            if (filteredData.length > 0) {
                const avgIntensity = filteredData.reduce((sum, item) => sum + item.intensity, 0) / filteredData.length;
                const emotionCounts = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
                const dominantEmotion = emotionCounts[0]?.[0] || 'N/A';
                const highRiskCount = filteredData.filter(item => {
                    const risk = extractRiskLevel(item.notes, item.intensity);
                    return risk === 'high' || risk === 'critical';
                }).length;
                
                // Calculate trend: lower intensity over time = Improving for mental health
                const midpoint = Math.floor(filteredData.length / 2);
                const firstHalfAvg = filteredData.slice(0, midpoint).reduce((sum, item) => sum + item.intensity, 0) / (midpoint || 1);
                const secondHalfAvg = filteredData.slice(midpoint).reduce((sum, item) => sum + item.intensity, 0) / ((filteredData.length - midpoint) || 1);
                const highRiskRatio = filteredData.filter(item => {
                    const risk = extractRiskLevel(item.notes, item.intensity);
                    return risk === 'high' || risk === 'critical';
                }).length / (filteredData.length || 1);
                let trend: string;
                if (highRiskRatio >= 0.5) {
                    trend = 'High Risk';
                } else if (secondHalfAvg < firstHalfAvg - 1) {
                    trend = 'Improving';
                } else if (secondHalfAvg > firstHalfAvg + 1) {
                    trend = 'Worsening';
                } else {
                    trend = 'Stable';
                }
                
                setStatistics({
                    totalLogs: filteredData.length,
                    avgIntensity: Math.round(avgIntensity * 10) / 10,
                    dominantEmotion,
                    highRiskCount,
                    recentTrend: trend
                });
            }
        } catch (err) {
            console.error("Failed to fetch emotion data", err);
        } finally {
            setLoading(false);
        }
    };
    
    const extractRiskLevel = (notes?: string, intensity?: number): string => {
        // Calculate risk based on intensity value
        if (intensity !== undefined) {
            if (intensity >= 9) return 'critical';
            if (intensity >= 7) return 'high';
            if (intensity >= 4) return 'medium';
            return 'low';
        }
        
        // Fallback: try to extract from notes if intensity not provided
        if (!notes) return 'low';
        if (notes.includes('critical')) return 'critical';
        if (notes.includes('high')) return 'high';
        if (notes.includes('medium')) return 'medium';
        return 'low';
    };

    // Color mapping for emotions
    const getEmotionColor = (emotion: string): string => {
        const colorMap: { [key: string]: string } = {
            'joy': '#4CAF50',
            'happiness': '#8BC34A',
            'love': '#E91E63',
            'excitement': '#FF9800',
            'gratitude': '#00BCD4',
            'sadness': '#2196F3',
            'grief': '#3F51B5',
            'disappointment': '#607D8B',
            'anger': '#F44336',
            'annoyance': '#FF5722',
            'disgust': '#795548',
            'fear': '#9C27B0',
            'nervousness': '#673AB7',
            'anxiety': '#673AB7',
            'surprise': '#FFEB3B',
            'confusion': '#9E9E9E',
            'neutral': '#757575'
        };
        return colorMap[emotion.toLowerCase()] || '#A8D8EA';
    };
    
    const getRiskColor = (risk: string): string => {
        const riskColors: { [key: string]: string } = {
            low: '#4CAF50',
            medium: '#FF9800',
            high: '#FF5722',
            critical: '#F44336'
        };
        return riskColors[risk] || '#757575';
    };

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="empty-chart">
                    <Activity size={48} color="#A8D8EA" />
                    <p>No emotion data yet. Start conversations in AI Guidance to track emotions!</p>
                </div>
            );
        }

        const commonProps = {
            data: chartData,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        };

        switch (chartType) {
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A8D8EA" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#AA96DA" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 216, 234, 0.2)" vertical={false} />
                        <XAxis dataKey="date" stroke="#7F8C8D" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} hide />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                                border: '2px solid rgba(168, 216, 234, 0.3)', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(168, 216, 234, 0.2)'
                            }}
                            itemStyle={{ color: '#2C3E50', fontWeight: '600' }}
                            labelStyle={{ color: '#7F8C8D', fontWeight: '600' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="intensity" 
                            stroke="#A8D8EA" 
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            strokeWidth={3}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                );
            
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 216, 234, 0.2)" />
                        <XAxis dataKey="date" stroke="#7F8C8D" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} hide />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                                border: '2px solid rgba(168, 216, 234, 0.3)', 
                                borderRadius: '12px'
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="intensity" 
                            stroke="#A8D8EA" 
                            strokeWidth={3}
                            dot={{ fill: '#AA96DA', r: 5 }}
                            activeDot={{ r: 8 }}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </LineChart>
                );
            
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 216, 234, 0.2)" vertical={false} />
                        <XAxis dataKey="date" stroke="#7F8C8D" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} hide />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                                border: '2px solid rgba(168, 216, 234, 0.3)', 
                                borderRadius: '12px'
                            }}
                        />
                        <Bar 
                            dataKey="intensity" 
                            fill="#A8D8EA" 
                            radius={[8, 8, 0, 0]}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </BarChart>
                );
        }
    };

    if (loading) {
        return (
            <div className="mood-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading mood data...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div className="mood-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="page-header">
                <div>
                    <h1>📊 Emotion Analytics</h1>
                    <p>Tracking emotions detected from your AI Guidance conversations.</p>
                </div>
                {statistics && (
                    <div className="risk-indicator-chip" style={{
                        background: statistics.recentTrend === 'Improving' ? '#dcfce7' :
                                    statistics.recentTrend === 'Stable' ? '#fef9c3' : '#fee2e2',
                        color: statistics.recentTrend === 'Improving' ? '#16a34a' :
                               statistics.recentTrend === 'Stable' ? '#ca8a04' : '#dc2626',
                        border: `1.5px solid ${statistics.recentTrend === 'Improving' ? '#86efac' : statistics.recentTrend === 'Stable' ? '#fde047' : '#fca5a5'}`
                    }}>
                        <TrendingUp size={16} />
                        <span>Trend: <strong>{statistics.recentTrend}</strong></span>
                    </div>
                )}
            </header>
            
            {/* Statistics Cards */}
            {statistics && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <Activity size={24} color="#A8D8EA" />
                        <div className="stat-content">
                            <h4>Total Logs</h4>
                            <p className="stat-value">{statistics.totalLogs}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <TrendingUp size={24} color="#AA96DA" />
                        <div className="stat-content">
                            <h4>Avg Intensity</h4>
                            <p className="stat-value">{statistics.avgIntensity}/10</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Brain size={24} color="#FCBAD3" />
                        <div className="stat-content">
                            <h4>Dominant Emotion</h4>
                            <p className="stat-value" style={{ fontSize: '0.9rem' }}>{statistics.dominantEmotion}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <AlertCircle size={24} color="#FF5722" />
                        <div className="stat-content">
                            <h4>High-Risk Events</h4>
                            <p className="stat-value">{statistics.highRiskCount}</p>
                        </div>
                    </div>
                </div>
            )}

            <section className="chart-section">
                <div className="chart-header">
                    <h3>📈 Emotion Intensity Over Time</h3>
                    <div className="controls-wrapper">
                        <div className="time-range-selector">
                            <button 
                                className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
                                onClick={() => setTimeRange('all')}
                            >
                                All Time
                            </button>
                            <button 
                                className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
                                onClick={() => setTimeRange('month')}
                            >
                                Last Month
                            </button>
                            <button 
                                className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
                                onClick={() => setTimeRange('week')}
                            >
                                Last Week
                            </button>
                        </div>
                        <div className="chart-controls">
                            <button 
                                className={`chart-btn ${chartType === 'area' ? 'active' : ''}`}
                                onClick={() => setChartType('area')}
                            >
                                Area
                            </button>
                            <button 
                                className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
                                onClick={() => setChartType('line')}
                            >
                                Line
                            </button>
                            <button 
                                className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
                                onClick={() => setChartType('bar')}
                            >
                                Bar
                            </button>
                        </div>
                    </div>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={chartType}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                style={{ width: '100%', height: '100%' }}
                            >
                                {renderChart()}
                            </motion.div>
                        </AnimatePresence>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Emotion Distribution Chart */}
            <div className="analytics-grid">
                {emotionDistribution.length > 0 && (
                    <section className="chart-section">
                        <div className="chart-header">
                            <h3>🎭 Emotion Distribution</h3>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart 
                                    data={emotionDistribution}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 216, 234, 0.2)" vertical={false} />
                                    <XAxis 
                                        dataKey="emotion" 
                                        stroke="#7F8C8D" 
                                        axisLine={false} 
                                        tickLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                                            border: '2px solid rgba(168, 216, 234, 0.3)', 
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <Bar 
                                        dataKey="count" 
                                        radius={[8, 8, 0, 0]}
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                    >
                                        {emotionDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}
                
                {/* Risk Level Distribution */}
                {riskDistribution.length > 0 && (
                    <section className="chart-section">
                        <div className="chart-header">
                            <h3>⚠️ Risk Level Analysis</h3>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={riskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry: any) => `${entry.risk}: ${entry.count}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        animationDuration={1500}
                                    >
                                        {riskDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}
            </div>
            
            {/* Session Summaries */}
            {sessionSummaries.length > 0 && (
                <section className="recent-emotions-section">
                    <h3><FileText size={18} style={{ display: 'inline', marginRight: 6 }} />Session Summaries</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                        {sessionSummaries.map((session) => (
                            <motion.div
                                key={session.session_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setExpandedSummary(session)}
                                style={{
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 12,
                                    padding: '14px 16px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s, border-color 0.2s'
                                }}
                                whileHover={{ boxShadow: '0 4px 16px rgba(99,102,241,0.15)', borderColor: '#6366f1' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                    <MessageSquare size={14} color="#6366f1" />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                                        Session {session.session_id}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                                        {new Date(session.date).toLocaleDateString()}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem', fontWeight: 600,
                                        background: getEmotionColor(session.final_emotion) + '22',
                                        color: getEmotionColor(session.final_emotion),
                                        borderRadius: 6, padding: '2px 8px'
                                    }}>
                                        {session.final_emotion} · {session.emotion_intensity}/10
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>
                                        {session.message_count} msgs
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.83rem', color: '#4b5563', margin: 0, lineHeight: 1.55 }}>
                                    {session.summary.substring(0, 220)}{session.summary.length > 220 ? '…' : ''}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: 6, display: 'block' }}>
                                    Click to read full summary →
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Full Summary Modal */}
            {expandedSummary && (
                <div
                    onClick={() => setExpandedSummary(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.55)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', padding: 16
                    }}
                >
                    <motion.div
                        onClick={e => e.stopPropagation()}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: '#fff', borderRadius: 16, padding: 28,
                            maxWidth: 680, width: '100%', maxHeight: '85vh',
                            overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FileText size={22} color="#6366f1" />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#111827' }}>
                                        Session {expandedSummary.session_id} Summary
                                    </h3>
                                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                                        {new Date(expandedSummary.date).toLocaleDateString()} · {expandedSummary.message_count} messages
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setExpandedSummary(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                            <span style={{
                                fontSize: '0.8rem', fontWeight: 600,
                                background: getEmotionColor(expandedSummary.final_emotion) + '22',
                                color: getEmotionColor(expandedSummary.final_emotion),
                                borderRadius: 8, padding: '4px 12px'
                            }}>
                                {expandedSummary.final_emotion}
                            </span>
                            <span style={{
                                fontSize: '0.8rem', fontWeight: 600,
                                background: '#f3f4f6', color: '#374151',
                                borderRadius: 8, padding: '4px 12px'
                            }}>
                                Intensity: {expandedSummary.emotion_intensity}/10
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                            {expandedSummary.summary}
                        </p>
                        <button
                            onClick={() => { setExpandedSummary(null); navigate(`/dashboard/session/${expandedSummary.session_id}`); }}
                            style={{
                                marginTop: 20, padding: '10px 20px',
                                background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem'
                            }}
                        >
                            View Full Session Details →
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Recent Emotions List */}
            {emotionData.length > 0 && (
                <section className="recent-emotions-section">
                    <h3>📝 Recent Emotion Logs</h3>
                    <div className="emotions-list">
                        {emotionData.slice(0, 10).map((emotion) => (
                            <motion.div 
                                key={emotion.emotion_id}
                                className="emotion-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="emotion-info">
                                    <span 
                                        className="emotion-badge" 
                                        style={{ backgroundColor: getEmotionColor(emotion.emotion) }}
                                    >
                                        {emotion.emotion}
                                    </span>
                                    <span className="emotion-date">
                                        {new Date(emotion.created_at).toLocaleString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                <div className="emotion-metrics">
                                    <span className="intensity-badge">
                                        Intensity: {emotion.intensity}/10
                                    </span>
                                    <span 
                                        className="risk-badge" 
                                        style={{ backgroundColor: getRiskColor(extractRiskLevel(emotion.notes, emotion.intensity)) }}
                                    >
                                        {extractRiskLevel(emotion.notes, emotion.intensity)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </motion.div>
    );
};

export default MoodTracker;