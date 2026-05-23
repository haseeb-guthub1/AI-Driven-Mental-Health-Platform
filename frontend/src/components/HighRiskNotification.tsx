import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HighRiskNotificationProps {
    riskScore: number;
    clientId: number;
}

const HighRiskNotification: React.FC<HighRiskNotificationProps> = ({ riskScore, clientId }) => {
    const navigate = useNavigate();

    const handleSelectCoach = () => {
        navigate('/dashboard/select-coach');
    };

    return (
        <>
            {/* Backdrop - Prevent interaction with dashboard */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />

            {/* Notification Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-red-900/95 via-red-800/95 to-orange-900/95 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
                >
                    {/* Alert Icon Header */}
                    <div className="relative bg-gradient-to-r from-red-600/30 to-orange-600/30 border-b border-red-500/30 px-8 py-6">
                        <div className="flex items-center justify-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
                            >
                                <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2.5} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center space-y-6">
                        {/* Title */}
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-3">
                                Professional Support Required
                            </h2>
                            <p className="text-red-200 text-lg">
                                Your risk assessment is <span className="font-bold text-white">{riskScore.toFixed(0)}%</span>
                            </p>
                        </div>

                        {/* Description */}
                        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4 text-left">
                                <div className="flex-shrink-0 mt-1">
                                    <Heart className="w-6 h-6 text-red-300" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Immediate Professional Guidance Needed
                                    </h3>
                                    <p className="text-red-100 leading-relaxed text-base">
                                        Based on your recent assessments, we strongly recommend connecting with a licensed mental health coach. 
                                        Professional support can provide you with personalized strategies and guidance tailored to your needs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4">
                                <div className="text-3xl font-bold text-white mb-1">{riskScore.toFixed(0)}%</div>
                                <div className="text-red-200 text-sm font-medium">Current Risk Level</div>
                            </div>
                            <div className="bg-orange-950/50 border border-orange-500/30 rounded-xl p-4">
                                <div className="text-3xl font-bold text-white mb-1">60%</div>
                                <div className="text-orange-200 text-sm font-medium">Safety Threshold</div>
                            </div>
                        </div>

                        {/* Call to Action Button */}
                        <button
                            onClick={handleSelectCoach}
                            className="group relative w-full bg-gradient-to-r from-white to-red-50 hover:from-red-50 hover:to-white text-red-900 font-bold text-xl py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] overflow-hidden"
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <span className="relative flex items-center justify-center gap-3">
                                <Heart className="w-6 h-6" />
                                <span>Connect with a Professional Coach Now</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </button>

                        {/* Info Text */}
                        <p className="text-red-200 text-sm">
                            🔒 This action is required to continue accessing your dashboard
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="bg-red-950/30 border-t border-red-500/20 px-8 py-4">
                        <p className="text-center text-red-300 text-sm">
                            All conversations are confidential and HIPAA compliant
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default HighRiskNotification;
