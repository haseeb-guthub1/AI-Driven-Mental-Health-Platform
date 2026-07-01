import React, { useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserCheck, AlertCircle, MessageSquare,
    ChevronRight, Filter, X, Calendar, Activity,
    Phone, Clock, FileText, TrendingUp, Heart,
    CheckCircle, AlertTriangle, Mail
} from 'lucide-react';
import './Patients.css';

interface Appointment {
    date: string;
    status: 'upcoming' | 'completed' | 'cancelled';
}

interface Patient {
    id: number;
    name: string;
    lastActive: string;
    status: 'Stable' | 'Distressed' | 'Improving' | 'Critical';
    risk: 'Low' | 'Medium' | 'High';
    riskScore: number;
    avatar: string;
    age: number;
    sessions: number;
    lastEmotion: string;
    phone: string;
    email: string;
    joinedDate: string;
    notes: string;
    appointments: Appointment[];
}

const MOCK_PATIENTS: Patient[] = [
    {
        id: 1,
        name: 'Nadia Shah',
        lastActive: '10 mins ago',
        status: 'Critical',
        risk: 'High',
        riskScore: 89,
        avatar: 'NS',
        age: 28,
        sessions: 8,
        lastEmotion: 'grief',
        phone: '+92 300 1234567',
        email: 'nadia.shah@email.com',
        joinedDate: '2026-03-15',
        notes: 'Client displaying signs of acute depression and grief. Crisis intervention initiated on 22-Jun-2026. Safety plan reviewed and updated. Emergency contact notified per consent. Mandatory coach assignment completed (Risk score: 89%). Requires 48-hour follow-up sessions.',
        appointments: [
            { date: '2026-06-28T09:00:00', status: 'upcoming' },
            { date: '2026-06-25T10:00:00', status: 'completed' },
            { date: '2026-06-22T16:00:00', status: 'completed' },
        ],
    },
    {
        id: 2,
        name: 'Marcus Wright',
        lastActive: '15 mins ago',
        status: 'Distressed',
        risk: 'High',
        riskScore: 71,
        avatar: 'MW',
        age: 41,
        sessions: 6,
        lastEmotion: 'sadness',
        phone: '+92 333 5551234',
        email: 'marcus.wright@email.com',
        joinedDate: '2026-04-20',
        notes: 'Processing grief following recent bereavement. Regular monitoring required. Introduced journaling as coping tool. Responding well to structured sessions.',
        appointments: [
            { date: '2026-06-27T10:00:00', status: 'upcoming' },
            { date: '2026-06-24T11:00:00', status: 'completed' },
        ],
    },
    {
        id: 3,
        name: 'Sara Malik',
        lastActive: '5 hours ago',
        status: 'Distressed',
        risk: 'High',
        riskScore: 68,
        avatar: 'SM',
        age: 23,
        sessions: 3,
        lastEmotion: 'fear',
        phone: '+92 300 9990001',
        email: 'sara.malik@email.com',
        joinedDate: '2026-06-10',
        notes: 'Recent trauma exposure. Acute stress response observed. EMDR evaluation recommended. Young client requiring gentle approach. Support network assessment in progress.',
        appointments: [
            { date: '2026-06-26T09:00:00', status: 'upcoming' },
        ],
    },
    {
        id: 4,
        name: 'Alice Thompson',
        lastActive: '2 hours ago',
        status: 'Stable',
        risk: 'Low',
        riskScore: 25,
        avatar: 'AT',
        age: 34,
        sessions: 12,
        lastEmotion: 'anxiety',
        phone: '+92 301 9876543',
        email: 'alice.thompson@email.com',
        joinedDate: '2026-01-10',
        notes: 'Making excellent progress with CBT. Work-related anxiety significantly improved. Thought diary homework consistently completed. Considering transition to bi-weekly sessions.',
        appointments: [
            { date: '2026-07-02T14:00:00', status: 'upcoming' },
            { date: '2026-06-24T14:00:00', status: 'completed' },
        ],
    },
    {
        id: 5,
        name: 'Hana Lee',
        lastActive: 'Yesterday',
        status: 'Improving',
        risk: 'Medium',
        riskScore: 45,
        avatar: 'HL',
        age: 27,
        sessions: 15,
        lastEmotion: 'optimism',
        phone: '+92 312 7778899',
        email: 'hana.lee@email.com',
        joinedDate: '2025-11-05',
        notes: 'Significant improvement observed over the past 3 months. Goals review completed successfully. Positive reinforcement techniques showing great results. Transitioning from weekly to bi-weekly sessions next month.',
        appointments: [
            { date: '2026-06-30T15:30:00', status: 'upcoming' },
            { date: '2026-06-23T15:30:00', status: 'completed' },
        ],
    },
    {
        id: 6,
        name: 'David Chen',
        lastActive: '3 days ago',
        status: 'Stable',
        risk: 'Low',
        riskScore: 18,
        avatar: 'DC',
        age: 52,
        sessions: 4,
        lastEmotion: 'neutral',
        phone: '+92 321 4443332',
        email: 'david.chen@email.com',
        joinedDate: '2026-05-12',
        notes: 'Initial assessment completed. Preventive wellness support. No acute concerns identified. Mindfulness exercises introduced and well received. Monthly check-in sufficient at this stage.',
        appointments: [
            { date: '2026-07-05T09:00:00', status: 'upcoming' },
            { date: '2026-06-23T09:00:00', status: 'completed' },
        ],
    },
];

