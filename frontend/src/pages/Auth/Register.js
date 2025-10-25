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
    countryCode: '+91',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [validFields, setValidFields] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Common email domains for autocomplete
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'];

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    };
    
    // Score calculation
    if (checks.length) score += 20;
    if (password.length >= 12) score += 10;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.number) score += 15;
    if (checks.special) score += 15;
    
    // Determine strength label and color
    if (score < 40) return { score, label: 'Weak', color: '#ef4444' };
    if (score < 60) return { score, label: 'Fair', color: '#f59e0b' };
    if (score < 80) return { score, label: 'Good', color: '#3b82f6' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  // Real-time field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return null;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
        const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'bookkaro.com', 'reddit.com', 'protonmail.com', 'aol.com'];
        const validTLDs = ['com', 'in', 'org', 'net', 'edu', 'gov', 'co.in', 'io', 'co', 'uk', 'ca', 'au','.in'];
        const domain = value.split('@')[1];
        const tld = domain?.split('.').slice(-2).join('.') || domain?.split('.').pop();
        return validDomains.includes(domain) || validTLDs.includes(tld);
      
      case 'phone':
        if (!value) return null;
        const phoneDigits = value.replace(/\D/g, '');
        if (formData.countryCode === '+91') {
          return /^[6-9]\d{9}$/.test(phoneDigits);
        }
        return phoneDigits.length >= 10;
      
      case 'firstName':
      case 'lastName':
        return value && value.trim().length >= 2;
      
      case 'city':
      case 'state':
        if (!value) return null;
        return value.trim().length >= 2;
      
      case 'postalCode':
        if (!value) return null;
        return /^\d{6}$/.test(value);
      
      default:
        return null;
    }
  };

  // Phone number auto-formatting
  const formatPhoneNumber = (value, countryCode) => {
    const digits = value.replace(/\D/g, '');
    
    if (countryCode === '+91') {
      // India: Format as XXXXX-XXXXX
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)}-${digits.slice(5, 10)}`;
    } else if (countryCode === '+1') {
      // USA: Format as XXX-XXX-XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    
    return value; // No formatting for other countries
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Apply phone formatting
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value, formData.countryCode);
    }
    
    // Email autocomplete suggestions
    if (name === 'email') {
      if (value.includes('@') && !value.includes('.', value.indexOf('@'))) {
        const [username, partialDomain] = value.split('@');
        if (partialDomain) {
          const matches = commonDomains
            .filter(domain => domain.toLowerCase().startsWith(partialDomain.toLowerCase()))
            .map(domain => `${username}@${domain}`);
          setEmailSuggestions(matches);
          setShowSuggestions(matches.length > 0);
        } else {
          setEmailSuggestions(commonDomains.map(domain => `${username}@${domain}`));
          setShowSuggestions(true);
        }
      } else {
        setShowSuggestions(false);
      }
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
    setError('');
    
    // Clear field error when user starts typing
    setFieldErrors({ ...fieldErrors, [name]: '' });
    
    // Real-time validation
    const isValid = validateField(name, processedValue);
    if (isValid !== null) {
      setValidFields({ ...validFields, [name]: isValid });
    }
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(processedValue));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, email: suggestion });
    setShowSuggestions(false);
    // Trigger validation for the selected email
    const isValid = validateField('email', suggestion);
    setValidFields({ ...validFields, email: isValid });
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
    
    // Enhanced email validation with typo detection
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      // Check for valid domains or TLDs
      const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'bookkaro.com', 'reddit.com', 'protonmail.com', 'aol.com'];
      const validTLDs = ['com', 'in', 'org', 'net', 'edu', 'gov', 'co.in', 'io', 'co', 'uk', 'ca', 'au'];
      const domain = formData.email.split('@')[1];
      const tld = domain?.split('.').slice(-2).join('.') || domain?.split('.').pop();
      
      if (!validDomains.includes(domain) && !validTLDs.includes(tld)) {
        errors.email = 'Please use a valid email domain';
      }
      
      // Common typo detection
      const typos = {
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmil.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com'
      };
      if (typos[domain]) {
        errors.email = `Did you mean ${formData.email.replace(domain, typos[domain])}?`;
      }
    }
    
    // Enhanced password validation with special character requirement
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 64) {
      errors.password = 'Password must not exceed 64 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*()_+\-=[\]{}|;:,.<>?])/.test(formData.password)) {
      errors.password = 'Password must contain: uppercase, lowercase, number, and special character (@#$%^&*...)';
    }
    
    // Enhanced phone validation - exactly 10 digits for Indian numbers
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (formData.countryCode === '+91') {
        // India: Exactly 10 digits, starts with 6-9
        if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
          errors.phone = 'Enter a valid 10-digit mobile number starting with 6-9';
        }
      } else if (formData.countryCode === '+1') {
        // USA: Exactly 10 digits
        if (!/^\d{10}$/.test(phoneDigits)) {
          errors.phone = 'Enter a valid 10-digit phone number';
        }
      } else {
        // Other countries: 10-15 digits
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
          errors.phone = 'Phone number must be 10-15 digits';
        }
      }
    }
    
    // Address fields are optional but validated if provided
    if (formData.city && formData.city.trim().length < 2) {
      errors.city = 'City name must be at least 2 characters';
    }
    
    if (formData.state && formData.state.trim().length < 2) {
      errors.state = 'State name must be at least 2 characters';
    }
    
    // Enhanced pincode validation - exactly 6 digits for India
    if (formData.postalCode) {
      if (formData.countryCode === '+91') {
        if (!/^\d{6}$/.test(formData.postalCode)) {
          errors.postalCode = 'Pincode must be exactly 6 digits';
        }
      } else {
        if (!/^\d{5,6}$/.test(formData.postalCode)) {
          errors.postalCode = 'Postal code must be 5-6 digits';
        }
      }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h1 className="auth-title" style={{ marginBottom: '4px' }}>Create Account</h1>
              <p className="auth-subtitle">Join Book-Karo today</p>
            </div>
            <Link 
              to="/login" 
              className="auth-link" 
              style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--royal-blue)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                border: '2px solid var(--royal-blue)',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              Already have account?
            </Link>
          </div>

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
              <div className="email-autocomplete-wrapper">
                <div className="input-with-validation">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => {
                      if (emailSuggestions.length > 0 && formData.email.includes('@')) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding to allow clicking on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="you@example.com"
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    autoComplete="off"
                  />
                  {validFields.email === true && (
                    <span className="validation-check">✓</span>
                  )}
                  {validFields.email === false && (
                    <span className="validation-error">✗</span>
                  )}
                </div>
                {showSuggestions && emailSuggestions.length > 0 && (
                  <ul className="email-suggestions">
                    {emailSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="suggestion-item"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
              {!fieldErrors.password && formData.password && (
                <div className="password-strength-indicator">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${passwordStrength.score}%`, 
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                  <div className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </div>
                </div>
              )}
              {!fieldErrors.password && !formData.password && (
                <small>Must contain uppercase, lowercase, number, and special character (@#$%^&*...)</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="phone-input-group">
                <select 
                  name="countryCode" 
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="country-code-select"
                  aria-label="Country code"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <div className="input-with-validation" style={{ flex: 1 }}>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={formData.countryCode === '+91' ? '98765-43210' : '123-456-7890'}
                    maxLength={formData.countryCode === '+91' ? 11 : 12}
                    required
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  />
                  {validFields.phone === true && (
                    <span className="validation-check">✓</span>
                  )}
                  {validFields.phone === false && (
                    <span className="validation-error">✗</span>
                  )}
                </div>
              </div>
              {fieldErrors.phone && (
                <span className="field-error" id="phone-error" role="alert">
                  {fieldErrors.phone}
                </span>
              )}
              {!fieldErrors.phone && formData.countryCode === '+91' && !formData.phone && (
                <small>Enter 10-digit mobile number starting with 6-9 (auto-formats as XXXXX-XXXXX)</small>
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

            <div className="form-actions-sticky" style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn-auth-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                Already have an account?{' '}
                <Link to="/login" className="auth-link" style={{ color: 'var(--royal-blue)', fontWeight: '600' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
