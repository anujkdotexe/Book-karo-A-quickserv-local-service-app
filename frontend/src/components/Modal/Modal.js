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
      autoDismiss: options.autoDismiss !== false ? 3000 : false, // Auto-dismiss after 3s by default
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
      autoDismiss: false, // Errors don't auto-dismiss
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
      autoDismiss: options.autoDismiss !== false ? 4000 : false, // Auto-dismiss after 4s
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

  const prompt = useCallback((message, options = {}) => {
    showModal({
      type: 'prompt',
      title: options.title || 'Input Required',
      message,
      placeholder: options.placeholder || 'Enter text...',
      defaultValue: options.defaultValue || '',
      inputType: options.inputType || 'text',
      maxLength: options.maxLength,
      minLength: options.minLength,
      required: options.required !== false,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmText: options.confirmText || 'Submit',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true,
      validation: options.validation,
    });
  }, [showModal]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal, success, error, info, warning, confirm, prompt }}>
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
  autoDismiss,
  onClose,
  placeholder = '',
  defaultValue = '',
  inputType = 'text',
  maxLength,
  minLength,
  required = true,
  validation,
}) => {
  const [inputValue, setInputValue] = React.useState(defaultValue);
  const [inputError, setInputError] = React.useState('');
  const inputRef = React.useRef(null);

  // Focus input on mount for prompt modals
  React.useEffect(() => {
    if (type === 'prompt' && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [type]);

  // Auto-dismiss effect
  React.useEffect(() => {
    if (autoDismiss && typeof autoDismiss === 'number') {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismiss);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  const validateInput = () => {
    if (type !== 'prompt') return true;

    // Check required
    if (required && !inputValue.trim()) {
      setInputError('This field is required');
      return false;
    }

    // Check min length
    if (minLength && inputValue.trim().length < minLength) {
      setInputError(`Please enter at least ${minLength} characters`);
      return false;
    }

    // Check max length
    if (maxLength && inputValue.length > maxLength) {
      setInputError(`Maximum ${maxLength} characters allowed`);
      return false;
    }

    // Custom validation
    if (validation && typeof validation === 'function') {
      const validationResult = validation(inputValue);
      if (validationResult !== true) {
        setInputError(validationResult || 'Invalid input');
        return false;
      }
    }

    setInputError('');
    return true;
  };

  const handleConfirm = () => {
    if (type === 'prompt') {
      if (!validateInput()) {
        return;
      }
      if (onConfirm) {
        onConfirm(inputValue.trim());
      }
    } else {
      if (onConfirm) {
        onConfirm();
      }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type === 'prompt') {
      e.preventDefault();
      handleConfirm();
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
      case 'prompt':
        return (
          <svg className="modal-icon modal-icon-prompt" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
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
          
          {type === 'prompt' && (
            <div className="modal-input-group">
              <textarea
                ref={inputRef}
                className={`modal-input ${inputError ? 'modal-input-error' : ''}`}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputError('');
                }}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                rows={inputType === 'textarea' ? 4 : 3}
              />
              {maxLength && (
                <div className="modal-input-counter">
                  {inputValue.length} / {maxLength}
                </div>
              )}
              {inputError && (
                <div className="modal-input-error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {inputError}
                </div>
              )}
            </div>
          )}
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
            autoFocus={type !== 'prompt'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDialog;
