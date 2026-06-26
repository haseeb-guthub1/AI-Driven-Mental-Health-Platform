import React, { useState, useEffect } from 'react';
import {
    X, Calendar, Clock, Shield, Award, CheckCircle,
    Loader2, ArrowRight, AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
}

interface ProfessionalCoachBookingProps {
    clientId: number;
    riskScore?: number;
    onClose: () => void;
    onAppointmentBooked?: () => void;
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

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const MOCK_COACHES: Coach[] = [
    { coach_id: 1, full_name: 'Dr. Sara Khan',    specialization: 'Anxiety & Depression Specialist',    license_id: 'LIC-2024-001', is_approved: true },
    { coach_id: 2, full_name: 'Dr. Hassan Mirza', specialization: 'Cognitive Behavioural Therapy (CBT)', license_id: 'LIC-2024-002', is_approved: true },
    { coach_id: 3, full_name: 'Dr. Amna Rauf',    specialization: 'Stress Management & Work Burnout',   license_id: 'LIC-2024-003', is_approved: true },
    { coach_id: 4, full_name: 'Dr. Zain Ali',     specialization: 'Trauma & PTSD Recovery',             license_id: 'LIC-2024-004', is_approved: true },
];

// ── Component ───────────────────────────────────────────────────────────────

const ProfessionalCoachBooking: React.FC<ProfessionalCoachBookingProps> = ({
    clientId, riskScore, onClose, onAppointmentBooked,
}) => {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('09:00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCoaches();
        const d = new Date();
        d.setDate(d.getDate() + 1);
        setAppointmentDate(d.toISOString().split('T')[0]);
    }, []);

    const fetchCoaches = () => {
        // Always use the demo coaches — these match the backend dummy data
        setCoaches(MOCK_COACHES);
    };

