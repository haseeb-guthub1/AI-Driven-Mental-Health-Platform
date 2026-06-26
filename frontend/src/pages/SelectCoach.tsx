import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, Award, CheckCircle, Loader2, ArrowLeft, Heart, Info, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';
import { getCurrentUser } from '../services/authService';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
    experience_years?: number;
    bio?: string;
}

// ── Design helpers ──────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
    'linear-gradient(135deg,#6366F1,#4338CA)',
    'linear-gradient(135deg,#8B5CF6,#6D28D9)',
    'linear-gradient(135deg,#06B6D4,#0E7490)',
    'linear-gradient(135deg,#10B981,#047857)',
    'linear-gradient(135deg,#F59E0B,#B45309)',
    'linear-gradient(135deg,#F43F5E,#BE123C)',
    'linear-gradient(135deg,#0EA5E9,#0369A1)',
    'linear-gradient(135deg,#14B8A6,#0F766E)',
];

function avatarGradient(name: string): string {
    const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_PALETTES[code % AVATAR_PALETTES.length];
}

function specialtyColors(spec: string): { bg: string; color: string; border: string } {
    const s = (spec || '').toLowerCase();
    if (s.includes('anxiety') || s.includes('depression'))
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
    if (s.includes('stress') || s.includes('burnout') || s.includes('work'))
        return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
    if (s.includes('trauma') || s.includes('ptsd'))
        return { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' };
    if (s.includes('cbt') || s.includes('cognitive'))
        return { bg: '#F0FDFA', color: '#0F766E', border: '#99F6E4' };
    if (s.includes('mindful') || s.includes('wellness'))
        return { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
    return { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' };
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Component ───────────────────────────────────────────────────────────────

const SelectCoach: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const clientId = user?.client_id || user?.id;

    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => { fetchCoaches(); }, []);

    const fetchCoaches = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiService.getAvailableCoaches();
            setCoaches((res.data.coaches || []).filter((c: Coach) => c.is_approved));
        } catch {
            setError('Unable to load coaches. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedCoach || !clientId) { setError('Please select a coach to continue.'); return; }
        setIsAssigning(true);
        setError(null);
        try {
            const res = await apiService.assignCoachToClient(clientId, selectedCoach);
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => { navigate('/dashboard'); window.location.reload(); }, 1600);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to assign coach. Please try again.');
            setIsAssigning(false);
        }
    };

    return (
        <div style={P.page}>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={P.headerWrap}>
                <motion.div
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={P.header}
                >
                    <div style={P.headerLeft}>
                        <button onClick={() => navigate('/dashboard')} style={P.backBtn}>
                            <ArrowLeft size={16} color="#6B7280" />
                            Dashboard
                        </button>
                        <div style={P.headerIconWrap}>
                            <Users size={24} color="#4F46E5" />
                        </div>
                        <div>
                            <h1 style={P.pageTitle}>Select Your Coach</h1>
                            <p style={P.pageSubtitle}>Choose a verified mental health professional</p>
                        </div>
                    </div>
                    <div style={P.trustBadge}>
                        <Shield size={14} color="#059669" />
                        All coaches are licensed &amp; HIPAA compliant
                    </div>
                </motion.div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div style={P.body}>
                {isLoading ? (
                    <div style={P.centered}>
                        <Loader2 size={40} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={P.muted}>Loading available coaches…</p>
                    </div>
                ) : coaches.length === 0 ? (
                    <div style={P.centered}>
                        <AlertTriangle size={44} color="#F59E0B" />
                        <h3 style={P.emptyTitle}>No coaches available</h3>
                        <p style={P.muted}>Please contact support for assistance.</p>
                        <button onClick={() => navigate('/dashboard')} style={P.btnBack}>
                            <ArrowLeft size={15} /> Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={P.grid}>
                            {coaches.map((coach, idx) => {
                                const sel = selectedCoach === coach.coach_id;
                                const sc = coach.specialization ? specialtyColors(coach.specialization) : null;
                                const grad = avatarGradient(coach.full_name);
                                return (
                                    <motion.div
                                        key={coach.coach_id}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.06 }}
                                        onClick={() => setSelectedCoach(coach.coach_id)}
                                        style={sel ? P.cardSel : P.card}
                                    >
                                        {/* Selected badge */}
                                        {sel && (
                                            <motion.div
                                                initial={{ scale: 0.6, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                style={P.selBadge}
                                            >
                                                <CheckCircle size={13} strokeWidth={3} /> Selected
                                            </motion.div>
                                        )}

                                        {/* Avatar */}
                                        <div style={P.avatarWrap}>
                                            <div style={{ ...P.avatar, background: grad }}>
                                                {getInitials(coach.full_name)}
                                            </div>
                                            {coach.is_approved && (
                                                <div style={P.verifiedDot}>
                                                    <Award size={11} color="#fff" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <h3 style={P.coachName}>{coach.full_name}</h3>

                                        {sc && coach.specialization && (
                                            <span style={{
                                                ...P.specPill,
                                                background: sc.bg, color: sc.color,
                                                border: `1px solid ${sc.border}`,
                                            }}>
                                                {coach.specialization}
                                            </span>
                                        )}

                                        {coach.experience_years && (
                                            <div style={P.metaLine}>
                                                <Info size={12} color="#9CA3AF" />
                                                {coach.experience_years}+ years experience
                                            </div>
                                        )}

                                        {coach.bio && (
                                            <p style={P.bio}>{coach.bio}</p>
                                        )}

                                        <div style={P.cardFooter}>
                                            {coach.is_approved && (
                                                <span style={P.verifiedLabel}>
                                                    <CheckCircle size={12} color="#059669" strokeWidth={3} />
                                                    Verified &amp; Approved
                                                </span>
                                            )}
                                            {coach.license_id && (
                                                <span style={P.licenseLabel}>{coach.license_id}</span>
                                            )}
                                        </div>

                                        {/* Radio indicator */}
                                        <div style={P.radioWrap}>
                                            <div style={sel ? P.radioOn : P.radioOff} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Sticky CTA bar */}
                        <div style={P.ctaBar}>
                            {error && (
                                <div style={P.errorBox}>
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}

                            {success ? (
                                <div style={P.successBox}>
                                    <CheckCircle size={18} color="#059669" strokeWidth={3} />
                                    Coach assigned! Redirecting…
                                </div>
                            ) : (
                                <button
                                    onClick={handleAssign}
                                    disabled={!selectedCoach || isAssigning}
                                    style={!selectedCoach || isAssigning ? P.btnOff : P.btnOn}
                                >
                                    {isAssigning ? (
                                        <span style={P.btnInner}>
                                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                            Assigning coach…
                                        </span>
                                    ) : (
                                        <span style={P.btnInner}>
                                            <Heart size={16} />
                                            Confirm selection &amp; continue
                                            <CheckCircle size={16} />
                                        </span>
                                    )}
                                </button>
                            )}

                            <div style={P.privacy}>
                                <Shield size={13} color="#059669" />
                                All sessions are fully confidential and HIPAA compliant
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// ── Style tokens ─────────────────────────────────────────────────────────────

const P: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh', background: '#F5F7FF',
        fontFamily: 'system-ui,-apple-system,sans-serif',
    },

    // Header
    headerWrap: {
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    header: {
        maxWidth: 1200, margin: '0 auto',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 13, fontWeight: 600, color: '#6B7280',
        background: 'none', border: '1px solid #E5E7EB',
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
    },
    headerIconWrap: {
        width: 44, height: 44, borderRadius: 12, background: '#EEF2FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    pageTitle: { fontSize: 18, fontWeight: 800, color: '#1E1B4B', margin: 0 },
    pageSubtitle: { fontSize: 12, color: '#6B7280', margin: '2px 0 0' },
    trustBadge: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: '#059669',
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 20, padding: '6px 14px',
    },

    // Body
    body: { maxWidth: 1200, margin: '0 auto', padding: '32px 32px 160px' },
    centered: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, minHeight: 360, textAlign: 'center',
    },
    emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1E1B4B', margin: 0 },
    muted: { fontSize: 14, color: '#6B7280', margin: 0 },
    btnBack: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600, color: '#4F46E5',
        background: '#EEF2FF', border: '1.5px solid #C7D2FE',
        borderRadius: 10, padding: '10px 20px', cursor: 'pointer', marginTop: 8,
    },

    // Grid
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
        gap: 16, marginBottom: 32,
    },

    // Cards
    card: {
        position: 'relative',
        background: '#fff', border: '1.5px solid #E5E7EB',
        borderRadius: 16, padding: '24px 24px 20px',
        cursor: 'pointer', textAlign: 'center',
        transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        overflow: 'hidden',
    },
    cardSel: {
        position: 'relative',
        background: '#EEF2FF', border: '2px solid #4F46E5',
        borderRadius: 16, padding: '24px 24px 20px',
        cursor: 'pointer', textAlign: 'center',
        boxShadow: '0 0 0 4px rgba(79,70,229,0.12)',
        overflow: 'hidden',
    },
    selBadge: {
        position: 'absolute', top: 14, right: 14,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
        color: '#fff', fontSize: 11, fontWeight: 700,
        borderRadius: 20, padding: '4px 10px',
        boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
    },
    avatarWrap: {
        position: 'relative', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 72, height: 72, borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800, color: '#fff',
        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    },
    verifiedDot: {
        position: 'absolute', bottom: -2, right: -2,
        width: 22, height: 22, borderRadius: '50%',
        background: '#059669',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2.5px solid #fff',
        boxShadow: '0 2px 6px rgba(5,150,105,0.4)',
    },
    coachName: { fontSize: 17, fontWeight: 800, color: '#1E1B4B', margin: '0 0 10px' },
    specPill: {
        display: 'inline-block', fontSize: 11, fontWeight: 600,
        borderRadius: 20, padding: '4px 12px', marginBottom: 12,
    },
    metaLine: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        fontSize: 12, color: '#9CA3AF', marginBottom: 8,
    },
    bio: {
        fontSize: 12, color: '#6B7280', lineHeight: 1.5,
        maxHeight: 54, overflow: 'hidden', margin: '0 0 12px',
        textAlign: 'left',
    },
    cardFooter: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, flexWrap: 'wrap' as const, marginTop: 10, paddingTop: 10,
        borderTop: '1px solid #F3F4F6',
    },
    verifiedLabel: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: '#059669', fontWeight: 600,
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 20, padding: '2px 8px',
    },
    licenseLabel: {
        fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF',
        background: '#F9FAFB', border: '1px solid #E5E7EB',
        borderRadius: 6, padding: '2px 7px',
    },
    radioWrap: { display: 'flex', justifyContent: 'center', marginTop: 12 },
    radioOff: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #D1D5DB', background: '#fff' },
    radioOn: { width: 20, height: 20, borderRadius: '50%', border: '6px solid #4F46E5', background: '#fff' },

    // Sticky CTA bar
    ctaBar: {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #E5E7EB',
        padding: '16px 32px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        zIndex: 100,
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 13, color: '#DC2626', background: '#FEF2F2',
        border: '1px solid #FECACA', borderRadius: 8, padding: '8px 16px',
    },
    successBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 15, fontWeight: 700, color: '#059669',
    },
    btnOn: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 40px', borderRadius: 12,
        background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
        color: '#fff', fontSize: 15, fontWeight: 700,
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
        minWidth: 320,
    },
    btnOff: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 40px', borderRadius: 12,
        background: '#E5E7EB', color: '#9CA3AF',
        fontSize: 15, fontWeight: 600, border: 'none', cursor: 'not-allowed',
        minWidth: 320,
    },
    btnInner: { display: 'flex', alignItems: 'center', gap: 8 },
    privacy: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, color: '#9CA3AF',
    },
};

export default SelectCoach;
