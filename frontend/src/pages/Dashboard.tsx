import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Settings, 
  LogOut, 
  Sparkles, 
  Users, 
  Bell, 
  Activity,
  History,
  Menu,
  X,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';
import ProtectedDashboardWrapper from '../components/ProtectedDashboardWrapper';
import './Dashboard.css';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Improved role check: ensures it handles case-sensitivity from Django
    const userRole = user?.role?.toLowerCase();
    const isCoach = userRole === 'coach';
    const isClient = userRole === 'client';

    // SECURITY: Redirect if no user session found
    useEffect(() => {
        if (!user) {
            console.log("No session found, redirecting to login...");
            navigate('/');
        }
    }, [user, navigate]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Helper to get initials for the avatar (e.g., "Haseeb" -> "HA")
    const getInitials = (name: string) => {
        if (!name) return "??";
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (!user) return null; 

    return (
        <div className="dashboard-wrapper">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={closeMobileMenu}></div>
            )}

            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="logo-section">
                    <div className="logo-icon"><Sparkles size={24} color="#AA96DA" /></div>
                    <div className="logo-text">MindWell AI</div>
                    <button className="close-menu-btn" onClick={closeMobileMenu}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="nav-menu">
                    <p className="menu-label">Main Menu</p>
                    <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                        <Home size={20} /> Overview
                    </NavLink>
                    
                    {/* CLIENT SPECIFIC NAVIGATION */}
                    {isClient && (
                        <>
                            <NavLink to="/dashboard/ai-assistant" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <Sparkles size={20} /> AI Guidance
                            </NavLink>
                            <NavLink to="/dashboard/mood-tracker" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <Activity size={20} /> Emotion Logs
                            </NavLink>
                            {/* <NavLink to="/dashboard/journal" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <BookOpen size={20} /> Journal
                            </NavLink> */}
                        </>
                    )}

                    {/* COACH SPECIFIC NAVIGATION */}
                    {isCoach && (
                        <>
                            <NavLink to="/dashboard/coach-overview" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <BarChart3 size={20} /> Coach Dashboard
                            </NavLink>
                            <NavLink to="/dashboard/patients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <Users size={20} /> My Clients
                            </NavLink>
                            <NavLink to="/dashboard/session-logs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <History size={20} /> Session Logs
                            </NavLink>
                        </>
                    )}
                    
                    {/* ADMIN/SUPERUSER NAVIGATION - Check if user has admin/superuser role */}
                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superuser') && (
                        <>
                            <p className="menu-label">Administration</p>
                            <NavLink to="/dashboard/coach-approval" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                                <ShieldCheck size={20} /> Coach Approvals
                            </NavLink>
                        </>
                    )}
                    
                    <p className="menu-label">Account</p>
                    <NavLink to="/dashboard/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                        <Bell size={20} /> Notifications
                    </NavLink>
                    <NavLink to="/dashboard/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMobileMenu}>
                        <Settings size={20} /> Settings
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info-mini">
                        <span className="user-email-text">{user.email}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>
            
            <main className="content">
                <header className="top-bar">
                    <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                        <Menu size={24} />
                    </button>
                    
                    <div className="welcome-text">
                        <h2>Welcome back, {user.name}</h2>
                        <span className={`role-badge ${isCoach ? 'coach-badge' : 'client-badge'}`}>
                            {isCoach ? 'Clinical Portal' : 'Personal Sanctuary'}
                        </span>
                    </div>
                    
                    <div className="top-bar-actions">
                        <button className="icon-btn" title="Notifications">
                            <Bell size={20} />
                        </button>
                        <div className="user-profile">
                            <div className="avatar">
                                {getInitials(user.name)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="page-container">
                    {/* This renders the specific page content like Journal or Mood Tracker */}
                    <ProtectedDashboardWrapper>
                        <Outlet />
                    </ProtectedDashboardWrapper>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;