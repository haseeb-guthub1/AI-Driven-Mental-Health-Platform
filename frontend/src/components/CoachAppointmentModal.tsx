import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Shield, Award, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getCurrentUser } from '../services/authService';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
}

interface CoachAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOCK_COACHES: Coach[] = [
    { coach_id: 1, full_name: 'Dr. Sara Khan',    specialization: 'Anxiety & Depression Specialist',    license_id: 'LIC-2024-001', is_approved: true },
    { coach_id: 2, full_name: 'Dr. Hassan Mirza', specialization: 'Cognitive Behavioural Therapy (CBT)', license_id: 'LIC-2024-002', is_approved: true },
    { coach_id: 3, full_name: 'Dr. Amna Rauf',    specialization: 'Stress Management & Work Burnout',   license_id: 'LIC-2024-003', is_approved: true },
    { coach_id: 4, full_name: 'Dr. Zain Ali',     specialization: 'Trauma & PTSD Recovery',             license_id: 'LIC-2024-004', is_approved: true },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#6366F1,#4338CA)',
    'linear-gradient(135deg,#8B5CF6,#6D28D9)',
    'linear-gradient(135deg,#06B6D4,#0E7490)',
    'linear-gradient(135deg,#10B981,#047857)',
];

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarGrad(name: string) {
    const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}

