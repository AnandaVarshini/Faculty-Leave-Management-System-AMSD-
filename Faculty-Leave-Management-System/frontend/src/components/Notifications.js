import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/Notifications.css";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notification");
      setNotifications(res.data);
    } catch (error) {
      console.log("Error fetching notifications");
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notification/unread/count");
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.log("Error fetching unread count");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.put(`/notification/${notificationId}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.log("Error marking notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put("/notification/read/all");
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.log("Error marking all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notification/${notificationId}`);
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
      fetchUnreadCount();
    } catch (error) {
      console.log("Error deleting notification");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "leave_approved":
        return "✅";
      case "leave_rejected":
        return "❌";
      case "policy_announcement":
        return "📢";
      case "pending_reminder":
        return "⏰";
      case "leave_applied":
        return "📝";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "leave_approved":
        return "notification-approved";
      case "leave_rejected":
        return "notification-rejected";
      case "policy_announcement":
        return "notification-announcement";
      case "pending_reminder":
        return "notification-pending";
      case "leave_applied":
        return "notification-applied";
      default:
        return "";
    }
  };

  return (
    <div className="notifications-container">
      {/* Bell Icon */}
      <div className="notification-bell">
        <button
          className="bell-button"
          onClick={() => setIsOpen(!isOpen)}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${getNotificationColor(
                    notification.type
                  )} ${notification.isRead ? "read" : "unread"}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="action-btn"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteNotification(notification._id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close panel */}
      {isOpen && (
        <div
          className="notifications-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Notifications;
