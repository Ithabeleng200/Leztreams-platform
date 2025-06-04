import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Notification.css';

const Notification = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/');
      if (response.data) {
        const newNotifications = response.data;
        setNotifications(newNotifications);
        const newUnreadCount = newNotifications.filter(n => !n.is_read).length;
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await axios.post(`/api/notifications/${notification.id}/mark-read/`);
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Handle navigation based on notification type
    switch (notification.notification_type) {
      case 'chat_message':
        navigate(`/chat/${notification.related_id}`);
        break;
      case 'artwork_comment':
      case 'artwork_rating':
        navigate(`/artwork/${notification.related_id}`);
        break;
      case 'mentor_request':
        navigate(`/mentorship/requests/${notification.related_id}`);
        break;
      case 'session_reminder':
        navigate(`/mentorship/sessions/${notification.related_id}`);
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat_message':
        return 'fas fa-comments';
      case 'artwork_comment':
        return 'fas fa-comment';
      case 'artwork_rating':
        return 'fas fa-star';
      case 'mentor_request':
        return 'fas fa-handshake';
      case 'session_reminder':
        return 'fas fa-calendar-alt';
      default:
        return 'fas fa-bell';
    }
  };

  return (
    <div className="notification-container">
      <button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifications">No notifications</p>
          ) : (
            <div className="notification-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <i className={getNotificationIcon(notification.notification_type)}></i>
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;