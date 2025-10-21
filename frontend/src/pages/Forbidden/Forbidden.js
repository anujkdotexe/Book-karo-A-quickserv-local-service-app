import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Forbidden.css';

/**
 * 403 Forbidden Page
 * Displayed when user tries to access a route they don't have permission for
 */
const Forbidden = () => {
  const { user } = useAuth();

  return (
    <div className="forbidden-container">
      <div className="forbidden-content">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="forbidden-icon">
          <circle cx="80" cy="80" r="70" stroke="#ef4444" strokeWidth="4" fill="none" />
          <line x1="50" y1="50" x2="110" y2="110" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <line x1="110" y1="50" x2="50" y2="110" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        </svg>
        
        <h1>403 - Access Forbidden</h1>
        <p className="forbidden-message">
          You don't have permission to access this page.
        </p>
        
        {user && (
          <p className="current-role">
            Your current role: <strong>{user.role}</strong>
          </p>
        )}
        
        <div className="forbidden-actions">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          
          {user && user.role === 'USER' && (
            <Link to="/services" className="btn btn-outline">
              Browse Services
            </Link>
          )}
          
          {user && user.role === 'VENDOR' && (
            <Link to="/vendor/dashboard" className="btn btn-outline">
              Go to Dashboard
            </Link>
          )}
          
          {user && user.role === 'ADMIN' && (
            <Link to="/admin/dashboard" className="btn btn-outline">
              Go to Dashboard
            </Link>
          )}
        </div>
        
        <div className="forbidden-help">
          <p>If you believe this is an error, please contact support:</p>
          <Link to="/contact" className="contact-link">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
