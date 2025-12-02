import React, { useEffect, useRef } from 'react';
import './ErrorModal.css';

const ErrorModal = ({ 
  title = 'Error', 
  message = 'An error occurred. Please try again.', 
  onRefresh, 
  onClose,
  showRefresh = true 
}) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    // Focus trap - focus the modal when it opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Handle ESC key to close modal
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    // Trap focus within modal
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        } else if (e.shiftKey && document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [onClose]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="error-modal-backdrop" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-message"
    >
      <div 
        ref={modalRef}
        className="error-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          ref={closeButtonRef}
          className="error-modal-close" 
          onClick={handleClose}
          aria-label="Close error modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="error-modal-header">
          <h2 id="error-modal-title" className="error-modal-title">{title}</h2>
        </div>

        <div className="error-modal-body">
          <div className="error-modal-icon-wrapper">
            <div className="error-modal-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <p id="error-modal-message" className="error-modal-message">{message}</p>
        </div>

        {showRefresh && (
          <div className="error-modal-footer">
            <button 
              className="error-modal-btn error-modal-btn-refresh" 
              onClick={handleRefresh}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorModal;
