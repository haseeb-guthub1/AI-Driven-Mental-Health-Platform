import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Notifications.css';

interface Notification {
  notification_id: number;
  notification_type: 'emotion_alert' | 'session_summary' | 'ai_suggestion' | 'wellness_tip' | 'appointment' | 'high_risk_alert';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  emotion?: string;
  severity?: 'critical' | 'high' | 'moderate' | 'low';
}

interface AppointmentNotif {
  id: number;
  type: 'appointment_accepted' | 'appointment_declined';
  clientId: number | null;
  clientName: string;
  coachId: number;
  coachName: string;
  coachSpecialization: string;
  originalDate: string;
  originalTime: string;
  suggestedDate: string | null;
  suggestedTime: string | null;
  note: string | null;
  createdAt: string;
  is_read: boolean;
}

// Mock notifications for clients (when backend unavailable)
const CLIENT_MOCK_NOTIFICATIONS: Notification[] = [
  {
    notification_id: 101,
    notification_type: 'ai_suggestion',
    title: 'AI Wellness Check-In',
    message: 'Based on your recent emotion logs, your resilience score has improved by 12% this week. Keep up the great progress! Consider trying the 5-minute mindfulness exercise in your AI Guidance session today.',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'low',
  },
  {
    notification_id: 102,
    notification_type: 'emotion_alert',
    title: 'Elevated Distress Detected',
    message: 'Your recent session showed elevated anxiety patterns (intensity 8/10). Your coach has been notified and a follow-up session has been scheduled. Please reach out if you need immediate support.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'high',
    emotion: 'anxiety',
  },
  {
    notification_id: 103,
    notification_type: 'appointment',
    title: 'Upcoming Appointment Reminder',
    message: 'You have a session scheduled tomorrow at 10:00 AM. Please ensure you are in a quiet, private space for your video session. Your coach is looking forward to speaking with you.',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'moderate',
  },
  {
    notification_id: 104,
    notification_type: 'session_summary',
    title: 'Session Summary Available',
    message: 'Your AI therapy session summary from yesterday is now ready. The session covered anxiety management techniques and your progress on the thought diary homework. View your full summary in Session History.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    severity: 'low',
  },
  {
    notification_id: 105,
    notification_type: 'wellness_tip',
    title: 'Daily Wellness Tip',
    message: 'Try the 4-7-8 breathing technique today: inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 4 times. This technique activates the parasympathetic nervous system and reduces stress within minutes.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    severity: 'low',
  },
  {
    notification_id: 106,
    notification_type: 'emotion_alert',
    title: 'Mood Pattern Alert',
    message: 'We noticed a pattern of sadness over the past 3 days. This is completely normal, but our AI recommends logging your emotions today and connecting with your coach if feelings persist.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    severity: 'moderate',
    emotion: 'sadness',
  },
];

