import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Activity,
    TrendingUp,
    Calendar,
    MessageSquare,
    Award,
    Clock,
    BarChart3,
    Heart,
    CheckCircle,
    AlertCircle,
    X,
    Bell
} from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import './CoachDashboard.css';

interface Stats {
    totalClients: number;
    activeSessions: number;
    pendingReviews: number;
    weeklyGrowth: number;
}

interface RecentActivity {
    id: number;
    client_name: string;
    activity: string;
    time: string;
    emotion?: string;
}

interface BookedAppointment {
    id: number;
    clientName: string;
    clientId: number | null;
    coachId: number;
    coachName: string;
    coachSpecialization: string;
    date: string;
    time: string;
    notes: string;
    status: 'pending' | 'accepted' | 'declined';
    bookedAt: string;
}

const CoachDashboard: React.FC = () => {
    const user = getCurrentUser();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({
        totalClients: 0,
        activeSessions: 0,
        pendingReviews: 0,
        weeklyGrowth: 0
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingAppointments, setPendingAppointments] = useState<BookedAppointment[]>([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleClient, setScheduleClient] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('10:00');
    const [scheduleSuccess, setScheduleSuccess] = useState(false);
    const [declineAppt, setDeclineAppt] = useState<BookedAppointment | null>(null);
    const [suggestedDate, setSuggestedDate] = useState('');
    const [suggestedTime, setSuggestedTime] = useState('10:00');
    const [declineNote, setDeclineNote] = useState('');

    useEffect(() => {
        fetchCoachData();
    }, []);

    const fetchCoachData = async () => {
        try {
            setLoading(true);

            // Load appointments from localStorage (saved when clients book via the modal)
            const stored = JSON.parse(localStorage.getItem('mindwell_appointments') || '[]') as BookedAppointment[];
            const pending = stored.filter(a => a.status === 'pending');
            setPendingAppointments(pending);

            setStats({
                totalClients: 12,
                activeSessions: 5,
                pendingReviews: pending.length,
                weeklyGrowth: 15
            });

            setRecentActivities([
                { id: 1, client_name: 'John D.', activity: 'Completed session', time: '2 hours ago', emotion: 'anxious' },
                { id: 2, client_name: 'Sarah M.', activity: 'New message', time: '4 hours ago', emotion: 'sad' },
                { id: 3, client_name: 'Mike R.', activity: 'Session scheduled', time: '1 day ago' },
                { id: 4, client_name: 'Emily K.', activity: 'Progress milestone', time: '2 days ago', emotion: 'joy' }
            ]);
        } catch (error) {
            console.error('Error fetching coach data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const createClientNotification = (appt: BookedAppointment, status: 'accepted' | 'declined', sugDate?: string, sugTime?: string, note?: string) => {
        const notif = {
            id: Date.now(),
            type: status === 'accepted' ? 'appointment_accepted' : 'appointment_declined',
            clientId: appt.clientId,
            clientName: appt.clientName,
            coachId: appt.coachId,
            coachName: appt.coachName,
            coachSpecialization: appt.coachSpecialization,
            originalDate: appt.date,
            originalTime: appt.time,
            suggestedDate: sugDate || null,
            suggestedTime: sugTime || null,
            note: note || null,
            createdAt: new Date().toISOString(),
            is_read: false,
        };
        const existing = JSON.parse(localStorage.getItem('mindwell_notifications') || '[]');
        existing.unshift(notif);
        localStorage.setItem('mindwell_notifications', JSON.stringify(existing));
    };

    const updateAppointmentStatus = (id: number, status: 'accepted' | 'declined', sugDate?: string, sugTime?: string, note?: string) => {
        const all = JSON.parse(localStorage.getItem('mindwell_appointments') || '[]') as BookedAppointment[];
        const appt = all.find(a => a.id === id);
        const updated = all.map(a => a.id === id ? { ...a, status } : a);
        localStorage.setItem('mindwell_appointments', JSON.stringify(updated));
        if (appt) createClientNotification(appt, status, sugDate, sugTime, note);
        setPendingAppointments(prev => prev.filter(a => a.id !== id));
        setStats(prev => ({ ...prev, pendingReviews: Math.max(0, prev.pendingReviews - 1) }));
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="coach-dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="coach-dashboard">
            {/* Welcome Section */}
            <motion.div 
                className="welcome-section"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="welcome-content">
                    <h1>{getGreeting()}, {user?.name || 'Coach'}!</h1>
                    <p>Here's an overview of your practice today</p>
                </div>
                <div className="coach-badge">
                    <Award size={24} />
                    <span>Licensed Professional</span>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <motion.div 
                    className="stat-card primary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon">
                        <Users size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalClients}</h3>
                        <p>Total Clients</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon">
                        <Activity size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.activeSessions}</h3>
                        <p>Active Sessions</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card warning"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon">
                        <MessageSquare size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingReviews}</h3>
                        <p>Pending Reviews</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card accent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon">
                        <TrendingUp size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>+{stats.weeklyGrowth}%</h3>
                        <p>Weekly Growth</p>
                    </div>
                </motion.div>
            </div>

            {/* Pending Appointment Requests */}
            {pendingAppointments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{ marginBottom: 24 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#EF4444,#DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} color="white" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>
                            Pending Appointment Requests
                        </h2>
                        <span style={{ background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {pendingAppointments.length} new
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {pendingAppointments.map((appt, idx) => (
                            <motion.div
                                key={appt.id}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.07 }}
                                style={{
                                    background: 'white',
                                    border: '1.5px solid #FDE68A',
                                    borderLeft: '5px solid #F59E0B',
                                    borderRadius: 14,
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    boxShadow: '0 2px 12px rgba(245,158,11,0.1)',
                                }}
                            >
                                {/* Client Avatar */}
                                <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                                    {appt.clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>{appt.clientName}</span>
                                        <span style={{ background: '#FFF7ED', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 20, padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                                            Pending
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.82rem', color: '#6B7280' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar size={13} /> {formatDate(appt.date)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={13} /> {appt.time}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Award size={13} /> {appt.coachName}
                                        </span>
                                    </div>
                                    {appt.notes && (
                                        <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#4B5563', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 10px', lineHeight: 1.5 }}>
                                            "{appt.notes}"
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button
                                        onClick={() => updateAppointmentStatus(appt.id, 'accepted')}
                                        style={{ padding: '8px 16px', borderRadius: 9, background: 'linear-gradient(135deg,#059669,#047857)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5 }}
                                    >
                                        <CheckCircle size={14} /> Accept
                                    </button>
                                    <button
                                        onClick={() => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + 2);
                                            setSuggestedDate(d.toISOString().split('T')[0]);
                                            setSuggestedTime('10:00');
                                            setDeclineNote('');
                                            setDeclineAppt(appt);
                                        }}
                                        style={{ padding: '8px 14px', borderRadius: 9, background: 'white', color: '#DC2626', border: '1.5px solid #FECACA', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5 }}
                                    >
                                        <X size={14} /> Decline
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Recent Activity */}
                <motion.div 
                    className="dashboard-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="card-header">
                        <h2>Recent Activity</h2>
                        <Clock size={20} />
                    </div>
                    <div className="activity-list">
                        {recentActivities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                className="activity-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                            >
                                <div className="activity-icon">
                                    {activity.emotion ? <Heart size={18} /> : <CheckCircle size={18} />}
                                </div>
                                <div className="activity-content">
                                    <p className="activity-text">
                                        <strong>{activity.client_name}</strong> {activity.activity}
                                    </p>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                                {activity.emotion && (
                                    <span className={`emotion-badge ${activity.emotion}`}>
                                        {activity.emotion}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                    className="dashboard-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="quick-actions">
                        <button className="action-btn primary" onClick={() => { setScheduleSuccess(false); setShowScheduleModal(true); }}>
                            <Calendar size={20} />
                            <span>Schedule Session</span>
                        </button>
                        <button className="action-btn secondary" onClick={() => navigate('/dashboard/patients')}>
                            <Users size={20} />
                            <span>View All Clients</span>
                        </button>
                        <button className="action-btn accent" onClick={() => navigate('/dashboard/session-logs')}>
                            <BarChart3 size={20} />
                            <span>View Session Logs</span>
                        </button>
                        <button className="action-btn success" onClick={() => navigate('/dashboard/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                        </button>
                    </div>
                </motion.div>

                {/* Today's Schedule */}
                <motion.div 
                    className="dashboard-card wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="card-header">
                        <h2>Today's Schedule</h2>
                        <Calendar size={20} />
                    </div>
                    <div className="schedule-list">
                        <div className="schedule-item">
                            <div className="schedule-time">10:00 AM</div>
                            <div className="schedule-content">
                                <h4>Session with John D.</h4>
                                <p>Follow-up on anxiety management</p>
                            </div>
                            <CheckCircle size={20} className="schedule-status complete" />
                        </div>
                        <div className="schedule-item">
                            <div className="schedule-time">2:00 PM</div>
                            <div className="schedule-content">
                                <h4>Session with Sarah M.</h4>
                                <p>Initial consultation</p>
                            </div>
                            <AlertCircle size={20} className="schedule-status pending" />
                        </div>
                        <div className="schedule-item">
                            <div className="schedule-time">4:30 PM</div>
                            <div className="schedule-content">
                                <h4>Team Meeting</h4>
                                <p>Weekly review with clinical staff</p>
                            </div>
                            <Clock size={20} className="schedule-status upcoming" />
                        </div>
                    </div>
                </motion.div>
            </div>
            {/* Schedule Session Modal */}
            <AnimatePresence>
                {showScheduleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                        }}
                        onClick={() => setShowScheduleModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: 'white', borderRadius: 20,
                                width: '100%', maxWidth: 480,
                                boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
                                overflow: 'hidden'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px', borderBottom: '1px solid #F3F4F6', background: 'linear-gradient(135deg,#F5F7FF,#fff)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={20} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>Schedule Session</h2>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>Book a new session with a client</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowScheduleModal(false)} style={{ width: 34, height: 34, borderRadius: 8, border: '2px solid #D1D5DB', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <X size={18} color="#374151" />
                                </button>
                            </div>
                            <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {scheduleSuccess ? (
                                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                            <CheckCircle size={32} color="#059669" />
                                        </div>
                                        <h3 style={{ margin: '0 0 6px', color: '#1E1B4B', fontWeight: 800 }}>Session Scheduled!</h3>
                                        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>The session has been added to your calendar.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Client Name</label>
                                            <select value={scheduleClient} onChange={e => setScheduleClient(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: 9, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', background: '#FAFAFA' }}>
                                                <option value="">— Select a client —</option>
                                                <option value="Nadia Shah">Nadia Shah (Critical)</option>
                                                <option value="Marcus Wright">Marcus Wright (High Risk)</option>
                                                <option value="Sara Malik">Sara Malik (High Risk)</option>
                                                <option value="Alice Thompson">Alice Thompson</option>
                                                <option value="Hana Lee">Hana Lee</option>
                                                <option value="David Chen">David Chen</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Date</label>
                                            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: 9, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Time</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                                {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'].map(t => (
                                                    <button key={t} onClick={() => setScheduleTime(t)} style={{ padding: '8px 4px', border: `1.5px solid ${scheduleTime === t ? '#4F46E5' : '#E5E7EB'}`, borderRadius: 8, background: scheduleTime === t ? '#4F46E5' : 'white', color: scheduleTime === t ? 'white' : '#6B7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            disabled={!scheduleClient || !scheduleDate}
                                            onClick={() => setScheduleSuccess(true)}
                                            style={{ padding: '12px', borderRadius: 10, background: !scheduleClient || !scheduleDate ? '#E5E7EB' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: !scheduleClient || !scheduleDate ? '#9CA3AF' : 'white', border: 'none', cursor: !scheduleClient || !scheduleDate ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: !scheduleClient || !scheduleDate ? 'none' : '0 4px 14px rgba(79,70,229,0.3)' }}
                                        >
                                            Confirm Session
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decline & Suggest Alternative Time Modal */}
            <AnimatePresence>
                {declineAppt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                        onClick={() => setDeclineAppt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px', borderBottom: '1px solid #F3F4F6', background: 'linear-gradient(135deg,#FEF2F2,#fff)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#EF4444,#DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={20} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>Suggest Alternative Time</h2>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>Decline & offer a new slot to {declineAppt.clientName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setDeclineAppt(null)} style={{ width: 34, height: 34, borderRadius: 8, border: '2px solid #D1D5DB', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <X size={18} color="#374151" />
                                </button>
                            </div>

                            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Original appointment info */}
                                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#991B1B' }}>
                                    <AlertCircle size={16} color="#EF4444" />
                                    <span>Client requested: <strong>{formatDate(declineAppt.date)}</strong> at <strong>{declineAppt.time}</strong></span>
                                </div>

                                {/* Suggest date */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your Available Date</label>
                                    <input
                                        type="date"
                                        value={suggestedDate}
                                        onChange={e => setSuggestedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: 9, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Suggest time */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Available Time Slot</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                        {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'].map(t => (
                                            <button key={t} onClick={() => setSuggestedTime(t)} style={{ padding: '8px 4px', border: `1.5px solid ${suggestedTime === t ? '#4F46E5' : '#E5E7EB'}`, borderRadius: 8, background: suggestedTime === t ? '#4F46E5' : 'white', color: suggestedTime === t ? 'white' : '#6B7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{t}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Optional note */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                        Note to Client <span style={{ fontWeight: 400, color: '#9CA3AF', textTransform: 'none' }}>(optional)</span>
                                    </label>
                                    <textarea
                                        value={declineNote}
                                        onChange={e => setDeclineNote(e.target.value)}
                                        placeholder="e.g. I have a prior commitment on that day..."
                                        rows={2}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D1D5DB', borderRadius: 9, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', background: '#FAFAFA', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    />
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                    <button
                                        onClick={() => setDeclineAppt(null)}
                                        style={{ flex: 1, padding: '11px', borderRadius: 9, background: 'white', color: '#6B7280', border: '1.5px solid #D1D5DB', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={!suggestedDate}
                                        onClick={() => {
                                            updateAppointmentStatus(declineAppt!.id, 'declined', suggestedDate, suggestedTime, declineNote);
                                            setDeclineAppt(null);
                                        }}
                                        style={{ flex: 2, padding: '11px', borderRadius: 9, background: !suggestedDate ? '#E5E7EB' : 'linear-gradient(135deg,#EF4444,#DC2626)', color: !suggestedDate ? '#9CA3AF' : 'white', border: 'none', cursor: !suggestedDate ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                                    >
                                        Decline & Send Suggestion
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoachDashboard;
