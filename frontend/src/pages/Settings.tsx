import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import axios from 'axios';
import './Settings.css';

interface UserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  emotionAlerts: boolean;
  sessionSummaries: boolean;
  dailyReminders: boolean;
  crisisHotline: boolean;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    emotionAlerts: true,
    sessionSummaries: true,
    dailyReminders: false,
    crisisHotline: true
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    fetchProfile();
    loadPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfile(user);
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone_number: user.phone_number || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = () => {
    const savedNotifications = localStorage.getItem('notificationSettings');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
    showSuccess('Notification preferences updated');
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    showSuccess(`Theme changed to ${newTheme} mode`);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setProfile(updatedUser);
      }
      
      showSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleExportData = () => {
    const data = {
      profile,
      notifications,
      theme,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mental-health-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showSuccess('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      {successMessage && (
        <motion.div
          className="success-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          ✅ {successMessage}
        </motion.div>
      )}

      <div className="settings-sections">
        {/* Profile Section */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <h2>👤 Profile Information</h2>
            {!editMode && (
              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>
          
          {editMode ? (
            <div className="profile-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="cancel-btn" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{profile?.first_name} {profile?.last_name}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{profile?.phone_number || 'Not provided'}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h2>🔔 Notification Preferences</h2>
          </div>
          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Email Notifications</h3>
                <p>Receive updates via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Emotion Alerts</h3>
                <p>Get notified about significant emotional patterns</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.emotionAlerts}
                  onChange={() => handleNotificationToggle('emotionAlerts')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Session Summaries</h3>
                <p>Receive summaries after each session</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.sessionSummaries}
                  onChange={() => handleNotificationToggle('sessionSummaries')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Daily Reminders</h3>
                <p>Get daily check-in reminders</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.dailyReminders}
                  onChange={() => handleNotificationToggle('dailyReminders')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Crisis Hotline Info</h3>
                <p>Show crisis support resources when needed</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.crisisHotline}
                  onChange={() => handleNotificationToggle('crisisHotline')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h2>🎨 Appearance</h2>
          </div>
          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Theme</h3>
                <p>Current: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={handleThemeToggle}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Data & Privacy Section */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h2>🔒 Data & Privacy</h2>
          </div>
          <div className="action-list">
            <button className="action-btn" onClick={handleExportData}>
              📥 Export My Data
            </button>
            <button className="action-btn danger">
              🗑️ Delete Account
            </button>
          </div>
        </motion.div>

        {/* Crisis Resources - Pakistan */}
        <motion.div
          className="settings-card crisis-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <h2>🆘 Crisis Resources (Pakistan)</h2>
          </div>
          <div className="crisis-info">
            <p><strong>Pakistan Emergency Services:</strong></p>
            <a href="tel:1122" className="crisis-link">🚨 1122 (Rescue Services)</a>
            
            <p><strong>Police Emergency:</strong></p>
            <a href="tel:15" className="crisis-link">👮 15 (Police Helpline)</a>
            
            <p><strong>Mental Health Crisis Line:</strong></p>
            <a href="tel:042-35761999" className="crisis-link">🧠 042-35761999 (Rozan)</a>
            
            <p><strong>Umang Pakistan Mental Health Helpline:</strong></p>
            <a href="tel:0304-1114772" className="crisis-link">💚 0304-1114772</a>
            
            <p><strong>Taskeen Health Initiative:</strong></p>
            <a href="tel:0316-8275888" className="crisis-link">📞 0316-8275888</a>
            
            <p><strong>Suicide Prevention Helpline:</strong></p>
            <a href="tel:042-35761999" className="crisis-link">🛟 042-35761999</a>
            
            <p className="crisis-note">
              Available for free, confidential mental health support. 
              If you're in immediate danger, call 1122 emergency services.
            </p>
            
            <div className="additional-resources">
              <h4>🏥 Mental Health Organizations:</h4>
              <ul>
                <li>Rozan - Gender & Mental Health Services</li>
                <li>Umang Pakistan - Youth Mental Health</li>
                <li>Taskeen - Mental Health Awareness</li>
                <li>Pakistan Association for Mental Health (PAMH)</li>
                <li>Fountain House Lahore - Psychiatric Care</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
