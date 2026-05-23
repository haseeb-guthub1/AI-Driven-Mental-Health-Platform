import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    AlertCircle
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

const CoachDashboard: React.FC = () => {
    const user = getCurrentUser();
    const [stats, setStats] = useState<Stats>({
        totalClients: 0,
        activeSessions: 0,
        pendingReviews: 0,
        weeklyGrowth: 0
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoachData();
    }, []);

    const fetchCoachData = async () => {
        try {
            setLoading(true);
            // Fetch coach statistics
            // TODO: Replace with actual API endpoints
            // const statsResponse = await axios.get(`http://127.0.0.1:8000/api/coach/stats/${user?.id}/`);
            
            // Mock data for now
            setStats({
                totalClients: 12,
                activeSessions: 5,
                pendingReviews: 3,
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
                        <button className="action-btn primary">
                            <Calendar size={20} />
                            <span>Schedule Session</span>
                        </button>
                        <button className="action-btn secondary">
                            <Users size={20} />
                            <span>View All Clients</span>
                        </button>
                        <button className="action-btn accent">
                            <BarChart3 size={20} />
                            <span>View Analytics</span>
                        </button>
                        <button className="action-btn success">
                            <MessageSquare size={20} />
                            <span>Send Message</span>
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
        </div>
    );
};

export default CoachDashboard;
