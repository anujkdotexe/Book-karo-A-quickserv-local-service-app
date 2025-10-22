import React from 'react';
import './LoadingSpinner.css';

/**
 * Unified LoadingSpinner component for consistent loading states across the application
 * @param {string} message - Optional custom loading message
 * @param {string} size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} fullScreen - If true, displays as full-screen overlay
 */
const LoadingSpinner = ({ message = 'Loading...', size = 'medium', fullScreen = false }) => {
  const spinnerClass = `loading-spinner-container ${fullScreen ? 'fullscreen' : ''} size-${size}`;
  
  return (
    <div className={spinnerClass}>
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
