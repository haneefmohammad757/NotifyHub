import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './NotificationDropdown.css';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError('Unable to load notifications.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => fetchNotifications(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!open) {
      fetchNotifications(true);
    }
    setOpen(!open);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification.id}/read`, {});
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    
    setOpen(false);

    if (notification.type === 'ANNOUNCEMENT') {
      navigate('/student');
    } else if (notification.type === 'QUERY_RESPONSE') {
      navigate('/student/queries');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        className="notification-trigger" 
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg className="bell-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-btn">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-content">
            {loading ? (
              <div className="notification-state">Loading notifications...</div>
            ) : error ? (
              <div className="notification-state error">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="notification-state">
                <p>No notifications yet.</p>
                <span className="state-sub">You're all caught up.</span>
              </div>
            ) : (
              <ul className="notification-list">
                {notifications.map(n => (
                  <li 
                    key={n.id} 
                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNotificationClick(n); }}
                  >
                    <div className="notification-item-header">
                      <span className="notification-type-icon">
                        {!n.read ? '🔵' : '○'}
                      </span>
                      <strong className="notification-title">{n.title}</strong>
                    </div>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{formatTime(n.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
