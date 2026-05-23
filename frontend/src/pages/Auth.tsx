import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ShieldCheck, Heart, Award, Users, AlertCircle } from 'lucide-react';
import './Auth.css';
import { signupUser, loginUser } from '../services/authService';

const Auth: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [role, setRole] = useState<'client' | 'coach'>('client');
    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('25');
    const [gender, setGender] = useState('Male');
    const [licenseId, setLicenseId] = useState('');
    const [specialization, setSpecialization] = useState('General Mental Health');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const validateForm = (): boolean => {
        const newErrors: string[] = [];

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            newErrors.push('Please enter a valid email address');
        }

        // Password validation
        if (!password || password.length < 6) {
            newErrors.push('Password must be at least 6 characters long');
        }

        // Name validation for signup
        if (isSignUp && (!name || name.trim().length < 2)) {
            newErrors.push('Name must be at least 2 characters long');
        }

        // Age validation for client signup
        if (isSignUp && role === 'client') {
            const ageNum = parseInt(age);
            if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
                newErrors.push('Age must be between 13 and 120 years');
            }
        }

        // License ID validation for coach signup
        if (isSignUp && role === 'coach') {
            if (!licenseId || licenseId.trim().length < 5) {
                newErrors.push('License ID must be at least 5 characters long');
            }
            if (!specialization || specialization.trim().length < 3) {
                newErrors.push('Specialization must be at least 3 characters long');
            }
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleAuthAction = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            if (isSignUp) {
                console.log("🚀 Starting Signup Process...");
                
                // Create the user with password
                const userData = await signupUser(name, email, password, role, licenseId, specialization);
                console.log("✅ User created successfully:", userData);

                if (role === 'coach') {
                    setIsPending(true);
                } else {
                    // Redirect to login page instead of dashboard
                    alert('Account created successfully! Please log in.');
                    setIsSignUp(false);
                    setName('');
                    setPassword('');
                }
            } else {
                // LOGIN FLOW with password verification
                console.log("🔑 Starting Login Process...");
                const loggedInUser = await loginUser(email, password);
                console.log("✅ Logged in:", loggedInUser);
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            console.error("❌ Auth Error Details:", error);
            
            if (error.response?.status === 401) {
                setErrors(['Invalid password. Please try again.']);
            } else if (error.response?.status === 404) {
                setErrors(['User not found. Please sign up first.']);
            } else if (error.response?.data) {
                const backendErrors = error.response.data;
                const errorMessages = Object.values(backendErrors).flat().map(String);
                setErrors(errorMessages);
            } else {
                setErrors(['Connection error. Please ensure the server is running.']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="auth-wrapper">
                <motion.div 
                    className="auth-container pending-view" 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <ShieldCheck size={80} color="#6FCF97" />
                    <h1>Verification in Progress</h1>
                    <p>Our clinical team is verifying your professional credentials for the <strong>{name}</strong> coach profile.</p>
                    <button className="main-btn" onClick={() => setIsPending(false)}>BACK TO LOGIN</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={24} /> : <Sun size={24} color="#FDB813" />}
            </div>

            <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
                {/* LOGIN PANEL (Left) */}
                <div className="form-container sign-in-container">
                    <div className="panel">
                        <div className="auth-form">
                            <h1>Welcome back</h1>
                            <p>Sign in to your MindWell sanctuary.</p>
                            
                            {/* Error Messages */}
                            {!isSignUp && errors.length > 0 && (
                                <div className="error-box">
                                    {errors.map((error, index) => (
                                        <div key={index} className="error-message">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <input 
                                className="input-field" 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                            <input 
                                className="input-field" 
                                type="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAuthAction()}
                                disabled={isLoading}
                            />
                            <button 
                                className="main-btn" 
                                onClick={handleAuthAction}
                                disabled={isLoading}
                            >
                                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* SIGNUP PANEL (Right) */}
                <div className="form-container sign-up-container">
                    <div className="panel">
                        <div className="auth-form">
                            <h1>Create safe space</h1>
                        
                        {/* Error Messages */}
                        {isSignUp && errors.length > 0 && (
                            <div className="error-box">
                                {errors.map((error, index) => (
                                    <div key={index} className="error-message">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="role-selector">
                            <button 
                                className={role === 'client' ? 'active' : ''} 
                                onClick={() => setRole('client')}
                                disabled={isLoading}
                            >
                                <Users size={16} /> Client
                            </button>
                            <button 
                                className={role === 'coach' ? 'active' : ''} 
                                onClick={() => setRole('coach')}
                                disabled={isLoading}
                            >
                                <Award size={16} /> Coach
                            </button>
                        </div>

                        <input 
                            className="input-field" 
                            type="text" 
                            placeholder="Full Name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                        <input 
                            className="input-field" 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        
                        <AnimatePresence>
                            {role === 'client' && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: 'auto', opacity: 1 }} 
                                    exit={{ height: 0, opacity: 0 }} 
                                    className="extra-fields"
                                >
                                    <div className="field-row">
                                        <input 
                                            className="input-field half" 
                                            type="number" 
                                            placeholder="Age" 
                                            min="13"
                                            max="120"
                                            value={age} 
                                            onChange={(e) => setAge(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <select 
                                            className="input-field half" 
                                            value={gender} 
                                            onChange={(e) => setGender(e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                            {role === 'coach' && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: 'auto', opacity: 1 }} 
                                    exit={{ height: 0, opacity: 0 }} 
                                    className="extra-fields"
                                >
                                    <input 
                                        className="input-field" 
                                        type="text" 
                                        placeholder="Professional License ID *" 
                                        value={licenseId} 
                                        onChange={(e) => setLicenseId(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <input 
                                        className="input-field" 
                                        type="text" 
                                        placeholder="Specialization (e.g., Clinical Psychology)" 
                                        value={specialization} 
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input 
                            className="input-field" 
                            type="password" 
                            placeholder="Password (min 6 characters)" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAuthAction()}
                            disabled={isLoading}
                        />
                        <button 
                            className="main-btn" 
                            onClick={handleAuthAction}
                            disabled={isLoading}
                        >
                            {isLoading ? 'CREATING...' : (role === 'coach' ? 'REQUEST VERIFICATION' : 'CREATE ACCOUNT')}
                        </button>
                    </div>
                </div>
            </div>

                {/* OVERLAY SECTION */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <Heart size={50} />
                            <h2>Already a member?</h2>
                            <p>Login to continue your journey.</p>
                            <button className="ghost-btn" onClick={() => setIsSignUp(false)}>SIGN IN</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <ShieldCheck size={50} />
                            <h2>New here?</h2>
                            <p>Begin your secure, AI-guided therapy experience today.</p>
                            <button className="ghost-btn" onClick={() => setIsSignUp(true)}>SIGN UP</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;