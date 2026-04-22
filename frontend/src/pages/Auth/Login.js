import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/services');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setSuccessMessage('Login successful! Redirecting...');
      
      const userData = result.userData || (() => {
        try {
          const stored = localStorage.getItem('user');
          return stored ? JSON.parse(stored) : null;
        } catch (e) {
          return null;
        }
      })();
      
      // Multi-role routing: Prioritize ADMIN > VENDOR > USER
      setTimeout(() => {
        if (userData?.roles?.includes('ADMIN') || userData?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (userData?.roles?.includes('VENDOR') || userData?.role === 'VENDOR') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (email, password) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setFormData({ email, password, rememberMe: false });

    const result = await login(email, password);

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting...');
      
      const userData = result.userData || (() => {
        try {
          const stored = localStorage.getItem('user');
          return stored ? JSON.parse(stored) : null;
        } catch (e) {
          return null;
        }
      })();
      
      // Multi-role routing: Prioritize ADMIN > VENDOR > USER
      setTimeout(() => {
        if (userData?.roles?.includes('ADMIN') || userData?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (userData?.roles?.includes('VENDOR') || userData?.role === 'VENDOR') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/');
        }
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
          <p className="auth-subtitle">Sign in to continue to Book-Karo</p>

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
                placeholder="rajesh@example.com"
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

            <div className="form-group-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label htmlFor="rememberMe" style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }} 
                />
                Remember me
              </label>
              <Link 
                to="/forgot-password" 
                className="forgot-password-link" 
                style={{ 
                  fontSize: '15px', 
                  fontWeight: '600',
                  color: 'var(--royal-blue)',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-auth-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <details open style={{ marginTop: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #2563eb' }}>
            <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#1e3a8a', userSelect: 'none' }}>
              🔑 Quick Login — Test Accounts
            </summary>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button
                onClick={() => handleQuickLogin('user@bookkaro.com', 'Password@123')}
                disabled={loading}
                style={{ padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}
              >
                👤 Login as User
              </button>
              <button
                onClick={() => handleQuickLogin('admin@bookkaro.com', 'Password@123')}
                disabled={loading}
                style={{ padding: '10px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}
              >
                🛡️ Login as Admin
              </button>
              <button
                onClick={() => handleQuickLogin('mumbai@bookkaro.com', 'Password@123')}
                disabled={loading}
                style={{ padding: '10px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}
              >
                🏪 Login as Vendor (Mumbai)
              </button>
              <button
                onClick={() => handleQuickLogin('pune@bookkaro.com', 'Password@123')}
                disabled={loading}
                style={{ padding: '10px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}
              >
                🏪 Login as Vendor (Pune)
              </button>
            </div>
            <p style={{ marginTop: '12px', fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
              All accounts use password: <strong>Password@123</strong>
            </p>
          </details>

          <p className="auth-footer" style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link" style={{ color: 'var(--royal-blue)', fontWeight: '600', textDecoration: 'none' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
