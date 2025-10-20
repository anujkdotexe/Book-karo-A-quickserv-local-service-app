import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    // Clear field error when user starts typing
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    
    // First Name validation
    if (!formData.firstName || formData.firstName.trim().length === 0) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last Name validation
    if (!formData.lastName || formData.lastName.trim().length === 0) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Phone validation
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Address fields are optional but validated if provided
    if (formData.city && formData.city.trim().length < 2) {
      errors.city = 'City name must be at least 2 characters';
    }
    
    if (formData.state && formData.state.trim().length < 2) {
      errors.state = 'State name must be at least 2 characters';
    }
    
    if (formData.postalCode && !/^\d{5,6}$/.test(formData.postalCode)) {
      errors.postalCode = 'Postal code must be 5-6 digits';
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

    const result = await register(formData);

    if (result.success) {
      navigate('/services');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Bookaro today</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                />
                {fieldErrors.firstName && (
                  <span className="field-error" id="firstName-error" role="alert">
                    {fieldErrors.firstName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                />
                {fieldErrors.lastName && (
                  <span className="field-error" id="lastName-error" role="alert">
                    {fieldErrors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
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
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength="8"
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
              {!fieldErrors.password && (
                <small>Must contain uppercase, lowercase, and number</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                required
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              />
              {fieldErrors.phone && (
                <span className="field-error" id="phone-error" role="alert">
                  {fieldErrors.phone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  aria-invalid={!!fieldErrors.city}
                  aria-describedby={fieldErrors.city ? 'city-error' : undefined}
                />
                {fieldErrors.city && (
                  <span className="field-error" id="city-error" role="alert">
                    {fieldErrors.city}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  aria-invalid={!!fieldErrors.state}
                  aria-describedby={fieldErrors.state ? 'state-error' : undefined}
                />
                {fieldErrors.state && (
                  <span className="field-error" id="state-error" role="alert">
                    {fieldErrors.state}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                  aria-invalid={!!fieldErrors.postalCode}
                  aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
                />
                {fieldErrors.postalCode && (
                  <span className="field-error" id="postalCode-error" role="alert">
                    {fieldErrors.postalCode}
                  </span>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-auth-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
