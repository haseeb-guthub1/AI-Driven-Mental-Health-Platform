import React, { useState, useEffect } from 'react';
import {
    AlertTriangle, ShieldAlert, Calendar, Clock, Lock, ArrowRight,
    CheckCircle, Loader2, Award, Shield
} from 'lucide-react';
import { apiService } from '../services/api';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
}

interface MandatoryCoachAppointmentModalProps {
    clientId: number;
    lockStatus: {
        is_locked: boolean;
        reason: string;
        current_risk_score: number;
        threshold: number;
        historical_data?: { average_score: number; trend: string; sessions: any[] };
        conditions_met?: { high_risk_now: boolean; historical_high_risk: boolean };
    };
    onCoachAssigned: () => void;
}

// ── Design helpers ──────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
    { bg: 'linear-gradient(135deg,#6366F1,#4338CA)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#06B6D4,#0E7490)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#10B981,#047857)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#F59E0B,#B45309)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#F43F5E,#BE123C)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#0EA5E9,#0369A1)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#14B8A6,#0F766E)', text: '#fff' },
];

function avatarPalette(name: string) {
    const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_PALETTES[code % AVATAR_PALETTES.length];
}

function specialtyBadge(spec: string): { bg: string; color: string; border: string } {
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

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Component ───────────────────────────────────────────────────────────────

const MandatoryCoachAppointmentModal: React.FC<MandatoryCoachAppointmentModalProps> = ({
    clientId, lockStatus, onCoachAssigned,
}) => {
    const [step, setStep] = useState<'warning' | 'selectCoach' | 'bookAppointment'>('warning');
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('09:00');
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(10);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (step === 'warning' && countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [step, countdown]);

    useEffect(() => {
        if (step === 'selectCoach') fetchCoaches();
    }, [step]);

    useEffect(() => {
        if (step === 'bookAppointment') {
            const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
            setAppointmentDate(d.toISOString().split('T')[0]);
        }
    }, [step]);

    const fetchCoaches = async () => {
        setIsLoading(true);
        try {
            const res = await apiService.getAvailableCoaches();
            setCoaches(res.data.coaches || []);
        } catch {
            setError('Unable to load coaches. Please contact support immediately.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedCoach || !appointmentDate || !appointmentTime) {
            setError('Please select both date and time.');
            return;
        }
        setIsAssigning(true);
        setError(null);
        try {
            await apiService.assignCoachToClient(clientId, selectedCoach);
            await apiService.bookAppointment({
                coach_id: selectedCoach,
                client_id: clientId,
                appointment_date: `${appointmentDate}T${appointmentTime}:00`,
                duration_minutes: 60,
                status: 'confirmed',
            });
            setSuccess(true);
            setTimeout(onCoachAssigned, 1800);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Booking failed. Please try again.');
            setIsAssigning(false);
        }
    };

    const score = lockStatus.current_risk_score;
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const selectedCoachObj = coaches.find(c => c.coach_id === selectedCoach);

    // ── Success screen ──────────────────────────────────────────────────────
    if (success) return (
        <div style={styles.overlay}>
            <div style={{ ...styles.card, maxWidth: 440, textAlign: 'center', padding: '56px 40px' }}>
                <div style={styles.successRing}>
                    <CheckCircle size={52} color="#059669" strokeWidth={2} />
                </div>
                <h2 style={{ ...styles.h2, marginTop: 24, marginBottom: 8 }}>Appointment Confirmed</h2>
                <p style={styles.muted}>Your session has been scheduled. Unlocking your dashboard now.</p>
            </div>
        </div>
    );

    return (
        <div style={styles.overlay}>

            {/* ── STEP 1: CRITICAL WARNING ──────────────────────────────────── */}
            {step === 'warning' && (
                <div style={styles.warningShell}>
                    {/* Ambient blobs */}
                    <div style={styles.blob1} />
                    <div style={styles.blob2} />

                    <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 760 }}>
                        {/* Header */}
                        <div style={styles.warningHeader}>
                            <div style={styles.warningIconRing}>
                                <ShieldAlert size={40} color="#DC2626" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={styles.warningEyebrow}>CRITICAL ALERT</div>
                                <h1 style={styles.warningTitle}>Immediate Professional Support Required</h1>
                            </div>
                        </div>

                        {/* Risk gauge */}
                        <div style={styles.gaugeBox}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                                <span style={styles.gaugeNumber}>{score.toFixed(0)}</span>
                                <span style={styles.gaugeUnit}>% risk</span>
                            </div>
                            <div style={styles.gaugeTrack}>
                                <div style={{ ...styles.gaugeFill, width: `${Math.min(score, 100)}%` }} />
                                <div style={{ ...styles.gaugeThreshold, left: `${lockStatus.threshold}%` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                <span style={styles.gaugeLabel}>Safe zone</span>
                                <span style={{ ...styles.gaugeLabel, color: '#FCA5A5' }}>Critical zone</span>
                            </div>
                        </div>

                        {/* Info rows */}
                        <div style={styles.infoGrid}>
                            {[
                                {
                                    icon: <Lock size={20} color="#FCA5A5" />,
                                    title: 'Dashboard temporarily restricted',
                                    body: 'To protect your wellbeing, full access requires connecting with a licensed professional.',
                                },
                                {
                                    icon: <Calendar size={20} color="#FCA5A5" />,
                                    title: 'Two steps to unlock',
                                    body: 'Select a licensed mental health coach, then book a session within 48 hours.',
                                },
                                {
                                    icon: <AlertTriangle size={20} color="#FCD34D" />,
                                    title: 'Need immediate crisis help?',
                                    body: 'National Crisis Hotline: 988  ·  Crisis Text Line: Text HELLO to 741741',
                                },
                            ].map((item, i) => (
                                <div key={i} style={styles.infoRow}>
                                    <div style={styles.infoIcon}>{item.icon}</div>
                                    <div>
                                        <div style={styles.infoTitle}>{item.title}</div>
                                        <div style={styles.infoBody}>{item.body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => setStep('selectCoach')}
                            disabled={countdown > 0}
                            style={countdown > 0 ? styles.btnDisabled : styles.btnPrimary}
                        >
                            {countdown > 0
                                ? `Please read carefully — ${countdown}s`
                                : <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <CheckCircle size={20} />
                                    I understand — Choose my coach
                                    <ArrowRight size={20} />
                                  </span>
                            }
                        </button>
                        <p style={styles.warningFootnote}>This screen cannot be dismissed</p>
                    </div>
                </div>
            )}

            {/* ── STEP 2: SELECT COACH ─────────────────────────────────────── */}
            {step === 'selectCoach' && (
                <div style={styles.lightShell}>
                    {/* Step indicator */}
                    <div style={styles.stepBar}>
                        <div style={styles.stepDone}><CheckCircle size={14} /> Warning</div>
                        <div style={styles.stepLine} />
                        <div style={styles.stepActive}><span style={styles.stepNum}>1</span> Select coach</div>
                        <div style={styles.stepLine} />
                        <div style={styles.stepPending}><span style={styles.stepNumPending}>2</span> Book session</div>
                    </div>

                    <div style={styles.lightHeader}>
                        <h2 style={styles.lightTitle}>Choose Your Mental Health Coach</h2>
                        <p style={styles.lightSubtitle}>
                            Select a licensed professional matched to your needs. All coaches are verified and approved.
                        </p>
                    </div>

                    {isLoading ? (
                        <div style={styles.loadingBox}>
                            <Loader2 size={36} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={styles.muted}>Loading available coaches…</p>
                        </div>
                    ) : coaches.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <AlertTriangle size={40} color="#F59E0B" />
                            <p style={{ ...styles.muted, marginTop: 12 }}>No coaches available. Please contact support.</p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.coachGrid}>
                                {coaches.map(coach => {
                                    const selected = selectedCoach === coach.coach_id;
                                    const pal = avatarPalette(coach.full_name);
                                    const badge = coach.specialization ? specialtyBadge(coach.specialization) : null;
                                    return (
                                        <button
                                            key={coach.coach_id}
                                            onClick={() => setSelectedCoach(coach.coach_id)}
                                            style={selected ? styles.coachCardSelected : styles.coachCard}
                                        >
                                            {/* Avatar */}
                                            <div style={{ ...styles.avatar, background: pal.bg }}>
                                                {getInitials(coach.full_name)}
                                                {coach.is_approved && (
                                                    <div style={styles.verifiedDot}>
                                                        <Award size={10} color="#fff" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div style={styles.coachInfo}>
                                                <div style={styles.coachNameRow}>
                                                    <span style={styles.coachName}>{coach.full_name}</span>
                                                    {selected && (
                                                        <span style={styles.selectedPill}>
                                                            <CheckCircle size={12} strokeWidth={3} /> Selected
                                                        </span>
                                                    )}
                                                </div>

                                                {badge && coach.specialization && (
                                                    <span style={{
                                                        ...styles.specialtyPill,
                                                        background: badge.bg,
                                                        color: badge.color,
                                                        border: `1px solid ${badge.border}`,
                                                    }}>
                                                        {coach.specialization}
                                                    </span>
                                                )}

                                                <div style={styles.coachMeta}>
                                                    {coach.is_approved && (
                                                        <span style={styles.verifiedText}>
                                                            <CheckCircle size={12} color="#059669" strokeWidth={3} />
                                                            Verified &amp; Licensed
                                                        </span>
                                                    )}
                                                    {coach.license_id && (
                                                        <span style={styles.licenseText}>{coach.license_id}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Radio */}
                                            <div style={selected ? styles.radioActive : styles.radioIdle} />
                                        </button>
                                    );
                                })}
                            </div>

                            {error && <div style={styles.errorBox}><AlertTriangle size={16} /> {error}</div>}

                            <button
                                onClick={() => {
                                    if (!selectedCoach) { setError('Please select a coach to continue.'); return; }
                                    setError(null);
                                    setStep('bookAppointment');
                                }}
                                style={selectedCoach ? styles.btnPrimaryDark : styles.btnDisabledDark}
                                disabled={!selectedCoach}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    Continue to book appointment <ArrowRight size={18} />
                                </span>
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ── STEP 3: BOOK APPOINTMENT ─────────────────────────────────── */}
            {step === 'bookAppointment' && (
                <div style={styles.lightShell}>
                    {/* Step indicator */}
                    <div style={styles.stepBar}>
                        <div style={styles.stepDone}><CheckCircle size={14} /> Warning</div>
                        <div style={styles.stepLine} />
                        <div style={styles.stepDone}><CheckCircle size={14} /> Coach selected</div>
                        <div style={styles.stepLine} />
                        <div style={styles.stepActive}><span style={styles.stepNum}>2</span> Book session</div>
                    </div>

                    <div style={styles.lightHeader}>
                        <h2 style={styles.lightTitle}>Book Your First Session</h2>
                        <p style={styles.lightSubtitle}>Schedule within the next 48 hours to unlock your dashboard.</p>
                    </div>

                    {/* Selected coach summary */}
                    {selectedCoachObj && (
                        <div style={styles.coachSummary}>
                            <div style={{ ...styles.avatarSm, background: avatarPalette(selectedCoachObj.full_name).bg }}>
                                {getInitials(selectedCoachObj.full_name)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#1E1B4B', fontSize: 16 }}>{selectedCoachObj.full_name}</div>
                                {selectedCoachObj.specialization && (
                                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{selectedCoachObj.specialization}</div>
                                )}
                            </div>
                            <button onClick={() => setStep('selectCoach')} style={styles.changeBtn}>Change</button>
                        </div>
                    )}

                    <div style={styles.bookingGrid}>
                        {/* Date */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.fieldLabel}>
                                <Calendar size={14} color="#4F46E5" /> Appointment date
                            </label>
                            <input
                                type="date"
                                value={appointmentDate}
                                onChange={e => setAppointmentDate(e.target.value)}
                                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                max={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                style={styles.dateInput}
                            />
                            <span style={styles.fieldHint}>Must be within the next 48 hours</span>
                        </div>

                        {/* Time slots */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.fieldLabel}>
                                <Clock size={14} color="#4F46E5" /> Preferred time
                            </label>
                            <div style={styles.timeGrid}>
                                {timeSlots.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setAppointmentTime(t)}
                                        style={appointmentTime === t ? styles.timeSlotActive : styles.timeSlot}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Session info */}
                    <div style={styles.sessionInfo}>
                        {[
                            '60-minute video consultation',
                            'Confirmation sent to your email',
                            '100% confidential · HIPAA compliant',
                            'Missing this session may restrict access',
                        ].map((item, i) => (
                            <div key={i} style={styles.sessionInfoRow}>
                                <CheckCircle size={14} color="#059669" strokeWidth={3} />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    {error && <div style={styles.errorBox}><AlertTriangle size={16} /> {error}</div>}

                    <button
                        onClick={handleBookAppointment}
                        disabled={isAssigning || !appointmentDate || !appointmentTime}
                        style={isAssigning || !appointmentDate || !appointmentTime ? styles.btnDisabledDark : styles.btnPrimaryDark}
                    >
                        {isAssigning
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Confirming appointment…
                              </span>
                            : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <CheckCircle size={18} />
                                Confirm appointment &amp; unlock dashboard
                                <ArrowRight size={18} />
                              </span>
                        }
                    </button>

                    <div style={styles.securityNote}>
                        <Shield size={14} color="#059669" />
                        All appointments are secured with end-to-end encryption
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    // Foundations
    overlay: {
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto', padding: '24px 16px',
    },

    // Warning step shell
    warningShell: {
        minHeight: '100%', width: '100%',
        background: 'linear-gradient(135deg,#1e0a0a 0%,#3b0a0a 50%,#1a0e1e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '48px 24px',
    },
    blob1: {
        position: 'absolute', top: 0, left: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(220,38,38,0.25) 0%,transparent 70%)',
        pointerEvents: 'none',
    },
    blob2: {
        position: 'absolute', bottom: 0, right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)',
        pointerEvents: 'none',
    },
    warningHeader: {
        display: 'flex', alignItems: 'center', gap: 20,
        marginBottom: 36,
    },
    warningIconRing: {
        width: 72, height: 72, borderRadius: 18,
        background: 'rgba(220,38,38,0.15)',
        border: '2px solid rgba(220,38,38,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    warningEyebrow: {
        fontSize: 11, fontWeight: 800, letterSpacing: '0.15em',
        color: '#F87171', textTransform: 'uppercase', marginBottom: 6,
    },
    warningTitle: {
        fontSize: 28, fontWeight: 800, color: '#fff',
        lineHeight: 1.2, margin: 0,
    },
    gaugeBox: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(220,38,38,0.3)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 24,
    },
    gaugeNumber: { fontSize: 64, fontWeight: 900, color: '#FCA5A5', lineHeight: 1 },
    gaugeUnit: { fontSize: 20, color: '#FCA5A5', fontWeight: 600 },
    gaugeTrack: {
        position: 'relative', height: 12,
        background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'visible',
    },
    gaugeFill: {
        position: 'absolute', left: 0, top: 0, height: '100%',
        borderRadius: 6,
        background: 'linear-gradient(90deg,#F59E0B,#EF4444,#DC2626)',
        transition: 'width 1s ease',
    },
    gaugeThreshold: {
        position: 'absolute', top: -4, bottom: -4, width: 2,
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
    },
    gaugeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 },
    infoRow: {
        display: 'flex', gap: 16, alignItems: 'flex-start',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '16px 20px',
    },
    infoIcon: { flexShrink: 0, marginTop: 1 },
    infoTitle: { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 },
    infoBody: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 },
    warningFootnote: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 14 },

    // Light shell (steps 2 + 3)
    lightShell: {
        width: '100%', maxWidth: 720,
        background: '#fff', borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        padding: '40px 44px',
        animation: 'fadeIn 0.35s ease',
    },
    stepBar: {
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 32,
    },
    stepDone: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600, color: '#059669',
    },
    stepActive: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 700, color: '#4F46E5',
    },
    stepPending: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 500, color: '#9CA3AF',
    },
    stepNum: {
        width: 18, height: 18, borderRadius: '50%',
        background: '#4F46E5', color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800,
    },
    stepNumPending: {
        width: 18, height: 18, borderRadius: '50%',
        background: '#E5E7EB', color: '#9CA3AF',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
    },
    stepLine: { flex: 1, height: 1, background: '#E5E7EB' },

    lightHeader: { marginBottom: 28 },
    lightTitle: { fontSize: 24, fontWeight: 800, color: '#1E1B4B', margin: '0 0 8px' },
    lightSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 },

    loadingBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 16, padding: '48px 0',
    },
    emptyBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, padding: '48px 0', textAlign: 'center',
    },

    // Coach cards
    coachGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
    coachCard: {
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px',
        background: '#FAFAFA',
        border: '1.5px solid #E5E7EB',
        borderRadius: 14, cursor: 'pointer',
        textAlign: 'left', width: '100%',
        transition: 'all 0.18s ease',
    },
    coachCardSelected: {
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px',
        background: '#EEF2FF',
        border: '2px solid #4F46E5',
        borderRadius: 14, cursor: 'pointer',
        textAlign: 'left', width: '100%',
        boxShadow: '0 0 0 4px rgba(79,70,229,0.1)',
        transition: 'all 0.18s ease',
    },
    avatar: {
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 800, color: '#fff',
        position: 'relative',
    },
    verifiedDot: {
        position: 'absolute', bottom: -4, right: -4,
        width: 18, height: 18, borderRadius: '50%',
        background: '#059669',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #fff',
    },
    coachInfo: { flex: 1, minWidth: 0 },
    coachNameRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 6,
    },
    coachName: { fontSize: 15, fontWeight: 700, color: '#1E1B4B' },
    selectedPill: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 700, color: '#4F46E5',
        background: '#EEF2FF', border: '1px solid #C7D2FE',
        borderRadius: 20, padding: '2px 8px', flexShrink: 0,
    },
    specialtyPill: {
        display: 'inline-block',
        fontSize: 11, fontWeight: 600,
        borderRadius: 20, padding: '3px 10px',
        marginBottom: 6,
    },
    coachMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const },
    verifiedText: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: '#059669', fontWeight: 600,
    },
    licenseText: {
        fontSize: 10, fontFamily: 'monospace',
        color: '#9CA3AF', letterSpacing: '0.05em',
        background: '#F3F4F6', borderRadius: 4, padding: '1px 6px',
    },
    radioIdle: {
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: '2px solid #D1D5DB', background: '#fff',
    },
    radioActive: {
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: '6px solid #4F46E5', background: '#fff',
    },

    // Booking
    coachSummary: {
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#F5F7FF', border: '1.5px solid #C7D2FE',
        borderRadius: 12, padding: '14px 18px', marginBottom: 24,
    },
    avatarSm: {
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: '#fff',
    },
    changeBtn: {
        marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#4F46E5',
        background: 'none', border: '1.5px solid #C7D2FE',
        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
    },
    bookingGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
    fieldLabel: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 700, color: '#1E1B4B',
        textTransform: 'uppercase', letterSpacing: '0.07em',
    },
    dateInput: {
        padding: '10px 14px',
        border: '1.5px solid #D1D5DB', borderRadius: 10,
        fontSize: 14, color: '#1E1B4B',
        background: '#FAFAFA', outline: 'none',
    },
    fieldHint: { fontSize: 11, color: '#9CA3AF' },
    timeGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6,
    },
    timeSlot: {
        padding: '8px 4px', fontSize: 12, fontWeight: 600,
        color: '#6B7280', background: '#F3F4F6',
        border: '1.5px solid #E5E7EB', borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.15s',
    },
    timeSlotActive: {
        padding: '8px 4px', fontSize: 12, fontWeight: 700,
        color: '#fff', background: '#4F46E5',
        border: '1.5px solid #4F46E5', borderRadius: 8, cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
    },
    sessionInfo: {
        display: 'flex', flexDirection: 'column', gap: 8,
        background: '#F0FDF4', border: '1.5px solid #BBF7D0',
        borderRadius: 10, padding: '14px 18px', marginBottom: 20,
    },
    sessionInfoRow: {
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, color: '#166534', fontWeight: 500,
    },
    securityNote: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontSize: 11, color: '#9CA3AF', marginTop: 14,
    },

    // Buttons
    btnPrimary: {
        width: '100%', padding: '16px', borderRadius: 12,
        background: 'linear-gradient(135deg,#EF4444,#DC2626)',
        color: '#fff', fontSize: 15, fontWeight: 700,
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
        transition: 'opacity 0.2s',
    },
    btnDisabled: {
        width: '100%', padding: '16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.35)', fontSize: 15, fontWeight: 600,
        border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed',
    },
    btnPrimaryDark: {
        width: '100%', padding: '15px', borderRadius: 12,
        background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
        color: '#fff', fontSize: 15, fontWeight: 700,
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
        marginTop: 4,
    },
    btnDisabledDark: {
        width: '100%', padding: '15px', borderRadius: 12,
        background: '#E5E7EB',
        color: '#9CA3AF', fontSize: 15, fontWeight: 600,
        border: 'none', cursor: 'not-allowed',
        marginTop: 4,
    },

    // Shared
    card: {
        background: '#fff', borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
    },
    muted: { fontSize: 14, color: '#6B7280' },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, color: '#DC2626',
        background: '#FEF2F2', border: '1px solid #FECACA',
        borderRadius: 8, padding: '10px 14px', marginBottom: 12,
    },
    successRing: {
        width: 96, height: 96, borderRadius: '50%',
        background: '#F0FDF4', border: '3px solid #BBF7D0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto',
    },
    h2: { fontSize: 22, fontWeight: 800, color: '#1E1B4B' },
};

export default MandatoryCoachAppointmentModal;
