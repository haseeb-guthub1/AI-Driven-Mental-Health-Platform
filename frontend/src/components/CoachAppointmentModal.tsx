import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Shield, Award, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../services/authService';

interface Coach {
    coach_id: number;
    full_name: string;
    specialization?: string;
    license_id?: string;
    is_approved?: boolean;
    user_name?: string;
    user_email?: string;
}

interface CoachAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CoachAppointmentModal: React.FC<CoachAppointmentModalProps> = ({ isOpen, onClose }) => {
    const user = getCurrentUser();
    const clientId = user?.id || user?.client_id || user?.user_id;

    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAvailableCoaches();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const fetchAvailableCoaches = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/coach-client/available-coaches/');
            setCoaches(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch coaches:', err);
            setError('Unable to load coaches. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedCoach || !appointmentDate || !appointmentTime || !clientId) {
            setError('Please select a coach, date, and time.');
            return;
        }

        setIsBooking(true);
        setError(null);

        try {
            // Combine date and time into a datetime string
            const appointmentDateTime = `${appointmentDate}T${appointmentTime}:00`;

            const response = await axios.post('http://127.0.0.1:8000/api/coach-client/appointments/', {
                coach_id: selectedCoach,
                client_id: clientId,
                appointment_date: appointmentDateTime,
                duration_minutes: 60,
                notes: notes,
                status: 'pending'
            });

            if (response.data) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    resetForm();
                }, 2000);
            }
        } catch (err: any) {
            console.error('Failed to book appointment:', err);
            setError(err.response?.data?.appointment_date?.[0] || 'Failed to book appointment. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    const resetForm = () => {
        setSelectedCoach(null);
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
        setError(null);
        setSuccess(false);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-700/50 px-6 py-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                                <Calendar className="w-8 h-8 text-indigo-400" />
                                Book Appointment with Coach
                            </h2>
                            <p className="text-slate-400">Schedule a session with one of our professional coaches</p>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                resetForm();
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Appointment Booked!</h3>
                            <p className="text-slate-400 text-center">Your appointment has been scheduled successfully. The coach will be notified.</p>
                        </div>
                    ) : (
                        <>
                            {/* Select Coach Section */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-400" />
                                    Select a Coach
                                </h3>
                                
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                    </div>
                                ) : coaches.length === 0 ? (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                                        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                                        <p className="text-yellow-300">No coaches available at the moment</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {coaches.map((coach) => {
                                            const isSelected = selectedCoach === coach.coach_id;
                                            return (
                                                <button
                                                    key={coach.coach_id}
                                                    onClick={() => setSelectedCoach(coach.coach_id)}
                                                    className={`text-left p-4 rounded-xl transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-600/40 border-2 border-indigo-400 shadow-lg'
                                                            : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                                                            isSelected 
                                                                ? 'bg-indigo-500 text-white' 
                                                                : 'bg-slate-700 text-slate-300'
                                                        }`}>
                                                            {getInitials(coach.full_name)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-white">{coach.full_name}</h4>
                                                                {coach.is_approved && (
                                                                    <Award className="w-4 h-4 text-green-400" />
                                                                )}
                                                            </div>
                                                            {coach.specialization && (
                                                                <div className="flex items-center gap-1.5 text-sm text-slate-300 mb-2">
                                                                    <Shield className="w-4 h-4 text-indigo-400" />
                                                                    <span>{coach.specialization}</span>
                                                                </div>
                                                            )}
                                                            {coach.license_id && (
                                                                <div className="text-xs text-slate-400 font-mono">
                                                                    {coach.license_id}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isSelected && (
                                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Date and Time Selection */}
                            {selectedCoach && (
                                <div className="mb-6 space-y-4">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-400" />
                                        Schedule Appointment
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                min={today}
                                                value={appointmentDate}
                                                onChange={(e) => setAppointmentDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                value={appointmentTime}
                                                onChange={(e) => setAppointmentTime(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any specific topics or concerns you'd like to discuss..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-200">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        onClose();
                                        resetForm();
                                    }}
                                    className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBookAppointment}
                                    disabled={!selectedCoach || !appointmentDate || !appointmentTime || isBooking}
                                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        !selectedCoach || !appointmentDate || !appointmentTime || isBooking
                                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg'
                                    }`}
                                >
                                    {isBooking ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Booking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Book Appointment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoachAppointmentModal;