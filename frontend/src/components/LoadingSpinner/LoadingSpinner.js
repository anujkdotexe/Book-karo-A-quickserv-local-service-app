import React, { useEffect, useRef } from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium', fullScreen = false }) => {
  const spinnerRef = useRef(null);

  useEffect(() => {
    if (spinnerRef.current) {
      const totalBars = 12;
      
      for (let i = 0; i < totalBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const angle = (360 / totalBars) * i;
        bar.style.transform = `rotate(${angle}deg) translateY(-30px)`;
        bar.style.animationDelay = `${(i * 0.1).toFixed(1)}s`;
        
        const blueValue = Math.floor(180 + (i * 6));
        bar.style.backgroundColor = `rgb(${Math.floor(blueValue * 0.6)}, ${Math.floor(blueValue * 0.9)}, ${blueValue})`;
        
        spinnerRef.current.appendChild(bar);
      }
    }
  }, []);

  return (
    <div className={`loading-spinner-container ${fullScreen ? 'fullscreen' : ''} size-${size}`}>
      <div className="spinner" ref={spinnerRef}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
