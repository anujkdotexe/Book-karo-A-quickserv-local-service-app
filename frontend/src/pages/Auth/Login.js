import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear errors when user starts typing
    setError('');
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/services');
      }, 1000);
    } else {
      // Provide more specific error messages
      const errorMsg = result.message || 'Login failed';
      if (errorMsg.includes('Invalid credentials') || errorMsg.includes('password')) {
        setError('Incorrect email or password. Please try again.');
      } else if (errorMsg.includes('not found') || errorMsg.includes('User')) {
        setError('No account found with this email address.');
      } else if (errorMsg.includes('disabled') || errorMsg.includes('locked')) {
        setError('Your account has been disabled. Please contact support.');
      } else {
        setError(errorMsg);
      }
    }
    setLoading(false);
  };

  const handleQuickLogin = async (email, password) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setFormData({ email, password });

    const result = await login(email, password);

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/services');
      }, 1000);
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to Bookaro</p>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="alert alert-success" role="alert" aria-live="polite">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <span className="field-error" id="email-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  aria-required="true"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="0"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error" id="password-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-auth-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f4f8', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', marginBottom: '10px', color: '#1e3a8a', fontWeight: '600' }}>Quick Login (Test Accounts):</p>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button
                onClick={() => handleQuickLogin('user@bookaro.com', 'password123')}
                disabled={loading}
                style={{
                  padding: '8px 12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Login as User
              </button>
              <button
                onClick={() => handleQuickLogin('vendor@bookaro.com', 'password123')}
                disabled={loading}
                style={{
                  padding: '8px 12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Login as Vendor
              </button>
              <button
                onClick={() => handleQuickLogin('admin@bookaro.com', 'admin123')}
                disabled={loading}
                style={{
                  padding: '8px 12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Login as Admin
              </button>
            </div>
          </div>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
