import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner spinner-${size}`}></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`spinner spinner-${size}`}></div>
    </div>
  );
};

export default LoadingSpinner;
