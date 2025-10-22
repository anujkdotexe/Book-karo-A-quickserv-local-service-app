import React, { createContext, useContext, useState, useCallback } from 'react';
import './Modal.css';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const showModal = useCallback((config) => {
    setModal({
      id: Date.now(),
      ...config,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  const success = useCallback((message, options = {}) => {
    showModal({
      type: 'success',
      title: options.title || 'Success',
      message,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || 'OK',
      showCancel: false,
    });
  }, [showModal]);

  const error = useCallback((message, options = {}) => {
    showModal({
      type: 'error',
      title: options.title || 'Error',
      message,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || 'OK',
      showCancel: false,
    });
  }, [showModal]);

  const info = useCallback((message, options = {}) => {
    showModal({
      type: 'info',
      title: options.title || 'Information',
      message,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || 'OK',
      showCancel: false,
    });
  }, [showModal]);

  const warning = useCallback((message, options = {}) => {
    showModal({
      type: 'warning',
      title: options.title || 'Warning',
      message,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || 'OK',
      showCancel: false,
    });
  }, [showModal]);

  const confirm = useCallback((message, options = {}) => {
    showModal({
      type: 'confirm',
      title: options.title || 'Confirm Action',
      message,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true,
    });
  }, [showModal]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal, success, error, info, warning, confirm }}>
      {children}
      {modal && (
        <ModalDialog
          {...modal}
          onClose={hideModal}
        />
      )}
    </ModalContext.Provider>
  );
};

const ModalDialog = ({
  type = 'info',
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onClose,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      handleCancel();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="modal-icon modal-icon-success" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );
      case 'error':
        return (
          <svg className="modal-icon modal-icon-error" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="modal-icon modal-icon-warning" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'confirm':
        return (
          <svg className="modal-icon modal-icon-confirm" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </svg>
        );
      default:
        return (
          <svg className="modal-icon modal-icon-info" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        
        <div className="modal-body">
          <div className="modal-icon-wrapper">
            {getIcon()}
          </div>
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button
              className="modal-btn modal-btn-secondary"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className="modal-btn modal-btn-primary"
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDialog;
