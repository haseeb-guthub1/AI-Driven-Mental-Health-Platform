import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, TrendingUp, Activity, CheckCircle, Loader2, Award, Shield, Star, Lock, ArrowRight, Info } from 'lucide-react';
import { apiService } from '../services/api';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
}

interface MandatoryCoachHireModalProps {
    clientId: number;
    lockStatus: {
        is_locked: boolean;
        reason: string;
        current_risk_score: number;
        threshold: number;
        historical_data?: {
            average_score: number;
            trend: string;
            sessions: any[];
        };
        conditions_met?: {
            high_risk_now: boolean;
            historical_high_risk: boolean;
        };
    };
    onCoachAssigned: () => void;
}

const MandatoryCoachHireModal: React.FC<MandatoryCoachHireModalProps> = ({
    clientId,
    lockStatus,
    onCoachAssigned
}) => {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAvailableCoaches();
        // Prevent scrolling on the body
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const fetchAvailableCoaches = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getAvailableCoaches();
            setCoaches(response.data.coaches || []);
        } catch (err: any) {
            console.error('Failed to fetch coaches:', err);
            setError('Unable to load available coaches. Please contact support.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignCoach = async () => {
        if (!selectedCoach) {
            setError('Please select a coach to continue.');
            return;
        }

        setIsAssigning(true);
        setError(null);

        try {
            const response = await apiService.assignCoachToClient(clientId, selectedCoach);
            
            if (response.data.success) {
                setTimeout(() => {
                    onCoachAssigned();
                }, 1500);
            }
        } catch (err: any) {
            console.error('Failed to assign coach:', err);
            setError(err.response?.data?.error || 'Failed to assign coach. Please try again.');
            setIsAssigning(false);
        }
    };

    const getRiskLevelColor = (score: number) => {
        if (score >= 75) return 'from-red-600 to-red-700';
        if (score >= 65) return 'from-orange-600 to-orange-700';
        if (score >= 50) return 'from-yellow-600 to-yellow-700';
        return 'from-green-600 to-green-700';
    };

    const getRiskLevelText = (score: number) => {
        if (score >= 75) return 'Critical Risk';
        if (score >= 65) return 'High Risk';
        if (score >= 50) return 'Moderate Risk';
        return 'Low Risk';
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header Section */}
                <div className="text-center mb-10">
                    {/* Lock Icon with Glow Effect */}
                    <div className="inline-flex mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-6 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                <Lock className="w-14 h-14 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
                        Professional Support Required
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Your wellness assessment indicates the need for professional guidance. 
                        Select a licensed mental health coach to continue your journey.
                    </p>
                </div>

                {/* Risk Assessment Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Current Assessment Card */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Risk</span>
                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                            </div>
                            <div className={`text-5xl font-black mb-2 bg-gradient-to-r ${getRiskLevelColor(lockStatus.current_risk_score)} bg-clip-text text-transparent`}>
                                {lockStatus.current_risk_score.toFixed(0)}%
                            </div>
                            <div className="text-red-400 font-bold text-sm uppercase tracking-wide">{getRiskLevelText(lockStatus.current_risk_score)}</div>
                            <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-gradient-to-r ${getRiskLevelColor(lockStatus.current_risk_score)} transition-all duration-1000 ease-out rounded-full`}
                                    style={{ width: `${lockStatus.current_risk_score}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* 90-Day Average Card */}
                    {lockStatus.historical_data && (
                        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">90-Day Trend</span>
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-orange-400" />
                                    </div>
                                </div>
                                <div className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                                    {lockStatus.historical_data.average_score.toFixed(0)}%
                                </div>
                                <div className="text-orange-400 font-bold text-sm uppercase tracking-wide capitalize">{lockStatus.historical_data.trend}</div>
                                <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000 ease-out rounded-full"
                                        style={{ width: `${lockStatus.historical_data.average_score}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Status Card */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Account Status</span>
                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-red-400" />
                                </div>
                            </div>
                            <div className="text-5xl font-black mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                                LOCKED
                            </div>
                            <div className="text-red-400 font-bold text-sm uppercase tracking-wide">Action Required</div>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 mr-2 text-red-400" />
                                    <span>High-risk detected</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 mr-2 text-red-400" />
                                    <span>Coach assignment required</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coach Selection Section */}
                <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-700/50 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                                    <Shield className="w-8 h-8 mr-3 text-indigo-400" />
                                    Select Your Professional Coach
                                </h2>
                                <p className="text-slate-400 text-lg">Choose a licensed mental health specialist to unlock your dashboard</p>
                            </div>
                            {coaches.length > 0 && (
                                <div className="hidden lg:flex items-center gap-3 bg-indigo-500/20 px-5 py-3 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                                    <Star className="w-5 h-5 text-indigo-400" />
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{coaches.length}</div>
                                        <div className="text-xs text-indigo-300 uppercase tracking-wide">Available</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coach Grid */}
                    <div className="p-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                                <Loader2 className="w-20 h-20 text-indigo-500 animate-spin" />
                                <div className="text-center">
                                    <p className="text-xl font-semibold text-white mb-2">Loading Professional Coaches</p>
                                    <p className="text-slate-400">Please wait while we fetch available specialists...</p>
                                </div>
                            </div>
                        ) : coaches.length === 0 ? (
                            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-12 text-center">
                                <AlertTriangle className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-yellow-200 mb-3">No Coaches Available</h3>
                                <p className="text-yellow-300/80 text-lg">Please contact support for immediate assistance with your account.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                                {coaches.map((coach) => {
                                    const isSelected = selectedCoach === coach.coach_id;
                                    return (
                                        <button
                                            key={coach.coach_id}
                                            onClick={() => setSelectedCoach(coach.coach_id)}
                                            className={`group relative text-left p-6 rounded-2xl transition-all duration-300 ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/30 scale-[1.02]'
                                                    : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:scale-[1.01] hover:shadow-xl'
                                            }`}
                                        >
                                            {/* Glow Effect */}
                                            {isSelected && (
                                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                                            )}

                                            <div className="relative flex items-start gap-5">
                                                {/* Avatar */}
                                                <div className={`relative flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg transition-all duration-300 ${
                                                    isSelected 
                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/50 scale-110' 
                                                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white'
                                                }`}>
                                                    {getInitials(coach.full_name)}
                                                    {isSelected && (
                                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce">
                                                            <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Coach Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <h3 className={`font-bold text-2xl leading-tight transition-colors ${
                                                            isSelected ? 'text-white' : 'text-white group-hover:text-indigo-300'
                                                        }`}>
                                                            {coach.full_name}
                                                        </h3>
                                                        {coach.is_approved && (
                                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-full text-xs font-bold text-green-400 border border-green-500/40 shadow-lg backdrop-blur-sm">
                                                                <Award className="w-4 h-4" />
                                                                <span>VERIFIED</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {coach.specialization && (
                                                        <div className="flex items-start gap-2.5 mb-4">
                                                            <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                            <p className="text-base text-slate-300 leading-relaxed font-medium">
                                                                {coach.specialization}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {coach.license_id && (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                                                            <Info className="w-4 h-4 text-slate-400" />
                                                            <span className="text-sm text-slate-300 font-mono font-semibold">{coach.license_id}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-900/30 border-2 border-red-500/50 rounded-xl p-5 flex items-start gap-4 backdrop-blur-sm">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-red-300 font-bold text-lg mb-1">Error</h4>
                                    <p className="text-red-200">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="space-y-6">
                            <button
                                onClick={handleAssignCoach}
                                disabled={!selectedCoach || isAssigning}
                                className={`group relative w-full overflow-hidden py-6 px-10 rounded-2xl font-bold text-xl transition-all duration-300 ${
                                    !selectedCoach || isAssigning
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-purple-600 hover:to-indigo-600 text-white shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-[1.02]'
                                }`}
                            >
                                {/* Shine Effect */}
                                {!isAssigning && selectedCoach && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                )}
                                
                                <span className="relative flex items-center justify-center gap-4">
                                    {isAssigning ? (
                                        <>
                                            <Loader2 className="w-7 h-7 animate-spin" />
                                            <span>Establishing Connection...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-7 h-7" />
                                            <span>Confirm Selection & Unlock Dashboard</span>
                                            <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* Privacy Notice */}
                            <div className="flex items-center justify-center gap-3 text-slate-400 bg-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/30">
                                <Shield className="w-5 h-5 text-indigo-400" />
                                <span className="text-base font-medium">🔒 100% Confidential • HIPAA Compliant • End-to-End Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-base">
                        This safety measure ensures you receive appropriate professional support based on your wellness assessment.
                        <br />
                        <span className="text-slate-600 text-sm">All data is handled in accordance with healthcare privacy regulations.</span>
                    </p>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default MandatoryCoachHireModal;