// Mock notifications for coaches
const COACH_MOCK_NOTIFICATIONS: Notification[] = [
  {
    notification_id: 201,
    notification_type: 'high_risk_alert',
    title: '🚨 Critical Alert — Nadia Shah',
    message: 'Client Nadia Shah has logged a critical emotional state (grief, intensity 9/10, risk score 89%). Crisis intervention protocols have been automatically activated. Immediate review recommended.',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'critical',
    emotion: 'grief',
  },
  {
    notification_id: 202,
    notification_type: 'appointment',
    title: 'Upcoming Session — Marcus Wright',
    message: 'You have a session with Marcus Wright tomorrow at 10:00 AM. This is a follow-up grief processing session. Previous notes: responding well to journaling techniques.',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'moderate',
  },
  {
    notification_id: 203,
    notification_type: 'emotion_alert',
    title: 'High Risk — Marcus Wright',
    message: 'Client Marcus Wright logged high sadness (intensity 7/10, risk score 71%). Regular monitoring required. Client has a scheduled session in 2 days.',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'high',
    emotion: 'sadness',
  },
  {
    notification_id: 204,
    notification_type: 'appointment',
    title: 'Session Cancelled — Sara Malik',
    message: 'Client Sara Malik cancelled the session scheduled for today at 1:00 PM. The session has been rescheduled to next week. Please review and confirm the new time slot.',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    is_read: false,
    severity: 'moderate',
  },
  {
    notification_id: 205,
    notification_type: 'session_summary',
    title: 'Session Summary — Alice Thompson',
    message: "Yesterday's session with Alice Thompson (Anxiety, CBT) has been summarised by AI. Key highlights: significant improvement in thought distortion recognition. Client completed all homework assignments.",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    severity: 'low',
  },
  {
    notification_id: 206,
    notification_type: 'session_summary',
    title: 'Weekly Progress Report Ready',
    message: '6 sessions completed this week. 2 high-risk clients identified (Nadia Shah, Marcus Wright). 1 client (Hana Lee) reached a progress milestone. Full analytics available in your Coach Dashboard.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    severity: 'low',
  },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [clientId, setClientId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('client');
  const [apptNotifs, setApptNotifs] = useState<AppointmentNotif[]>([]);
  const [rebookId, setRebookId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const id = user.id || user.client_id || user.user_id;
      const role = (user.role || 'client').toLowerCase();
      setClientId(id);
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    if (userRole === 'coach') {
      setNotifications(COACH_MOCK_NOTIFICATIONS);
      setLoading(false);
      return;
    }
    if (clientId) {
      fetchNotifications();
    }
  }, [clientId, userRole]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const role = (user.role || 'client').toLowerCase();
    if (role === 'coach') return;
    const userId = user.id || user.client_id;
    const stored = JSON.parse(localStorage.getItem('mindwell_notifications') || '[]') as AppointmentNotif[];
    const mine = stored.filter((n: AppointmentNotif) => n.clientId == null || n.clientId === userId);
    setApptNotifs(mine);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/notifications/?client_id=${clientId}`);
      const data = response.data;
      // If backend returns data, use it; otherwise fall back to mock data
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      } else {
        setNotifications(CLIENT_MOCK_NOTIFICATIONS);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fall back to mock data when backend is unavailable
      setNotifications(CLIENT_MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    // Update local state immediately
    setNotifications(prev =>
      prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
    );
    // Attempt backend sync (non-blocking)
    try {
      await axios.put(`http://127.0.0.1:8000/api/notifications/${id}/`, { is_read: true });
    } catch { /* silent — local state already updated */ }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await axios.post('http://127.0.0.1:8000/api/notifications/mark-all-read/', { client_id: clientId });
    } catch { /* silent */ }
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
    try {
      axios.delete(`http://127.0.0.1:8000/api/notifications/${id}/`);
    } catch { /* silent */ }
  };

  const formatApptDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const markApptNotifRead = (id: number) => {
    setApptNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    const stored = JSON.parse(localStorage.getItem('mindwell_notifications') || '[]');
    localStorage.setItem('mindwell_notifications', JSON.stringify(
      stored.map((n: AppointmentNotif) => n.id === id ? { ...n, is_read: true } : n)
    ));
  };

  const deleteApptNotif = (id: number) => {
    setApptNotifs(prev => prev.filter(n => n.id !== id));
    const stored = JSON.parse(localStorage.getItem('mindwell_notifications') || '[]');
    localStorage.setItem('mindwell_notifications', JSON.stringify(
      stored.filter((n: AppointmentNotif) => n.id !== id)
    ));
  };

  const handleRebook = (notif: AppointmentNotif) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newAppt = {
      id: Date.now(),
      clientName: notif.clientName,
      clientId: notif.clientId,
      coachId: notif.coachId,
      coachName: notif.coachName,
      coachSpecialization: notif.coachSpecialization,
      date: notif.suggestedDate!,
      time: notif.suggestedTime!,
      notes: 'Rebooked at coach-suggested time',
      status: 'pending',
      bookedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('mindwell_appointments') || '[]');
    existing.push(newAppt);
    localStorage.setItem('mindwell_appointments', JSON.stringify(existing));
    setRebookId(notif.id);
    markApptNotifRead(notif.id);
    // suppress unused variable warning — user object read for future extension
    void user;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emotion_alert':    return '🚨';
      case 'high_risk_alert':  return '🆘';
      case 'session_summary':  return '📝';
      case 'ai_suggestion':    return '💡';
      case 'wellness_tip':     return '🌟';
      case 'appointment':      return '📅';
      default:                 return '📬';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.is_read);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-left">
          <h1>🔔 Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="header-actions">
          <button
            className="filter-btn"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Real-time appointment accept/decline notifications */}
      {apptNotifs.length > 0 && userRole !== 'coach' && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 Appointment Updates
            {apptNotifs.filter(n => !n.is_read).length > 0 && (
              <span style={{ background: '#4F46E5', color: 'white', borderRadius: 20, padding: '1px 9px', fontSize: '0.72rem', fontWeight: 800 }}>
                {apptNotifs.filter(n => !n.is_read).length} new
              </span>
            )}
          </h2>
          {apptNotifs.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: notif.type === 'appointment_accepted' ? '#F0FDF4' : '#FEF2F2',
                border: `1.5px solid ${notif.type === 'appointment_accepted' ? '#86EFAC' : '#FECACA'}`,
                borderLeft: `5px solid ${notif.type === 'appointment_accepted' ? '#059669' : '#EF4444'}`,
                borderRadius: 12, padding: '16px 20px', marginBottom: 10,
                opacity: notif.is_read ? 0.7 : 1, cursor: 'pointer',
              }}
              onClick={() => markApptNotifRead(notif.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {notif.type === 'appointment_accepted' ? '✅' : '❌'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: notif.type === 'appointment_accepted' ? '#166534' : '#991B1B', marginBottom: 4 }}>
                    {notif.type === 'appointment_accepted' ? 'Appointment Confirmed!' : 'Appointment Declined'}
                  </div>

                  {notif.type === 'appointment_accepted' ? (
                    <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 6px' }}>
                      <strong>{notif.coachName}</strong> accepted your session on{' '}
                      <strong>{formatApptDate(notif.originalDate)}</strong> at <strong>{notif.originalTime}</strong>.
                      See you then!
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.85rem', color: '#991B1B', margin: '0 0 8px' }}>
                        <strong>{notif.coachName}</strong> declined your appointment on{' '}
                        {formatApptDate(notif.originalDate)} at {notif.originalTime}.
                        {notif.note && (
                          <span style={{ fontStyle: 'italic' }}> — "{notif.note}"</span>
                        )}
                      </p>
                      {notif.suggestedDate && notif.suggestedTime && (
                        rebookId === notif.id ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '8px 12px', fontSize: '0.83rem', color: '#166534', fontWeight: 700 }}>
                            ✅ Rebooked for {formatApptDate(notif.suggestedDate)} at {notif.suggestedTime}
                          </div>
                        ) : (
                          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px' }}>
                            <p style={{ fontSize: '0.82rem', color: '#92400E', margin: '0 0 8px', fontWeight: 600 }}>
                              🗓️ Coach is free: <strong>{formatApptDate(notif.suggestedDate)}</strong> at <strong>{notif.suggestedTime}</strong>
                            </p>
                            <button
                              onClick={e => { e.stopPropagation(); handleRebook(notif); }}
                              style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                            >
                              Book Suggested Time
                            </button>
                          </div>
                        )
                      )}
                      {!notif.suggestedDate && (
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, fontStyle: 'italic' }}>
                          No alternative time was suggested. Please contact your coach directly.
                        </p>
                      )}
                    </>
                  )}

                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 6 }}>
                    {getTimeAgo(notif.createdAt)}
                    {!notif.is_read && <span style={{ color: '#4F46E5', fontWeight: 700 }}> • New</span>}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteApptNotif(notif.id); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 4 }}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p>📭</p>
            <h3>All caught up!</h3>
            <p>No {filter === 'unread' ? 'unread ' : ''}notifications at the moment.</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.notification_id}
              className={`notification-card ${notification.is_read ? 'read' : 'unread'} ${notification.severity || ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => markAsRead(notification.notification_id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-meta">
                  <span className="time-ago">{getTimeAgo(notification.created_at)}</span>
                  {notification.emotion && (
                    <span className="emotion-tag">{notification.emotion}</span>
                  )}
                  {notification.severity && notification.severity !== 'low' && (
                    <span className={`severity-tag ${notification.severity}`}>
                      {notification.severity}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={e => { e.stopPropagation(); deleteNotification(notification.notification_id); }}
              >
                ✕
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
