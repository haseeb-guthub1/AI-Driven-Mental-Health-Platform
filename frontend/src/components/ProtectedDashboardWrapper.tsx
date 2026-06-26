import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { getCurrentUser } from '../services/authService';
import ProfessionalCoachBooking from '../components/ProfessionalCoachBooking';
import { Loader2, AlertCircle, Calendar, Heart } from 'lucide-react';

interface LockStatus {
    is_locked: boolean;
    reason: string;
    has_coach: boolean;
    coach_id: number | null;
    current_risk_score: number;
    threshold: number;
    historical_data?: {
        average_score: number;
        trend: string;
        sessions: any[];
        high_risk_count: number;
    };
    conditions_met?: {
        high_risk_now: boolean;
        historical_high_risk: boolean;
    };
}

interface ProtectedDashboardWrapperProps {
    children: React.ReactNode;
}

const ProtectedDashboardWrapper: React.FC<ProtectedDashboardWrapperProps> = ({ children }) => {
    const navigate = useNavigate();
    const [isCheckingLock, setIsCheckingLock] = useState(true);
    const [lockStatus, setLockStatus] = useState<LockStatus | null>(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        // Only run once on mount
        if (hasChecked) return;
        
        const user = getCurrentUser();
        
        console.log('[WRAPPER] User object:', user);
        console.log('[WRAPPER] Client ID:', user?.client_id);
        console.log('[WRAPPER] User ID:', user?.id);
        console.log('[WRAPPER] User Role:', user?.role);
        
        if (!user) {
            navigate('/');
            return;
        }

        // Only check lock status for clients
        if (user.role?.toLowerCase() === 'client') {
            console.log('[WRAPPER] User is client - checking lock status');
            checkLockStatus();
        } else {
            console.log('[WRAPPER] User is not client - bypassing lock check');
            // Coaches and admins bypass lock check
            setIsCheckingLock(false);
        }
        
        setHasChecked(true);
    }, [hasChecked, navigate]);

    const checkLockStatus = async () => {
        const user = getCurrentUser();
        
        // Try to get client_id from user object (could be client_id or id)
        const clientId = user?.client_id || user?.id;
        
        console.log('[LOCK CHECK] Starting check...');
        console.log('[LOCK CHECK] Client ID from user:', clientId);
        console.log('[LOCK CHECK] Full user object:', JSON.stringify(user));
        
        if (!clientId) {
            console.warn('[LOCK CHECK] No client_id — skipping lock check');
            setIsCheckingLock(false);
            return;
        }

        try {
            console.log(`[LOCK CHECK] Calling API with client_id=${clientId}`);
            const response = await apiService.checkMandatoryLock(clientId);
            const status = response.data as LockStatus;

            setLockStatus(status);

            console.log('[LOCK CHECK] API Response:', {
                is_locked: status.is_locked,
                reason: status.reason,
                current_risk: status.current_risk_score,
                threshold: status.threshold,
                has_coach: status.has_coach
            });

        } catch (err: any) {
            console.error('[LOCK CHECK] Failed to check lock status:', err);
            setLockStatus(null);
        } finally {
            setIsCheckingLock(false);
        }
    };

    const handleCoachAssigned = async () => {
        setShowBookingModal(false);
        // Recheck lock status after coach assignment
        await checkLockStatus();
    };

    // Show loading state while checking
    if (isCheckingLock) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFB' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 style={{ width: 40, height: 40, color: '#4F46E5', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ color: '#6B7280', fontSize: '1rem' }}>Loading dashboard...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Render children with professional notification banner for high-risk users
    const user = getCurrentUser();
    const clientId = user?.client_id || user?.id;
    
    // Show the booking banner when:
    //  - we have a status response (real or fallback)
    //  - risk score >= 30 (moderate+) OR dashboard is locked
    //  - clientId is known (use != null so numeric 0 still passes)
    // NOTE: We intentionally do NOT check has_coach — even users with a coach
    // assigned should be prompted to book an appointment when distress is elevated.
    const riskScore = lockStatus?.current_risk_score ?? 0;
    const shouldShowNotification = lockStatus !== null &&
                                   (riskScore >= 40 || lockStatus.is_locked) &&
                                   clientId != null;

    console.log('[WRAPPER RENDER] Should show coach notification?', shouldShowNotification);
    console.log('[WRAPPER RENDER] Risk score:', lockStatus?.current_risk_score);
    console.log('[WRAPPER RENDER] Has coach:', lockStatus?.has_coach);
    
    return (
        <div style={{ position: 'relative' }}>
            {/* Professional notification banner for high-risk users */}
            {shouldShowNotification && !showBookingModal && (
                <div style={{ position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 9998, padding: '0 16px' }} className="animate-slideDown">
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 50%, #FEF3C7 100%)',
                            border: '2px solid #F59E0B',
                            borderRadius: '14px',
                            boxShadow: '0 8px 28px rgba(245,158,11,0.18), 0 2px 6px rgba(0,0,0,0.06)',
                            padding: '14px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                        }}>
                            {/* Icon */}
                            <div style={{
                                flexShrink: 0,
                                width: '44px', height: '44px',
                                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                borderRadius: '11px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Heart style={{ width: '22px', height: '22px', color: 'white', fill: 'white' }} />
                            </div>

                            {/* Text content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                    <AlertCircle style={{ width: '15px', height: '15px', color: '#D97706', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400E', whiteSpace: 'nowrap' }}>
                                        Professional Support Recommended
                                    </span>
                                    <span style={{
                                        background: '#FEF3C7', color: '#B45309',
                                        border: '1.5px solid #F59E0B',
                                        borderRadius: '8px', padding: '1px 9px',
                                        fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                                    }}>
                                        Risk: {riskScore.toFixed(0)}%
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#92400E', margin: 0, opacity: 0.85, lineHeight: 1.4 }}>
                                    Our AI detected elevated distress patterns. A licensed professional can provide personalised support.
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '9px 18px',
                                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                                        color: 'white', fontWeight: 700,
                                        borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        fontSize: '0.83rem',
                                        boxShadow: '0 4px 14px rgba(124,58,237,0.38)',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Calendar style={{ width: '15px', height: '15px' }} />
                                    Book Appointment
                                </button>
                                <button
                                    onClick={() => {
                                        const dismissedKey = `coach_notification_dismissed_${clientId}`;
                                        sessionStorage.setItem(dismissedKey, 'true');
                                        setLockStatus(null);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        padding: '9px 14px',
                                        background: 'rgba(255,255,255,0.75)',
                                        color: '#6B7280', fontWeight: 600,
                                        borderRadius: '10px', border: '1.5px solid #9CA3AF',
                                        cursor: 'pointer', fontSize: '0.83rem',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Render dashboard children */}
            {children}

            {/* Professional booking modal */}
            {showBookingModal && clientId != null && (
                <ProfessionalCoachBooking
                    clientId={clientId}
                    riskScore={riskScore}
                    onClose={() => setShowBookingModal(false)}
                    onAppointmentBooked={handleCoachAssigned}
                />
            )}

            <style>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ProtectedDashboardWrapper;
