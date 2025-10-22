import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast/Toast';
import api from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setLoading(true);
    setFieldError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setEmailSent(true);
        setResetToken(response.data.data); // Token returned since no email service
        toast.success('Password reset token generated');
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMsg);
      setFieldError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Reset Token Generated</h1>
              <p>Copy the token below to reset your password</p>
            </div>

            <div className="email-sent-info">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              
              <div style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '20px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}>
                {resetToken}
              </div>

              <p style={{marginTop: '16px', fontSize: '14px', color: '#6b7280'}}>
                Note: Since email service is not configured, copy this token and use it to reset your password.
                Token expires in 24 hours.
              </p>
            </div>

            <div className="auth-footer">
              <Link to={`/reset-password?token=${resetToken}`} className="btn btn-primary btn-block">
                Reset Password Now
              </Link>
              <Link to="/login" className="btn btn-outline btn-block" style={{marginTop: '10px'}}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password</h1>
            <p>Enter your email address to receive a password reset token</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldError('');
                }}
                placeholder="Enter your email"
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? 'email-error' : undefined}
                disabled={loading}
              />
              {fieldError && (
                <span className="field-error" id="email-error" role="alert">
                  {fieldError}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Token'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
