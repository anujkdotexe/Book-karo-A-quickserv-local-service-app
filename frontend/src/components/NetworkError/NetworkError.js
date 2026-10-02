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
            <span className="offline-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }} aria-hidden="true">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              You appear to be offline
            </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;