const getEmotionColor = (emotion: string) => {
    const map: Record<string, string> = {
        joy: '#22c55e', optimism: '#3b82f6', gratitude: '#84cc16',
        sadness: '#6366f1', anxiety: '#f97316', fear: '#f59e0b',
        anger: '#ef4444', grief: '#7c3aed', neutral: '#64748b',
    };
    return map[emotion] || '#64748b';
};

const getRiskBg = (risk: string) => {
    if (risk === 'High') return 'linear-gradient(135deg,#DC2626,#9B1C1C)';
    if (risk === 'Medium') return 'linear-gradient(135deg,#D97706,#B45309)';
    return 'linear-gradient(135deg,#059669,#047857)';
};

const Patients: React.FC = () => {
    const currentUser = getCurrentUser();
    // Show dummy data only for the 4 built-in demo coaches (Sara Khan, Hassan Mirza, Amna Rauf, Zain Ali)
    const DEMO_COACH_IDS = [18, 19, 20, 21];
    const isDemoCoach = DEMO_COACH_IDS.includes(currentUser?.coach_id);
    const patients = isDemoCoach ? MOCK_PATIENTS : [];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageTarget, setMessageTarget] = useState<Patient | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messageSent, setMessageSent] = useState(false);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const highRiskCount = patients.filter(p => p.risk === 'High').length;

    const handleMessage = (p: Patient, e: React.MouseEvent) => {
        e.stopPropagation();
        setMessageTarget(p);
        setMessageText('');
        setMessageSent(false);
        setShowMessageModal(true);
    };

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        setMessageSent(true);
        setTimeout(() => setShowMessageModal(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="patients-page"
        >
            {/* Stats Header */}
            <div className="stats-header">
                <div className="stat-tile">
                    <div className="icon-box blue"><UserCheck size={20} /></div>
                    <div className="stat-info">
                        <h3>{patients.length}</h3>
                        <p>Active Clients</p>
                    </div>
                </div>
                <div className="stat-tile">
                    <div className="icon-box red"><AlertCircle size={20} /></div>
                    <div className="stat-info">
                        <h3>{highRiskCount}</h3>
                        <p>High Risk Flags</p>
                    </div>
                </div>
                <div className="stat-tile">
                    <div className="icon-box green"><TrendingUp size={20} /></div>
                    <div className="stat-info">
                        <h3>{patients.filter(p => p.status === 'Improving').length}</h3>
                        <p>Improving</p>
                    </div>
                </div>
            </div>

            {/* List Controls */}
            <div className="list-controls">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="filter-btn">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* Patient List */}
            <div className="patients-list">
                <div className="list-labels">
                    <span>Client Name</span>
                    <span>Risk Level</span>
                    <span>Last Interaction</span>
                    <span style={{ textAlign: 'right' }}>Actions</span>
                </div>

                {filteredPatients.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                        <UserCheck size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                        <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px' }}>No clients yet</p>
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>Clients assigned to you will appear here.</p>
                    </div>
                )}
                {filteredPatients.map(patient => (
                    <motion.div
                        key={patient.id}
                        className="patient-card"
                        whileHover={{ scale: 1.01 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedPatient(patient)}
                    >
                        <div className="patient-main">
                            <div className="avatar-circle" style={{ background: getRiskBg(patient.risk), border: 'none' }}>
                                {patient.avatar}
                            </div>
                            <div className="name-box">
                                <strong>{patient.name}</strong>
                                <span style={{ color: patient.status === 'Critical' ? '#DC2626' : patient.status === 'Distressed' ? '#EA580C' : patient.status === 'Improving' ? '#059669' : '#6B7280' }}>
                                    {patient.status}
                                </span>
                            </div>
                        </div>

                        <div className={`risk-indicator ${patient.risk.toLowerCase()}`}>
                            <span className="dot"></span>
                            {patient.risk}
                            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', marginLeft: 4 }}>({patient.riskScore}%)</span>
                        </div>

                        <div className="time-info">{patient.lastActive}</div>

                        <div className="actions-cell">
                            <button className="msg-btn" title="Send message" onClick={e => handleMessage(patient, e)}>
                                <MessageSquare size={16} />
                            </button>
                            <button className="details-btn" onClick={e => { e.stopPropagation(); setSelectedPatient(patient); }}>
                                Records <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Patient Records Modal */}
            <AnimatePresence>
                {selectedPatient && (
                    <motion.div
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPatient(null)}
                    >
                        <motion.div
                            style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 620, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{ background: getRiskBg(selectedPatient.risk), padding: '24px 26px', position: 'relative' }}>
                                <button onClick={() => setSelectedPatient(null)} style={{ position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 8, border: '2px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.95)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <X size={18} color="#374151" />
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
                                        {selectedPatient.avatar}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'white' }}>{selectedPatient.name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                                            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
                                                {selectedPatient.status}
                                            </span>
                                            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Risk: {selectedPatient.riskScore}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {/* Quick Info Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {[
                                        { icon: <Calendar size={15} />, label: 'Age', value: `${selectedPatient.age} years` },
                                        { icon: <Activity size={15} />, label: 'Total Sessions', value: `${selectedPatient.sessions} sessions` },
                                        { icon: <Phone size={15} />, label: 'Phone', value: selectedPatient.phone },
                                        { icon: <Mail size={15} />, label: 'Email', value: selectedPatient.email },
                                        { icon: <Clock size={15} />, label: 'Last Active', value: selectedPatient.lastActive },
                                        { icon: <Calendar size={15} />, label: 'Joined', value: new Date(selectedPatient.joinedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '11px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                                {item.icon} {item.label}
                                            </div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E1B4B' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Last Emotion */}
                                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                        <Heart size={13} /> Last Detected Emotion
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: getEmotionColor(selectedPatient.lastEmotion), boxShadow: `0 0 8px ${getEmotionColor(selectedPatient.lastEmotion)}` }}></div>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: getEmotionColor(selectedPatient.lastEmotion), textTransform: 'capitalize' }}>
                                            {selectedPatient.lastEmotion}
                                        </span>
                                    </div>
                                </div>

                                {/* Clinical Notes */}
                                <div style={{ background: selectedPatient.risk === 'High' ? '#FFF7ED' : '#F9FAFB', border: `1px solid ${selectedPatient.risk === 'High' ? '#FED7AA' : '#E5E7EB'}`, borderRadius: 10, padding: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: selectedPatient.risk === 'High' ? '#92400E' : '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                        <FileText size={13} /> Clinical Notes
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.65 }}>{selectedPatient.notes}</p>
                                </div>

                                {/* Appointments */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                        <Calendar size={13} /> Appointments
                                    </div>
                                    {selectedPatient.appointments.length === 0 ? (
                                        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>No appointments scheduled.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {selectedPatient.appointments.map((appt, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 9, padding: '10px 14px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E1B4B' }}>
                                                            {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                            {new Date(appt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.72rem', fontWeight: 700, borderRadius: 20, padding: '3px 10px',
                                                        background: appt.status === 'upcoming' ? '#EEF2FF' : appt.status === 'completed' ? '#F0FDF4' : '#FEF2F2',
                                                        color: appt.status === 'upcoming' ? '#4F46E5' : appt.status === 'completed' ? '#059669' : '#DC2626',
                                                        border: `1px solid ${appt.status === 'upcoming' ? '#C7D2FE' : appt.status === 'completed' ? '#BBF7D0' : '#FECACA'}`,
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {appt.status === 'completed' ? <CheckCircle size={10} style={{ marginRight: 3, display: 'inline' }} /> : appt.status === 'upcoming' ? <Clock size={10} style={{ marginRight: 3, display: 'inline' }} /> : null}
                                                        {appt.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={() => { setSelectedPatient(null); handleMessage(selectedPatient, { stopPropagation: () => {} } as any); }}
                                        style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                                    >
                                        <MessageSquare size={16} /> Send Message
                                    </button>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'white', color: '#4B5563', border: '2px solid #E5E7EB', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Modal */}
            <AnimatePresence>
                {showMessageModal && messageTarget && (
                    <motion.div
                        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMessageModal(false)}
                    >
                        <motion.div
                            style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid #F3F4F6', background: 'linear-gradient(135deg,#F5F7FF,#fff)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 11, background: getRiskBg(messageTarget.risk), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: 'white' }}>
                                        {messageTarget.avatar}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>Message {messageTarget.name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>{messageTarget.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMessageModal(false)} style={{ width: 34, height: 34, borderRadius: 8, border: '2px solid #D1D5DB', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <X size={16} color="#374151" />
                                </button>
                            </div>
                            <div style={{ padding: '20px 22px' }}>
                                {messageSent ? (
                                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                            <CheckCircle size={28} color="#059669" />
                                        </div>
                                        <h3 style={{ margin: '0 0 6px', color: '#1E1B4B', fontWeight: 800 }}>Message Sent!</h3>
                                        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.85rem' }}>{messageTarget.name} will be notified shortly.</p>
                                    </div>
                                ) : (
                                    <>
                                        {messageTarget.risk === 'High' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 12px', marginBottom: 14, fontSize: '0.82rem', color: '#DC2626', fontWeight: 600 }}>
                                                <AlertTriangle size={14} /> High-risk client — messages are logged for clinical review.
                                            </div>
                                        )}
                                        <textarea
                                            value={messageText}
                                            onChange={e => setMessageText(e.target.value)}
                                            placeholder={`Write a message to ${messageTarget.name}...`}
                                            rows={5}
                                            style={{ width: '100%', padding: '12px', border: '1.5px solid #D1D5DB', borderRadius: 10, fontSize: '0.9rem', color: '#1E1B4B', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', background: '#FAFAFA' }}
                                        />
                                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!messageText.trim()}
                                                style={{ flex: 1, padding: '11px', borderRadius: 10, background: messageText.trim() ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : '#E5E7EB', color: messageText.trim() ? 'white' : '#9CA3AF', border: 'none', cursor: messageText.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                                            >
                                                <MessageSquare size={15} /> Send Message
                                            </button>
                                            <button onClick={() => setShowMessageModal(false)} style={{ padding: '11px 18px', borderRadius: 10, background: 'white', color: '#4B5563', border: '2px solid #E5E7EB', cursor: 'pointer', fontWeight: 600 }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Patients;
