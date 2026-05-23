import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { getCurrentUser } from '../services/authService';
import HighRiskNotification from '../components/HighRiskNotification';
import { Loader2 } from 'lucide-react';

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
            console.warn('[LOCK CHECK] No client_id found - skipping lock check');
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
            console.error('[LOCK CHECK] Error details:', err.response?.data || err.message);
            console.warn('[LOCK CHECK] Allowing access due to API error (fail open)');
        } finally {
            setIsCheckingLock(false);
        }
    };

    const handleCoachAssigned = async () => {
        // Recheck lock status after coach assignment
        await checkLockStatus();
        
        // Refresh the page
        window.location.reload();
    };

    // Show loading state while checking
    if (isCheckingLock) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Render children wrapped with conditional notification overlay
    const user = getCurrentUser();
    const clientId = user?.client_id || user?.id;
    
    // Show notification if risk > 60% AND no coach assigned
    const shouldShowNotification = lockStatus && 
                                    lockStatus.current_risk_score > 60 && 
                                    !lockStatus.has_coach &&
                                    clientId;
    
    console.log('[WRAPPER RENDER] Should show notification?', shouldShowNotification);
    console.log('[WRAPPER RENDER] Lock status:', lockStatus);
    console.log('[WRAPPER RENDER] Risk score:', lockStatus?.current_risk_score);
    console.log('[WRAPPER RENDER] Has coach:', lockStatus?.has_coach);
    
    return (
        <div className="relative">
            {/* Render the dashboard children */}
            <div className={shouldShowNotification ? 'filter blur-sm pointer-events-none' : ''}>
                {children}
            </div>

            {/* Show high-risk notification if conditions met */}
            {shouldShowNotification && (
                <HighRiskNotification
                    riskScore={lockStatus.current_risk_score}
                    clientId={clientId}
                />
            )}
        </div>
    );
};

export default ProtectedDashboardWrapper;
