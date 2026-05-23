import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    X, 
    Check, 
    Award, 
    User,
    Hash,
    Clock,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import axios from 'axios';
import './CoachApproval.css';

interface PendingCoach {
    coach_id: number;
    user_id: number;
    full_name: string;
    specialization: string;
    license_id: string;
    requested_at: string;
}

const CoachApproval: React.FC = () => {
    const [pendingCoaches, setPendingCoaches] = useState<PendingCoach[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchPendingCoaches();
    }, []);

    const fetchPendingCoaches = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/human_coach/coaches/pending/');
            setPendingCoaches(response.data);
        } catch (error) {
            console.error('Error fetching pending coaches:', error);
            showMessage('error', 'Failed to load pending coaches');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (coachId: number, coachName: string) => {
        if (!window.confirm(`Approve coach ${coachName}?`)) return;
        
        try {
            setActionLoading(coachId);
            await axios.post(`http://127.0.0.1:8000/api/human_coach/coaches/${coachId}/approve/`);
            showMessage('success', `${coachName} has been approved!`);
            setPendingCoaches(prev => prev.filter(coach => coach.coach_id !== coachId));
        } catch (error) {
            console.error('Error approving coach:', error);
            showMessage('error', 'Failed to approve coach');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (coachId: number, coachName: string) => {
        if (!window.confirm(`Reject coach application for ${coachName}? This action cannot be undone.`)) return;
        
        try {
            setActionLoading(coachId);
            await axios.post(`http://127.0.0.1:8000/api/human_coach/coaches/${coachId}/reject/`);
            showMessage('success', `${coachName}'s application has been rejected`);
            setPendingCoaches(prev => prev.filter(coach => coach.coach_id !== coachId));
        } catch (error) {
            console.error('Error rejecting coach:', error);
            showMessage('error', 'Failed to reject coach');
        } finally {
            setActionLoading(null);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Just now';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="coach-approval-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading pending approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="coach-approval-page">
            <div className="approval-header">
                <div className="header-content">
                    <ShieldCheck size={40} className="header-icon" />
                    <div>
                        <h1>Coach Approval Center</h1>
                        <p>Review and approve coach applications</p>
                    </div>
                </div>
                <div className="pending-count">
                    <span className="count">{pendingCoaches.length}</span>
                    <span className="label">Pending</span>
                </div>
            </div>

            {message && (
                <motion.div 
                    className={`message-banner ${message.type}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </motion.div>
            )}

            {pendingCoaches.length === 0 ? (
                <div className="empty-state">
                    <CheckCircle size={64} className="empty-icon" />
                    <h2>All Caught Up!</h2>
                    <p>No pending coach applications at this time.</p>
                </div>
            ) : (
                <div className="coaches-grid">
                    {pendingCoaches.map((coach, index) => (
                        <motion.div
                            key={coach.coach_id}
                            className="coach-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="coach-card-header">
                                <div className="coach-avatar">
                                    <Award size={32} />
                                </div>
                                <div className="coach-info">
                                    <h3>{coach.full_name}</h3>
                                    <p className="specialization">{coach.specialization}</p>
                                </div>
                            </div>

                            <div className="coach-details">
                                <div className="detail-item">
                                    <Hash size={18} />
                                    <div>
                                        <span className="detail-label">License ID</span>
                                        <span className="detail-value">{coach.license_id}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <User size={18} />
                                    <div>
                                        <span className="detail-label">User ID</span>
                                        <span className="detail-value">#{coach.user_id}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <Clock size={18} />
                                    <div>
                                        <span className="detail-label">Applied</span>
                                        <span className="detail-value">{formatDate(coach.requested_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="coach-actions">
                                <button 
                                    className="reject-btn"
                                    onClick={() => handleReject(coach.coach_id, coach.full_name)}
                                    disabled={actionLoading === coach.coach_id}
                                >
                                    <X size={18} />
                                    {actionLoading === coach.coach_id ? 'Processing...' : 'Reject'}
                                </button>
                                <button 
                                    className="approve-btn"
                                    onClick={() => handleApprove(coach.coach_id, coach.full_name)}
                                    disabled={actionLoading === coach.coach_id}
                                >
                                    <Check size={18} />
                                    {actionLoading === coach.coach_id ? 'Processing...' : 'Approve'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoachApproval;