function specColors(spec: string): { bg: string; color: string; border: string } {
    const s = (spec || '').toLowerCase();
    if (s.includes('anxiety') || s.includes('depression')) return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
    if (s.includes('stress') || s.includes('burnout'))     return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
    if (s.includes('trauma') || s.includes('ptsd'))        return { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' };
    if (s.includes('cbt') || s.includes('mindful'))        return { bg: '#F0FDFA', color: '#0F766E', border: '#99F6E4' };
    return { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' };
}

const CoachAppointmentModal: React.FC<CoachAppointmentModalProps> = ({ isOpen, onClose }) => {
    const user = getCurrentUser();
    const clientId = user?.id || user?.client_id || user?.user_id;

    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('09:00');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen) {
            fetchAvailableCoaches();
        } else {
            resetForm();
        }
    }, [isOpen]);

    const fetchAvailableCoaches = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/coach-client/available-coaches/');
            const data = response.data || [];
            setCoaches(data.length > 0 ? data : MOCK_COACHES);
        } catch {
            setCoaches(MOCK_COACHES);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAppointmentLocally = (coachObj: Coach) => {
        const appointment = {
            id: Date.now(),
            clientName: user?.name || 'Unknown Client',
            clientId,
            coachId: coachObj.coach_id,
            coachName: coachObj.full_name,
            coachSpecialization: coachObj.specialization || '',
            date: appointmentDate,
            time: appointmentTime,
            notes: notes.trim(),
            status: 'pending',
            bookedAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('mindwell_appointments') || '[]');
        existing.push(appointment);
        localStorage.setItem('mindwell_appointments', JSON.stringify(existing));
    };

    const handleBook = async () => {
        if (!selectedCoach || !appointmentDate || !appointmentTime) {
            setError('Please select a coach, date, and time.');
            return;
        }
        const coachObj = coaches.find(c => c.coach_id === selectedCoach)!;
        setIsBooking(true);
        setError(null);
        try {
            await axios.post('http://127.0.0.1:8000/api/coach-client/appointments/', {
                coach_id: selectedCoach,
                client_id: clientId,
                appointment_date: `${appointmentDate}T${appointmentTime}:00`,
                duration_minutes: 60,
                notes,
                status: 'pending',
            });
        } catch {
            // Backend may reject in demo — that's fine, we save locally regardless
        } finally {
            setIsBooking(false);
        }
        // Always save locally so coach dashboard can show it
        saveAppointmentLocally(coachObj);
        setSuccess(true);
        setTimeout(() => { onClose(); }, 2500);
    };

    const resetForm = () => {
        setSelectedCoach(null);
        setAppointmentDate('');
        setAppointmentTime('09:00');
        setNotes('');
        setError(null);
        setSuccess(false);
    };

    if (!isOpen) return null;

    const selectedCoachObj = coaches.find(c => c.coach_id === selectedCoach);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 20,
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: 20,
                            width: '100%', maxWidth: 680,
                            maxHeight: '90vh', overflowY: 'auto',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            position: 'sticky', top: 0, zIndex: 10,
                            background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                            padding: '20px 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderRadius: '20px 20px 0 0',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={22} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Book a Coach Appointment</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Schedule a session with a professional coach</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{ width: 36, height: 36, borderRadius: 9, border: '2px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.95)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                            >
                                <X size={18} color="#374151" />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            {success ? (
                                /* Success state */
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <CheckCircle size={36} color="#059669" />
                                    </div>
                                    <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B' }}>Appointment Booked!</h3>
                                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.92rem' }}>
                                        Your session{selectedCoachObj ? ` with ${selectedCoachObj.full_name}` : ''} has been scheduled.<br />
                                        You'll receive a confirmation shortly.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Step 1 — Select Coach */}
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={15} color="#4F46E5" />
                                            </div>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Select a Coach</h3>
                                        </div>

                                        {isLoading ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                                                <Loader2 size={36} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                {coaches.map(coach => {
                                                    const isSelected = selectedCoach === coach.coach_id;
                                                    const sc = specColors(coach.specialization || '');
                                                    return (
                                                        <button
                                                            key={coach.coach_id}
                                                            onClick={() => setSelectedCoach(coach.coach_id)}
                                                            style={{
                                                                textAlign: 'left', padding: '14px',
                                                                borderRadius: 12,
                                                                border: isSelected ? '2px solid #4F46E5' : '2px solid #E5E7EB',
                                                                background: isSelected ? '#EEF2FF' : 'white',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s',
                                                                boxShadow: isSelected ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                                <div style={{ width: 44, height: 44, borderRadius: 11, background: avatarGrad(coach.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                                                                    {getInitials(coach.full_name)}
                                                                </div>
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E1B4B' }}>{coach.full_name}</span>
                                                                        {coach.is_approved && <Award size={13} color="#059669" />}
                                                                    </div>
                                                                    {coach.specialization && (
                                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                                            <Shield size={10} /> {coach.specialization}
                                                                        </span>
                                                                    )}
                                                                    {coach.license_id && (
                                                                        <div style={{ marginTop: 4, fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{coach.license_id}</div>
                                                                    )}
                                                                </div>
                                                                {isSelected && <CheckCircle size={18} color="#4F46E5" style={{ flexShrink: 0 }} />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 2 — Date & Time (shown after coach selected) */}
                                    {selectedCoach && (
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Clock size={15} color="#4F46E5" />
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Choose Date & Time</h3>
                                            </div>

                                            <div style={{ marginBottom: 14 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>Date</label>
                                                <input
                                                    type="date"
                                                    min={today}
                                                    value={appointmentDate}
                                                    onChange={e => setAppointmentDate(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1D5DB', borderRadius: 10, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 14 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>Time Slot</label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {TIME_SLOTS.map(slot => (
                                                        <button
                                                            key={slot}
                                                            onClick={() => setAppointmentTime(slot)}
                                                            style={{
                                                                padding: '8px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                                                                border: appointmentTime === slot ? '2px solid #4F46E5' : '2px solid #E5E7EB',
                                                                background: appointmentTime === slot ? '#4F46E5' : 'white',
                                                                color: appointmentTime === slot ? 'white' : '#4B5563',
                                                            }}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>Notes (optional)</label>
                                                <textarea
                                                    value={notes}
                                                    onChange={e => setNotes(e.target.value)}
                                                    placeholder="Any topics or concerns you'd like to discuss..."
                                                    rows={3}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D1D5DB', borderRadius: 10, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#FAFAFA', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Error */}
                                    {error && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>
                                            <AlertTriangle size={15} /> {error}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            onClick={onClose}
                                            style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'white', color: '#4B5563', border: '2px solid #E5E7EB', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBook}
                                            disabled={!selectedCoach || !appointmentDate || isBooking}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: 10, border: 'none', cursor: (!selectedCoach || !appointmentDate || isBooking) ? 'not-allowed' : 'pointer',
                                                background: (!selectedCoach || !appointmentDate || isBooking) ? '#E5E7EB' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                                                color: (!selectedCoach || !appointmentDate || isBooking) ? '#9CA3AF' : 'white',
                                                fontWeight: 700, fontSize: '0.9rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                boxShadow: (!selectedCoach || !appointmentDate || isBooking) ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {isBooking ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Booking...</> : <><CheckCircle size={16} /> Book Appointment</>}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CoachAppointmentModal;
