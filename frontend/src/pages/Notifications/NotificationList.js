import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import NotificationModal from '../../components/NotificationModal/NotificationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import './NotificationList.css';

const NotificationList = () => {
  const modal = useModal();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll(page, 20);
      const data = response.data.data;
      
      if (data.content) {
        setNotifications(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      modal.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, modal]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD' && n.isRead) return false;
    if (filter === 'READ' && !n.isRead) return false;
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    return true;
  });

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    modal.confirm('Delete this notification?', {
      onConfirm: async () => {
        try {
          await notificationAPI.deleteNotification(id);
          setNotifications(notifications.filter(n => n.id !== id));
          modal.success('Notification deleted');
        } catch (error) {
          modal.error('Failed to delete notification');
        }
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      modal.success('All notifications marked as read');
    } catch (error) {
      modal.error('Failed to mark all as read');
    }
  };

  const handleDeleteAll = () => {
    modal.confirm('Delete all notifications? This action cannot be undone.', {
      onConfirm: async () => {
        try {
          await notificationAPI.deleteAllNotifications();
          setNotifications([]);
          modal.success('All notifications deleted');
        } catch (error) {
          modal.error('Failed to delete all notifications');
        }
      }
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_COMPLETED':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case 'BOOKING_CANCELLED':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'ANNOUNCEMENT':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
      case 'PAYMENT_SUCCESS':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'PAYMENT_FAILED':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'REFUND_INITIATED':
      case 'REFUND_COMPLETED':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && notifications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="notification-list-page">
      <div className="notification-header">
        <h1>All Notifications</h1>
        <div className="notification-actions">
          <button onClick={handleMarkAllAsRead} className="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Mark All Read
          </button>
          <button onClick={handleDeleteAll} className="btn-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete All
          </button>
        </div>
      </div>

      <div className="notification-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="ANNOUNCEMENT">Announcements</option>
            <option value="BOOKING_CREATED">Bookings</option>
            <option value="PAYMENT_SUCCESS">Payments</option>
            <option value="REFUND_INITIATED">Refunds</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <h2>No notifications</h2>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id, { stopPropagation: () => {} });
                  }
                  setSelectedNotification(notification);
                }}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-date">{formatDate(notification.createdAt)}</span>
                </div>
                <div className="notification-item-actions">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="btn-icon"
                      title="Mark as read"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(notification.id, e)}
                    className="btn-icon btn-delete"
                    title="Delete"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary"
              >
                Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDelete={(id) => {
            handleDelete(id, { stopPropagation: () => {} });
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationList;
