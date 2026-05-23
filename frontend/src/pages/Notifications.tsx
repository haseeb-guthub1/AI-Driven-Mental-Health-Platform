import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Notifications.css';

interface Notification {
  notification_id: number;
  notification_type: 'emotion_alert' | 'session_summary' | 'ai_suggestion' | 'wellness_tip';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  emotion?: string;
  severity?: 'critical' | 'high' | 'moderate' | 'low';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [clientId, setClientId] = useState<number | null>(null);

  useEffect(() => {
    // Get client ID from user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const id = user.id || user.client_id || user.user_id;
      setClientId(id);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchNotifications();
    }
  }, [clientId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications from backend (auto-generates from emotion data)
      const response = await axios.get(`http://127.0.0.1:8000/api/notifications/?client_id=${clientId}`);
      
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/notifications/${id}/`, {
        is_read: true
      });
      setNotifications(prev =>
        prev.map(notif => notif.notification_id === id ? { ...notif, is_read: true } : notif)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/notifications/mark-all-read/', {
        client_id: clientId
      });
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/notifications/${id}/`);
      setNotifications(prev => prev.filter(notif => notif.notification_id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emotion_alert': return '🚨';
      case 'session_summary': return '📝';
      case 'ai_suggestion': return '💡';
      case 'wellness_tip': return '🌟';
      default: return '📬';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
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

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p>📭</p>
            <h3>All caught up!</h3>
            <p>No new notifications at the moment.</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.notification_id}
              className={`notification-card ${notification.is_read ? 'read' : 'unread'} ${notification.severity}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
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
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.notification_id);
                }}
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
