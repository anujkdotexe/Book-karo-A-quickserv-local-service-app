import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ notification, onClose, onDelete }) => {
  if (!notification) return null;

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
      case 'SYSTEM':
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_COMPLETED':
      case 'PAYMENT_SUCCESS':
      case 'REFUND_COMPLETED':
        return 'success';
      case 'BOOKING_CANCELLED':
      case 'PAYMENT_FAILED':
        return 'error';
      case 'ANNOUNCEMENT':
        return 'info';
      case 'REFUND_INITIATED':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="notification-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-modal-header">
          <div className={`notification-modal-icon ${getIconColor(notification.type)}`}>
            {getNotificationIcon(notification.type)}
          </div>
          <button className="notification-modal-close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="notification-modal-body">
          <h2 className="notification-modal-title">{notification.title}</h2>
          
          <div className="notification-modal-meta">
            <span className={`notification-type-badge ${notification.type.toLowerCase().replace(/_/g, '-')}`}>
              {notification.type.replace(/_/g, ' ')}
            </span>
            <span className="notification-modal-date">
              {formatDateTime(notification.createdAt)}
            </span>
          </div>

          <div className="notification-modal-message">
            {notification.message}
          </div>

          {notification.actionUrl && (
            <div className="notification-modal-action">
              <a href={notification.actionUrl} className="notification-action-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                View Details
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notification-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {onDelete && (
            <button 
              className="btn-delete" 
              onClick={() => {
                onDelete(notification.id);
                onClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
