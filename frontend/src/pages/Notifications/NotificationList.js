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
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll(page, 20);
      const data = response.data.data;
      
      if (data && data.content) {
        setNotifications(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotifications(Array.isArray(data) ? data : []);
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'BOOKINGS') return n.type?.startsWith('BOOKING_');
    if (activeTab === 'PAYMENTS') return n.type?.startsWith('PAYMENT_');
    if (activeTab === 'ANNOUNCEMENTS') return n.type === 'ANNOUNCEMENT';
    if (activeTab === 'REFUNDS') return n.type?.startsWith('REFUND_');
    return true; // ALL
  });

  const handleMarkAsRead = async (id, event) => {
    if (event?.stopPropagation) event.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id, event) => {
    if (event?.stopPropagation) event.stopPropagation();
    modal.confirm('Are you sure you want to delete this notification?', {
      title: 'Delete Notification',
      confirmText: 'Delete',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await notificationAPI.deleteNotification(id);
          setNotifications(prev => prev.filter(n => n.id !== id));
          modal.success('Notification removed');
        } catch (error) {
          modal.error('Failed to delete notification');
        }
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      modal.success('All notifications marked as read');
    } catch (error) {
      modal.error('Failed to mark all as read');
    }
  };

  const handleDeleteAll = () => {
    modal.confirm('Are you sure you want to clear all notifications? This cannot be undone.', {
      title: 'Clear Notifications',
      confirmText: 'Clear All',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await notificationAPI.deleteAllNotifications();
          setNotifications([]);
          modal.success('All notifications cleared');
        } catch (error) {
          modal.error('Failed to clear notifications');
        }
      }
    });
  };

  const getTypeMeta = (type) => {
    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_CONFIRMED':
        return {
          label: 'Booking',
          className: 'type-booking',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        };
      case 'BOOKING_COMPLETED':
        return {
          label: 'Completed',
          className: 'type-completed',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )
        };
      case 'BOOKING_CANCELLED':
        return {
          label: 'Cancelled',
          className: 'type-cancelled',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )
        };
      case 'PAYMENT_SUCCESS':
        return {
          label: 'Payment',
          className: 'type-payment',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          )
        };
      case 'PAYMENT_FAILED':
        return {
          label: 'Failed Payment',
          className: 'type-payment-failed',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )
        };
      case 'ANNOUNCEMENT':
        return {
          label: 'Announcement',
          className: 'type-announcement',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          )
        };
      case 'REFUND_INITIATED':
      case 'REFUND_COMPLETED':
        return {
          label: 'Refund',
          className: 'type-refund',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          )
        };
      default:
        return {
          label: 'Notice',
          className: 'type-default',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          )
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading && notifications.length === 0) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  const tabs = [
    { id: 'ALL', label: 'All', count: notifications.length },
    { id: 'UNREAD', label: 'Unread', count: unreadCount, highlight: unreadCount > 0 },
    { id: 'BOOKINGS', label: 'Bookings' },
    { id: 'PAYMENTS', label: 'Payments' },
    { id: 'ANNOUNCEMENTS', label: 'Announcements' },
    { id: 'REFUNDS', label: 'Refunds' },
  ];

  return (
    <div className="notification-list-page">
      <div className="notification-header-card">
        <div className="notification-title-block">
          <div className="notification-title-row">
            <h1>Notifications</h1>
            {unreadCount > 0 ? (
              <span className="unread-counter-badge">{unreadCount} unread</span>
            ) : (
              <span className="all-read-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                All caught up
              </span>
            )}
          </div>
          <p className="notification-subtitle">
            Stay updated on your service bookings, transaction receipts, and announcements.
          </p>
        </div>

        <div className="notification-top-actions">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead} 
              className="btn-mark-all"
              title="Mark all notifications as read"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={handleDeleteAll} 
              className="btn-clear-all"
              title="Clear all notifications"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="notification-tabs-bar" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`tab-count ${tab.highlight ? 'highlight' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications-card">
          <div className="no-notifications-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3>No notifications in this view</h3>
          <p>
            {activeTab === 'UNREAD' 
              ? "You've read all your notifications!" 
              : "You're all caught up. New updates and alerts will appear here."}
          </p>
          {activeTab !== 'ALL' && (
            <button className="btn-view-all-reset" onClick={() => setActiveTab('ALL')}>
              View All Notifications
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="notifications-feed">
            {filteredNotifications.map((notification) => {
              const meta = getTypeMeta(notification.type);
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification.id}
                  className={`notification-card ${isUnread ? 'is-unread' : ''}`}
                  onClick={() => {
                    if (isUnread) {
                      handleMarkAsRead(notification.id);
                    }
                    setSelectedNotification(notification);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNotification(notification);
                    }
                  }}
                >
                  <div className={`notification-icon-bubble ${meta.className}`} aria-hidden="true">
                    {meta.icon}
                  </div>

                  <div className="notification-main-content">
                    <div className="notification-meta-row">
                      <span className={`category-tag ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="notification-timestamp">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    <div className="notification-title-line">
                      <h4>{notification.title}</h4>
                      {isUnread && <span className="unread-dot" title="Unread" />}
                    </div>

                    <p className="notification-message-text">{notification.message}</p>
                  </div>

                  <div className="notification-card-actions" onClick={(e) => e.stopPropagation()}>
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="action-icon-btn check-btn"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="action-icon-btn delete-btn"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="notification-pagination">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-page-nav"
              >
                Previous
              </button>
              <span className="page-indicator">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-page-nav"
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
            handleDelete(id);
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationList;
