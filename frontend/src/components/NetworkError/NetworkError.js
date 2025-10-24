import React from 'react';
import './NetworkError.css';

const NetworkError = ({ onRetry, message }) => {
  return (
    <div className="network-error-container">
      <div className="network-error-content">
        <div className="network-error-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2>Connection Error</h2>
        <p>{message || 'Unable to connect to the server. Please check your internet connection and try again.'}</p>
        <div className="network-error-actions">
          <button className="btn btn-primary" onClick={onRetry}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Retry
          </button>
          <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
            Go Home
          </button>
        </div>
        <div className="offline-indicator">
          {!navigator.onLine && (
            <span className="offline-badge">
              📡 You appear to be offline
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkError;