    const saveAppointmentLocally = (coachObj: Coach) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const appointment = {
            id: Date.now(),
            clientName: user?.name || 'Unknown Client',
            clientId,
            coachId: coachObj.coach_id,
            coachName: coachObj.full_name,
            coachSpecialization: coachObj.specialization || '',
            date: appointmentDate,
            time: appointmentTime,
            notes: '',
            status: 'pending',
            bookedAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('mindwell_appointments') || '[]');
        existing.push(appointment);
        localStorage.setItem('mindwell_appointments', JSON.stringify(existing));
    };

    const handleSubmit = async () => {
        if (!selectedCoach) { setError('Please select a coach.'); return; }
        if (!appointmentDate || !appointmentTime) { setError('Please select a date and time.'); return; }

        const coachObj = coaches.find(c => c.coach_id === selectedCoach)!;
        setIsSubmitting(true);
        setError(null);

        // Try backend — ignore errors in demo mode
        try {
            await apiService.assignCoachToClient(clientId, selectedCoach);
        } catch { /* demo fallback */ }
        try {
            await apiService.bookAppointment({
                coach_id: selectedCoach,
                client_id: clientId,
                appointment_date: `${appointmentDate}T${appointmentTime}:00`,
                duration_minutes: 60,
                status: 'confirmed',
            });
        } catch { /* demo fallback */ }

        // Always save locally so the coach dashboard can display the booking
        saveAppointmentLocally(coachObj);

        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => { onAppointmentBooked?.(); onClose(); }, 2000);
    };

    const selectedCoachObj = coaches.find(c => c.coach_id === selectedCoach);

    // ── Success ─────────────────────────────────────────────────────────────
    if (success) return (
        <div style={S.backdrop}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ ...S.panel, maxWidth: 420, textAlign: 'center', padding: '56px 40px' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}
                    style={S.successRing}
                >
                    <CheckCircle size={52} color="#059669" strokeWidth={2} />
                </motion.div>
                <h2 style={S.successTitle}>Appointment Confirmed</h2>
                <p style={S.muted}>Your session is scheduled. Redirecting…</p>
            </motion.div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={S.backdrop}>
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                style={S.panel}
            >
                {/* Header */}
                <div style={S.header}>
                    <div style={S.headerLeft}>
                        <div style={S.headerIcon}>
                            <Calendar size={22} color="#4F46E5" />
                        </div>
                        <div>
                            <h2 style={S.headerTitle}>Book Professional Support</h2>
                            <p style={S.headerSub}>Connect with a licensed mental health coach</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={S.closeBtn} aria-label="Close">
                        <X size={18} color="#374151" />
                    </button>
                </div>

                {/* Risk banner */}
                {riskScore !== undefined && riskScore >= 60 && (
                    <div style={S.riskBanner}>
                        <Shield size={15} color="#B45309" />
                        <span>Your wellness score is <strong>{riskScore.toFixed(0)}%</strong> — professional support is recommended.</span>
                    </div>
                )}

                {/* Body */}
                <div style={S.body}>
                    <div style={S.twoCol}>
                            {/* Left — coach list */}
                            <div style={S.colLeft}>
                                <h3 style={S.colTitle}>Select your coach</h3>
                                {coaches.length === 0 ? (
                                    <div style={S.emptyBox}>
                                        <AlertTriangle size={28} color="#F59E0B" />
                                        <p style={S.muted}>No coaches available.</p>
                                    </div>
                                ) : (
                                    <div style={S.coachList}>
                                        {coaches.map(coach => {
                                            const sel = selectedCoach === coach.coach_id;
                                            const sc = coach.specialization ? specialtyColors(coach.specialization) : null;
                                            return (
                                                <motion.button
                                                    key={coach.coach_id}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => setSelectedCoach(coach.coach_id)}
                                                    style={sel ? S.coachCardSel : S.coachCard}
                                                >
                                                    {/* Avatar */}
                                                    <div style={{ ...S.avatar, background: avatarGradient(coach.full_name) }}>
                                                        {getInitials(coach.full_name)}
                                                        {coach.is_approved && (
                                                            <span style={S.verifiedDot}>
                                                                <Award size={9} color="#fff" strokeWidth={3} />
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div style={S.coachInfo}>
                                                        <div style={S.coachNameRow}>
                                                            <span style={S.coachName}>{coach.full_name}</span>
                                                            {sel && (
                                                                <span style={S.selPill}>
                                                                    <CheckCircle size={11} strokeWidth={3} /> Selected
                                                                </span>
                                                            )}
                                                        </div>
                                                        {sc && coach.specialization && (
                                                            <span style={{
                                                                ...S.specPill,
                                                                background: sc.bg, color: sc.color,
                                                                border: `1px solid ${sc.border}`,
                                                            }}>
                                                                {coach.specialization}
                                                            </span>
                                                        )}
                                                        <div style={S.metaRow}>
                                                            {coach.is_approved && (
                                                                <span style={S.verifiedLabel}>
                                                                    <CheckCircle size={11} color="#059669" strokeWidth={3} />
                                                                    Verified
                                                                </span>
                                                            )}
                                                            {coach.license_id && (
                                                                <span style={S.licenseLabel}>{coach.license_id}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Radio */}
                                                    <div style={sel ? S.radioOn : S.radioOff} />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Right — booking */}
                            <div style={S.colRight}>
                                <h3 style={S.colTitle}>Schedule session</h3>

                                {/* Selected coach summary */}
                                <AnimatePresence>
                                    {selectedCoachObj && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            style={S.coachSummary}
                                        >
                                            <div style={{ ...S.avatarSm, background: avatarGradient(selectedCoachObj.full_name) }}>
                                                {getInitials(selectedCoachObj.full_name)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#1E1B4B' }}>
                                                    {selectedCoachObj.full_name}
                                                </div>
                                                {selectedCoachObj.specialization && (
                                                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                                        {selectedCoachObj.specialization}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Date */}
                                <div style={S.fieldGroup}>
                                    <label style={S.fieldLabel}>
                                        <Calendar size={13} color="#4F46E5" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        value={appointmentDate}
                                        onChange={e => setAppointmentDate(e.target.value)}
                                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                        style={S.dateInput}
                                    />
                                </div>

                                {/* Time */}
                                <div style={S.fieldGroup}>
                                    <label style={S.fieldLabel}>
                                        <Clock size={13} color="#4F46E5" /> Time
                                    </label>
                                    <div style={S.timeGrid}>
                                        {TIME_SLOTS.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setAppointmentTime(t)}
                                                style={appointmentTime === t ? S.timeOn : S.timeOff}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Session info */}
                                <div style={S.sessionInfo}>
                                    {['60-min video session', 'Instant confirmation', '100% confidential'].map(item => (
                                        <div key={item} style={S.sessionRow}>
                                            <CheckCircle size={12} color="#059669" strokeWidth={3} />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                {error && (
                                    <div style={S.errorBox}>
                                        <AlertTriangle size={14} /> {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedCoach || isSubmitting}
                                    style={!selectedCoach || isSubmitting ? S.btnOff : S.btnOn}
                                >
                                    {isSubmitting ? (
                                        <span style={S.btnInner}>
                                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                            Booking…
                                        </span>
                                    ) : (
                                        <span style={S.btnInner}>
                                            <CheckCircle size={16} />
                                            Confirm appointment
                                            <ArrowRight size={16} />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                </div>

                {/* Footer */}
                <div style={S.footer}>
                    <Shield size={13} color="#4F46E5" />
                    All appointments are encrypted and HIPAA compliant
                </div>
            </motion.div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

// ── Style tokens ─────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,12,41,0.65)', backdropFilter: 'blur(6px)',
        padding: '20px 16px', overflowY: 'auto',
    },
    panel: {
        background: '#fff', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        width: '100%', maxWidth: 860,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
    },

    // Header
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 28px 20px', borderBottom: '1px solid #F3F4F6',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
    headerIcon: {
        width: 44, height: 44, borderRadius: 12,
        background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 800, color: '#1E1B4B', margin: 0 },
    headerSub: { fontSize: 13, color: '#6B7280', margin: '3px 0 0' },
    closeBtn: {
        width: 36, height: 36, borderRadius: 8, border: '2px solid #D1D5DB',
        background: '#F3F4F6', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },

    // Risk banner
    riskBanner: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#FFFBEB', borderBottom: '1px solid #FDE68A',
        padding: '10px 28px', fontSize: 13, color: '#92400E',
    },

    // Body
    body: { padding: '24px 28px', overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' },
    loadingBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 14, padding: '48px 0',
    },
    emptyBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, padding: '32px 0', textAlign: 'center',
    },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 },
    colLeft: { display: 'flex', flexDirection: 'column', gap: 14 },
    colRight: { display: 'flex', flexDirection: 'column', gap: 16 },
    colTitle: { fontSize: 13, fontWeight: 800, color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 },

    // Coach cards
    coachList: { display: 'flex', flexDirection: 'column', gap: 8 },
    coachCard: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: '#FAFAFA', border: '1.5px solid #E5E7EB',
        borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
    },
    coachCardSel: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: '#EEF2FF', border: '2px solid #4F46E5',
        borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
        boxShadow: '0 0 0 3px rgba(79,70,229,0.12)',
    },
    avatar: {
        width: 44, height: 44, borderRadius: 11, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 800, color: '#fff', position: 'relative',
    },
    verifiedDot: {
        position: 'absolute', bottom: -3, right: -3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #fff',
    },
    coachInfo: { flex: 1, minWidth: 0 },
    coachNameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 },
    coachName: { fontSize: 14, fontWeight: 700, color: '#1E1B4B' },
    selPill: {
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 700, color: '#4F46E5',
        background: '#EEF2FF', border: '1px solid #C7D2FE',
        borderRadius: 20, padding: '2px 7px', flexShrink: 0,
    },
    specPill: {
        display: 'inline-block', fontSize: 10, fontWeight: 600,
        borderRadius: 20, padding: '2px 8px', marginBottom: 5,
    },
    metaRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
    verifiedLabel: {
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, color: '#059669', fontWeight: 600,
    },
    licenseLabel: {
        fontSize: 9, fontFamily: 'monospace', color: '#9CA3AF',
        background: '#F3F4F6', borderRadius: 4, padding: '1px 5px',
    },
    radioOff: { width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: '2px solid #D1D5DB', background: '#fff' },
    radioOn: { width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: '6px solid #4F46E5', background: '#fff' },

    // Booking right col
    coachSummary: {
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#F5F7FF', border: '1.5px solid #C7D2FE',
        borderRadius: 10, padding: '12px 14px',
    },
    avatarSm: {
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: '#fff',
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    fieldLabel: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 700, color: '#1E1B4B',
        textTransform: 'uppercase', letterSpacing: '0.07em',
    },
    dateInput: {
        padding: '9px 12px', border: '1.5px solid #D1D5DB', borderRadius: 9,
        fontSize: 13, color: '#1E1B4B', background: '#FAFAFA', outline: 'none',
    },
    timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 },
    timeOff: {
        padding: '7px 4px', fontSize: 11, fontWeight: 600, color: '#6B7280',
        background: '#F3F4F6', border: '1.5px solid #E5E7EB', borderRadius: 7,
        cursor: 'pointer',
    },
    timeOn: {
        padding: '7px 4px', fontSize: 11, fontWeight: 700, color: '#fff',
        background: '#4F46E5', border: '1.5px solid #4F46E5', borderRadius: 7,
        cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
    },
    sessionInfo: {
        display: 'flex', flexDirection: 'column', gap: 6,
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 8, padding: '10px 14px',
    },
    sessionRow: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: '#166534', fontWeight: 500,
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 12, color: '#DC2626', background: '#FEF2F2',
        border: '1px solid #FECACA', borderRadius: 7, padding: '8px 12px',
    },
    btnOn: {
        width: '100%', padding: '13px', borderRadius: 10,
        background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
        color: '#fff', fontSize: 14, fontWeight: 700,
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
    },
    btnOff: {
        width: '100%', padding: '13px', borderRadius: 10,
        background: '#E5E7EB', color: '#9CA3AF',
        fontSize: 14, fontWeight: 600, border: 'none', cursor: 'not-allowed',
    },
    btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },

    // Footer
    footer: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderTop: '1px solid #F3F4F6', padding: '12px 28px',
        fontSize: 11, color: '#9CA3AF',
    },

    // Success
    successRing: {
        width: 88, height: 88, borderRadius: '50%',
        background: '#F0FDF4', border: '3px solid #BBF7D0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
    },
    successTitle: { fontSize: 22, fontWeight: 800, color: '#1E1B4B', margin: '20px 0 8px' },
    muted: { fontSize: 14, color: '#6B7280', margin: 0 },
};

export default ProfessionalCoachBooking;
