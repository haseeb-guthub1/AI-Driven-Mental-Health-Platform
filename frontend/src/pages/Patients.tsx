import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, AlertCircle, MessageSquare, ChevronRight, Filter } from 'lucide-react';
import './Patients.css';

// Mock data - This will eventually be fetched from your human_coach/ views
const MOCK_PATIENTS = [
    { id: 1, name: "Alice Thompson", lastActive: "2 hours ago", status: "Stable", risk: "Low", avatar: "AT" },
    { id: 2, name: "Marcus Wright", lastActive: "15 mins ago", status: "Distressed", risk: "High", avatar: "MW" },
    { id: 3, name: "Hana Lee", lastActive: "Yesterday", status: "Improving", risk: "Medium", avatar: "HL" },
    { id: 4, name: "David Chen", lastActive: "3 days ago", status: "Stable", risk: "Low", avatar: "DC" },
];

const Patients: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = MOCK_PATIENTS.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="patients-page"
        >
            {/* Clinical Overview Stats */}
            <div className="stats-header">
                <div className="stat-tile">
                    <div className="icon-box blue"><UserCheck size={20} /></div>
                    <div className="stat-info">
                        <h3>24</h3>
                        <p>Active Clients</p>
                    </div>
                </div>
                <div className="stat-tile">
                    <div className="icon-box red"><AlertCircle size={20} /></div>
                    <div className="stat-info">
                        <h3>3</h3>
                        <p>High Risk Flags</p>
                    </div>
                </div>
            </div>

            {/* List Controls */}
            <div className="list-controls">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search patients..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="filter-btn">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* Patient Table/List */}
            <div className="patients-list">
                <div className="list-labels">
                    <span>Patient Name</span>
                    <span>Risk Level</span>
                    <span>Last Interaction</span>
                    <span style={{ textAlign: 'right' }}>Actions</span>
                </div>
                
                {filteredPatients.map((patient) => (
                    <motion.div 
                        key={patient.id} 
                        className="patient-card"
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="patient-main">
                            <div className="avatar-circle">{patient.avatar}</div>
                            <div className="name-box">
                                <strong>{patient.name}</strong>
                                <span>{patient.status}</span>
                            </div>
                        </div>

                        <div className={`risk-indicator ${patient.risk.toLowerCase()}`}>
                            <span className="dot"></span>
                            {patient.risk}
                        </div>

                        <div className="time-info">
                            {patient.lastActive}
                        </div>

                        <div className="actions-cell">
                            <button className="msg-btn"><MessageSquare size={16} /></button>
                            <button className="details-btn">
                                Records <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Patients;