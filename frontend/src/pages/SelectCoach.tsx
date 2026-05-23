import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Shield,
    Award,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Heart,
    Star,
    Info,
    AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';
import { getCurrentUser } from '../services/authService';
import './SelectCoach.css';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
    experience_years?: number;
    bio?: string;
}

const SelectCoach: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const clientId = user?.client_id || user?.id;

    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApprovedCoaches();
    }, []);

    const fetchApprovedCoaches = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await apiService.getAvailableCoaches();
            // Filter only approved coaches
            const approvedCoaches = (response.data.coaches || []).filter(
                (coach: Coach) => coach.is_approved === true
            );
            setCoaches(approvedCoaches);
        } catch (err: any) {
            console.error('Failed to fetch coaches:', err);
            setError('Unable to load coaches. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignCoach = async () => {
        if (!selectedCoach || !clientId) {
            setError('Please select a coach to continue.');
            return;
        }

        setIsAssigning(true);
        setError(null);

        try {
            const response = await apiService.assignCoachToClient(clientId, selectedCoach);
            
            if (response.data.success) {
                // Show success message
                setTimeout(() => {
                    navigate('/dashboard');
                    window.location.reload(); // Refresh to update lock status
                }, 1500);
            }
        } catch (err: any) {
            console.error('Failed to assign coach:', err);
            setError(err.response?.data?.error || 'Failed to assign coach. Please try again.');
            setIsAssigning(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="select-coach-page">
            {/* Header */}
            <div className="page-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="header-content"
                >
                    <div className="header-icon">
                        <Users className="icon" />
                    </div>
                    <h1 className="page-title">Select Your Professional Coach</h1>
                    <p className="page-subtitle">
                        Choose from our team of verified and approved mental health professionals
                    </p>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="content-container">
                {isLoading ? (
                    <div className="loading-state">
                        <Loader2 className="spinner" />
                        <h3>Loading Professional Coaches...</h3>
                        <p>Please wait while we fetch our approved specialists</p>
                    </div>
                ) : coaches.length === 0 ? (
                    <div className="empty-state">
                        <AlertTriangle className="empty-icon" />
                        <h3>No Approved Coaches Available</h3>
                        <p>Please contact support for assistance.</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                        >
                            <ArrowLeft className="icon-sm" />
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Coach Grid */}
                        <div className="coach-grid">
                            {coaches.map((coach, index) => {
                                const isSelected = selectedCoach === coach.coach_id;
                                
                                return (
                                    <motion.div
                                        key={coach.coach_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`coach-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedCoach(coach.coach_id)}
                                    >
                                        {isSelected && (
                                            <div className="selected-badge">
                                                <CheckCircle className="icon-sm" />
                                                <span>Selected</span>
                                            </div>
                                        )}

                                        <div className="coach-avatar">
                                            <div className={`avatar-circle ${isSelected ? 'active' : ''}`}>
                                                {getInitials(coach.full_name)}
                                            </div>
                                            {coach.is_approved && (
                                                <div className="verified-badge">
                                                    <Award className="icon-xs" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="coach-info">
                                            <h3 className="coach-name">{coach.full_name}</h3>
                                            
                                            {coach.specialization && (
                                                <div className="specialization">
                                                    <Shield className="icon-sm" />
                                                    <span>{coach.specialization}</span>
                                                </div>
                                            )}

                                            {coach.experience_years && (
                                                <div className="experience">
                                                    <Star className="icon-sm" />
                                                    <span>{coach.experience_years}+ years experience</span>
                                                </div>
                                            )}

                                            {coach.license_id && (
                                                <div className="license">
                                                    <Info className="icon-sm" />
                                                    <span className="license-id">{coach.license_id}</span>
                                                </div>
                                            )}

                                            {coach.bio && (
                                                <p className="coach-bio">{coach.bio}</p>
                                            )}

                                            <div className="approval-badge">
                                                <CheckCircle className="icon-xs" />
                                                <span>Verified & Approved</span>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="selection-indicator">
                                                <div className="pulse-ring"></div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="error-message"
                            >
                                <AlertTriangle className="icon-sm" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                onClick={handleAssignCoach}
                                disabled={!selectedCoach || isAssigning}
                                className={`btn-primary ${(!selectedCoach || isAssigning) ? 'disabled' : ''}`}
                            >
                                {isAssigning ? (
                                    <>
                                        <Loader2 className="icon-sm spinner" />
                                        <span>Assigning Coach...</span>
                                    </>
                                ) : (
                                    <>
                                        <Heart className="icon-sm" />
                                        <span>Confirm Selection & Continue</span>
                                        <CheckCircle className="icon-sm" />
                                    </>
                                )}
                            </button>

                            <div className="privacy-note">
                                <Shield className="icon-sm" />
                                <span>🔒 All sessions are confidential and HIPAA compliant</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SelectCoach;
