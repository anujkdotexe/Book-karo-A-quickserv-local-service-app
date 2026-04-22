import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import './NotificationDetail.css';

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const modal = useModal();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        const response = await notificationAPI.getById(id);
        const data = response.data.data;
        setNotification(data);
        
        // Mark as read if unread
        if (!data.isRead) {
          await notificationAPI.markAsRead(id);
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
        modal.error('Failed to load notification');
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id, modal]);

  const handleDelete = () => {
    modal.confirm('Delete this notification?', {
      onConfirm: async () => {
        try {
          await notificationAPI.deleteNotification(id);
          modal.success('Notification deleted');
          navigate('/notifications');
        } catch (error) {
          modal.error('Failed to delete notification');
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case 'BOOKING_CANCELLED':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'ANNOUNCEMENT':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
      case 'PAYMENT_SUCCESS':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'PAYMENT_FAILED':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'REFUND_INITIATED':
      case 'REFUND_COMPLETED':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
    }
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'BOOKING_CREATED': 'Booking Created',
      'BOOKING_CONFIRMED': 'Booking Confirmed',
      'BOOKING_COMPLETED': 'Booking Completed',
      'BOOKING_CANCELLED': 'Booking Cancelled',
      'ANNOUNCEMENT': 'Announcement',
      'PAYMENT_SUCCESS': 'Payment Success',
      'PAYMENT_FAILED': 'Payment Failed',
      'REFUND_INITIATED': 'Refund Initiated',
      'REFUND_COMPLETED': 'Refund Completed',
      'VENDOR_APPROVED': 'Vendor Approved',
      'VENDOR_REJECTED': 'Vendor Rejected',
      'SERVICE_APPROVED': 'Service Approved',
      'SERVICE_REJECTED': 'Service Rejected'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!notification) {
    return (
      <div className="notification-detail-page">
        <div className="notification-not-found">
          <h2>Notification not found</h2>
          <button onClick={() => navigate('/notifications')} className="btn-primary">
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-detail-page">
      <div className="notification-detail-header">
        <button onClick={() => navigate('/notifications')} className="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Notifications
        </button>
        <button onClick={handleDelete} className="btn-delete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </div>

      <div className="notification-detail-card">
        <div className="notification-detail-icon">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="notification-detail-meta">
          <span className="notification-type-badge">{getTypeLabel(notification.type)}</span>
          <span className="notification-date">{formatFullDate(notification.createdAt)}</span>
        </div>

        <h1 className="notification-detail-title">{notification.title}</h1>

        <div className="notification-detail-message">
          {notification.message}
        </div>

        {notification.bookingId && (
          <div className="notification-related-info">
            <h3>Related Booking</h3>
            <button 
              onClick={() => navigate(`/bookings/${notification.bookingId}`)}
              className="btn-secondary"
            >
              View Booking Details
            </button>
          </div>
        )}

        {notification.announcementId && (
          <div className="notification-related-info">
            <h3>Related Announcement</h3>
            <p>Announcement ID: {notification.announcementId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
