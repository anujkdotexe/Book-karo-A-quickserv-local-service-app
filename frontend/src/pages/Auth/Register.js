import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../components/Modal/Modal';
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
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const { register, user } = useAuth();
  const navigate = useNavigate();
  const modal = useModal();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/services');
    }
  }, [user, navigate]);

  // Refs for scrolling to error fields
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const postalCodeRef = useRef(null);

  // Common Indian email domains for autocomplete
  const commonDomains = ['gmail.com', 'yahoo.co.in', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];

  // Sanitize input to prevent XSS and injection attacks
  const sanitizeInput = (input, type = 'text') => {
    if (!input) return '';
    
    let sanitized = input.trim();
    
    // Remove any HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove script tags and event handlers
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    switch (type) {
      case 'name':
        // Only allow letters, spaces, hyphens, apostrophes (for Indian names)
        sanitized = sanitized.replace(/[^a-zA-Z\s\-'.]/g, '');
        // Limit to 50 characters
        sanitized = sanitized.substring(0, 50);
        break;
      
      case 'address':
        // Allow alphanumeric, spaces, common punctuation
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s,.\-#/()]/g, '');
        // Limit to 100 characters
        sanitized = sanitized.substring(0, 100);
        break;
      
      case 'city':
      case 'state':
        // Only allow letters and spaces (Indian cities/states)
        sanitized = sanitized.replace(/[^a-zA-Z\s]/g, '');
        // Limit to 50 characters
        sanitized = sanitized.substring(0, 50);
        break;
      
      case 'postalCode':
        // Only allow digits for Indian PIN codes
        sanitized = sanitized.replace(/\D/g, '');
        // Limit to 6 digits
        sanitized = sanitized.substring(0, 6);
        break;
      
      case 'email':
        // Remove whitespace and limit to 100 characters
        sanitized = sanitized.replace(/\s/g, '').toLowerCase();
        sanitized = sanitized.substring(0, 100);
        break;
      
      case 'password':
        // Limit password to 64 characters (security best practice)
        sanitized = input.substring(0, 64);
        break;
      
      default:
        sanitized = sanitized.substring(0, 100);
    }
    
    return sanitized;
  };

  // Calculate password strength with strict requirements
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    // Reject if too long
    if (password.length > 64) {
      return { score: 0, label: 'Too Long', color: '#ef4444' };
    }
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      minLength12: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    };
    
    // All requirements must be met for any strength score
    if (!checks.length || !checks.uppercase || !checks.lowercase || !checks.number || !checks.special) {
      return { score: 0, label: 'Weak', color: '#ef4444' };
    }
    
    // Score calculation (all basic requirements met)
    score = 40; // Base score for meeting all requirements
    
    if (checks.minLength12) score += 20;
    if (password.length >= 16) score += 10;
    
    // Additional complexity
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.7) score += 15;
    
    // No common patterns
    const commonPatterns = ['123', 'abc', 'password', 'admin', 'qwerty'];
    const hasCommonPattern = commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    );
    if (!hasCommonPattern) score += 15;
    
    // Determine strength label and color
    if (score < 50) return { score, label: 'Fair', color: '#f59e0b' };
    if (score < 70) return { score, label: 'Good', color: '#3b82f6' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  // Check email availability with backend
  const checkEmailAvailability = async (email) => {
    if (!email || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8081'}/api/v1/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists || data.data?.exists) {
          setFieldErrors(prev => ({
            ...prev,
            email: 'This email is already registered. Try logging in instead.'
          }));
          setValidFields(prev => ({ ...prev, email: false }));
        }
      }
    } catch (error) {
      console.error('Email availability check failed:', error);
    }
  };

  // Real-time field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return null;
        // Simplified email validation - accept all valid email formats
        // Removed restrictive domain whitelist that rejected corporate emails
        // Basic format: user@domain.tld (minimum 2-letter TLD)
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      
      case 'phone':
        if (!value) return null;
        const phoneDigits = value.replace(/\D/g, '');
        // Strict: exactly 10 digits, must start with 6-9 (Indian mobile numbers)
        return /^[6-9]\d{9}$/.test(phoneDigits);
      
      case 'firstName':
      case 'lastName':
        if (!value) return null;
        const trimmed = value.trim();
        // Must be 2-50 characters, only letters, spaces, hyphens, apostrophes
        return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s\-'.]+$/.test(trimmed);
      
      case 'address':
        if (!value) return null;
        const addrTrimmed = value.trim();
        // Must be 2-100 characters
        return addrTrimmed.length >= 2 && addrTrimmed.length <= 100;
      
      case 'city':
      case 'state':
        if (!value) return null;
        const locTrimmed = value.trim();
        // Must be 2-50 characters, only letters and spaces
        return locTrimmed.length >= 2 && locTrimmed.length <= 50 && /^[a-zA-Z\s]+$/.test(locTrimmed);
      
      case 'postalCode':
        if (!value) return null;
        // Strict: exactly 6 digits (Indian PIN code)
        return /^\d{6}$/.test(value);
      
      default:
        return null;
    }
  };

  // Scroll to first error field
  const scrollToError = (fieldName) => {
    const refs = {
      firstName: firstNameRef,
      lastName: lastNameRef,
      email: emailRef,
      password: passwordRef,
      phone: phoneRef,
      address: addressRef,
      city: cityRef,
      state: stateRef,
      postalCode: postalCodeRef,
    };

    const ref = refs[fieldName];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        sanitizedValue = sanitizeInput(value, 'name');
        break;
      case 'email':
        sanitizedValue = sanitizeInput(value, 'email');
        break;
      case 'password':
        sanitizedValue = sanitizeInput(value, 'password');
        break;
      case 'phone':
        // Only allow digits, limit to 10
        sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'address':
        sanitizedValue = sanitizeInput(value, 'address');
        break;
      case 'city':
        sanitizedValue = sanitizeInput(value, 'city');
        break;
      case 'state':
        sanitizedValue = sanitizeInput(value, 'state');
        break;
      case 'postalCode':
        sanitizedValue = sanitizeInput(value, 'postalCode');
        break;
      default:
        sanitizedValue = value;
    }
    
    // Email autocomplete suggestions
    if (name === 'email') {
      if (sanitizedValue.includes('@') && !sanitizedValue.includes('.', sanitizedValue.indexOf('@'))) {
        const [username, partialDomain] = sanitizedValue.split('@');
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
      [name]: sanitizedValue,
    });
    setError('');
    
    // Clear field error when user starts typing
    setFieldErrors({ ...fieldErrors, [name]: '' });
    
    // Real-time validation
    const isValid = validateField(name, sanitizedValue);
    if (isValid !== null) {
      setValidFields({ ...validFields, [name]: isValid });
    }
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(sanitizedValue));
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
    let firstErrorField = null;
    
    // First Name validation - strict
    if (!formData.firstName || formData.firstName.trim().length === 0) {
      errors.firstName = 'First name cannot be empty';
      if (!firstErrorField) firstErrorField = 'firstName';
    } else if (!/^[a-zA-Z\s\-'.]+$/.test(formData.firstName.trim())) {
      errors.firstName = 'First name can only contain letters';
      if (!firstErrorField) firstErrorField = 'firstName';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name is too short';
      if (!firstErrorField) firstErrorField = 'firstName';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name is too long (max 50 characters)';
      if (!firstErrorField) firstErrorField = 'firstName';
    }
    
    // Last Name validation - strict
    if (!formData.lastName || formData.lastName.trim().length === 0) {
      errors.lastName = 'Last name cannot be empty';
      if (!firstErrorField) firstErrorField = 'lastName';
    } else if (!/^[a-zA-Z\s\-'.]+$/.test(formData.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters';
      if (!firstErrorField) firstErrorField = 'lastName';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name is too short';
      if (!firstErrorField) firstErrorField = 'lastName';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name is too long (max 50 characters)';
      if (!firstErrorField) firstErrorField = 'lastName';
    }
    
    // Enhanced email validation - strict
    if (!formData.email || formData.email.trim().length === 0) {
      errors.email = 'Email cannot be empty';
      if (!firstErrorField) firstErrorField = 'email';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
      if (!firstErrorField) firstErrorField = 'email';
    } else {
      // Accept all valid email formats (corporate, international, etc.)
      
      // Common typo detection (optional helpful feature)
      const domain = formData.email.split('@')[1];
      const typos = {
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmil.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com',
        'outlok.com': 'outlook.com'
      };
      if (domain && typos[domain]) {
        errors.email = `Did you mean ${formData.email.replace(domain, typos[domain])}?`;
        if (!firstErrorField) firstErrorField = 'email';
      }
    }
    
    // Enhanced password validation - strict with all requirements
    if (!formData.password) {
      errors.password = 'Password cannot be empty';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (formData.password.length < 8) {
      errors.password = 'Password is too short (minimum 8 characters)';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (formData.password.length > 64) {
      errors.password = 'Password is too long (maximum 64 characters)';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (!/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
      if (!firstErrorField) firstErrorField = 'password';
    } else if (!/[@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character (@#$%^&*...)';
      if (!firstErrorField) firstErrorField = 'password';
    }
    
    // Enhanced phone validation - strict for Indian mobile numbers
    if (!formData.phone || formData.phone.trim().length === 0) {
      errors.phone = 'Phone number cannot be empty';
      if (!firstErrorField) firstErrorField = 'phone';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
        if (!firstErrorField) firstErrorField = 'phone';
      } else if (!/^[6-9]/.test(phoneDigits)) {
        errors.phone = 'Phone number must start with 6, 7, 8, or 9';
        if (!firstErrorField) firstErrorField = 'phone';
      } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        errors.phone = 'Enter a valid Indian mobile number';
        if (!firstErrorField) firstErrorField = 'phone';
      }
    }
    
    // Address validation - if provided
    if (formData.address && formData.address.trim().length > 0) {
      if (formData.address.trim().length < 2) {
        errors.address = 'Address is too short';
        if (!firstErrorField) firstErrorField = 'address';
      } else if (formData.address.trim().length > 100) {
        errors.address = 'Address is too long (max 100 characters)';
        if (!firstErrorField) firstErrorField = 'address';
      }
    }
    
    // City validation - if provided
    if (formData.city && formData.city.trim().length > 0) {
      if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
        errors.city = 'City name can only contain letters';
        if (!firstErrorField) firstErrorField = 'city';
      } else if (formData.city.trim().length < 2) {
        errors.city = 'City name is too short';
        if (!firstErrorField) firstErrorField = 'city';
      } else if (formData.city.trim().length > 50) {
        errors.city = 'City name is too long (max 50 characters)';
        if (!firstErrorField) firstErrorField = 'city';
      }
    }
    
    // State validation - if provided
    if (formData.state && formData.state.trim().length > 0) {
      if (!/^[a-zA-Z\s]+$/.test(formData.state.trim())) {
        errors.state = 'State name can only contain letters';
        if (!firstErrorField) firstErrorField = 'state';
      } else if (formData.state.trim().length < 2) {
        errors.state = 'State name is too short';
        if (!firstErrorField) firstErrorField = 'state';
      } else if (formData.state.trim().length > 50) {
        errors.state = 'State name is too long (max 50 characters)';
        if (!firstErrorField) firstErrorField = 'state';
      }
    }
    
    // Enhanced pincode validation - strict for Indian PIN codes
    if (formData.postalCode && formData.postalCode.trim().length > 0) {
      if (!/^\d{6}$/.test(formData.postalCode)) {
        errors.postalCode = 'PIN code must be exactly 6 digits';
        if (!firstErrorField) firstErrorField = 'postalCode';
      }
    }
    
    setFieldErrors(errors);
    
    // If there are errors, scroll to top first so user sees the error banner
    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Then scroll to first error field after a brief delay
      if (firstErrorField) {
        setTimeout(() => scrollToError(firstErrorField), 300);
      }
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent spam submissions
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      setError('Please wait a moment before submitting again');
      return;
    }
    
    // Track submission attempts
    if (submissionAttempts >= 5) {
      const waitTime = 60 - Math.floor((now - lastSubmitTime) / 1000);
      if (waitTime > 0) {
        setError(`Too many attempts. Please wait ${waitTime} seconds before trying again`);
        return;
      } else {
        setSubmissionAttempts(0); // Reset after cooldown
      }
    }
    
    setLastSubmitTime(now);
    setSubmissionAttempts(prev => prev + 1);
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    // Format phone number with country code for backend (India +91)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    
    // Sanitize all fields before sending
    // IMPORTANT: Send null for empty optional fields to avoid backend @Size validation on empty strings
    const formattedData = {
      email: sanitizeInput(formData.email, 'email'),
      password: formData.password, // Don't sanitize password (already limited)
      firstName: sanitizeInput(formData.firstName, 'name'),
      lastName: sanitizeInput(formData.lastName, 'name'),
      phone: `+91${phoneDigits}`,
      // Optional fields: send null instead of empty string to pass backend validation
      address: formData.address?.trim() || null,
      city: formData.city?.trim() || null,
      state: formData.state?.trim() || null,
      postalCode: formData.postalCode?.trim() || null,
    };

    const result = await register(formattedData);

    if (result.success) {
      // Reset attempt counter on success
      setSubmissionAttempts(0);
      setLoading(false);
      
      // Show success modal instead of immediate redirect
      modal.success(
        'Registration Successful!',
        'Your account has been created successfully. You can now login with your credentials.',
        () => {
          navigate('/login');
        },
        'Go to Login'
      );
      return;
    } else {
      // Handle specific error cases with user-friendly messages
      const errorMsg = result.message?.toLowerCase() || '';
      
      // Rate limiting (429 Too Many Requests)
      if (errorMsg.includes('too many') || errorMsg.includes('rate limit') || errorMsg.includes('attempts')) {
        setError('Too many registration attempts. Please try again in an hour.');
        setSubmissionAttempts(0); // Reset counter since server is blocking
        setLastSubmitTime(0);
      }
      // Database constraint violations
      else if (errorMsg.includes('constraint') || errorMsg.includes('unique') || errorMsg.includes('duplicate')) {
        if (errorMsg.includes('email') || errorMsg.includes('uk_email') || errorMsg.includes('users.email')) {
          setError('This email is already registered. Please login or use a different email.');
          setFieldErrors({ ...fieldErrors, email: 'Email already in use' });
          scrollToError('email');
        } else if (errorMsg.includes('phone') || errorMsg.includes('uk_phone') || errorMsg.includes('users.phone')) {
          setError('This phone number is already registered. Please use a different number.');
          setFieldErrors({ ...fieldErrors, phone: 'Phone number already in use' });
          scrollToError('phone');
        } else {
          setError('This account information is already registered. Please check your email or phone number.');
        }
      }
      // Already exists messages
      else if (errorMsg.includes('already exists') || errorMsg.includes('already registered')) {
        if (errorMsg.includes('email')) {
          setError('This email is already registered. Please login or use a different email.');
          setFieldErrors({ ...fieldErrors, email: 'Email already in use' });
          scrollToError('email');
        } else if (errorMsg.includes('phone')) {
          setError('This phone number is already registered. Please use a different number.');
          setFieldErrors({ ...fieldErrors, phone: 'Phone number already in use' });
          scrollToError('phone');
        } else {
          setError('An account with this information already exists. Please login instead.');
        }
      }
      // Validation errors
      else if (errorMsg.includes('invalid email')) {
        setError('Please enter a valid email address.');
        setFieldErrors({ ...fieldErrors, email: 'Invalid email format' });
        scrollToError('email');
      } else if (errorMsg.includes('invalid phone')) {
        setError('Please enter a valid 10-digit phone number.');
        setFieldErrors({ ...fieldErrors, phone: 'Invalid phone number' });
        scrollToError('phone');
      } else if (errorMsg.includes('password')) {
        setError('Password must be at least 8 characters with uppercase, lowercase, number and special character.');
        scrollToError('password');
      }
      // Network/Server errors
      else if (errorMsg.includes('network') || errorMsg.includes('failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (errorMsg.includes('500') || errorMsg.includes('server error')) {
        setError('Server error. Please try again in a few moments.');
      } else if (errorMsg.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      }
      // Generic fallback
      else {
        setError(result.message || 'Registration failed. Please check your information and try again.');
      }
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  };

  // Reset submission attempts after 1 minute
  useEffect(() => {
    if (submissionAttempts > 0) {
      const timer = setTimeout(() => {
        setSubmissionAttempts(0);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [submissionAttempts]);

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        <div className="auth-card">
          <div style={{ marginBottom: '16px' }}>
            <h1 className="auth-title" style={{ marginBottom: '4px' }}>Create Account</h1>
            <p className="auth-subtitle">Join Book-Karo today</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  ref={firstNameRef}
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Rajesh"
                  required
                  maxLength={50}
                  autoComplete="given-name"
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                  className={fieldErrors.firstName ? 'input-error' : ''}
                />
                {fieldErrors.firstName && (
                  <span className="field-error" id="firstName-error" role="alert">
                    {fieldErrors.firstName}
                  </span>
                )}
                {!fieldErrors.firstName && formData.firstName && formData.firstName.length < 2 && (
                  <small style={{ color: '#ff6b6b' }}>First name must be at least 2 characters</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  ref={lastNameRef}
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kumar"
                  required
                  maxLength={50}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                  className={fieldErrors.lastName ? 'input-error' : ''}
                />
                {fieldErrors.lastName && (
                  <span className="field-error" id="lastName-error" role="alert">
                    {fieldErrors.lastName}
                  </span>
                )}
                {!fieldErrors.lastName && formData.lastName && formData.lastName.length < 2 && (
                  <small style={{ color: '#ff6b6b' }}>Last name must be at least 2 characters</small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="email-autocomplete-wrapper">
                <div className="input-with-validation">
                  <input
                    ref={emailRef}
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
                    onBlur={(e) => {
                      // Check email availability with backend
                      checkEmailAvailability(e.target.value);
                      // Delay hiding to allow clicking on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="rajesh@example.com"
                    required
                    maxLength={100}
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    className={fieldErrors.email ? 'input-error' : ''}
                  />
                  {validFields.email === true && (
                    <span className="validation-check" aria-label="Valid email"></span>
                  )}
                  {validFields.email === false && (
                    <span className="validation-error" aria-label="Invalid email"></span>
                  )}
                </div>
                {showSuggestions && emailSuggestions.length > 0 && (
                  <ul className="email-suggestions" role="listbox">
                    {emailSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="suggestion-item"
                        role="option"
                        aria-selected={formData.email === suggestion}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSuggestionClick(suggestion);
                        }}
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
              {!fieldErrors.email && formData.email && !formData.email.includes('@') && (
                <small style={{ color: '#ff6b6b' }}>Email must contain @ symbol</small>
              )}
              {!fieldErrors.email && formData.email && formData.email.includes('@') && !formData.email.includes('.') && (
                <small style={{ color: '#ff6b6b' }}>Email must contain domain (e.g., gmail.com)</small>
              )}
              {!fieldErrors.email && formData.email && validFields.email === false && formData.email.includes('@') && formData.email.includes('.') && (
                <small style={{ color: '#ff6b6b' }}>Please enter a valid email format</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrapper">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  maxLength={64}
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error password-requirements' : 'password-requirements'}
                  className={fieldErrors.password ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
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
                <div className="password-strength-indicator" aria-live="polite">
                  <div className="strength-bar" role="progressbar" aria-valuenow={passwordStrength.score} aria-valuemin="0" aria-valuemax="100">
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
                <small id="password-requirements">Must contain uppercase, lowercase, number, and special character (@#$%^&*...)</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number * 
                <span style={{ fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                  (India +91)
                </span>
              </label>
              <div className="input-with-validation">
                <input
                  ref={phoneRef}
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9-]*"
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-help'}
                  className={fieldErrors.phone ? 'input-error' : ''}
                />
                {validFields.phone === true && (
                  <span className="validation-check" aria-label="Valid phone number"></span>
                )}
                {validFields.phone === false && (
                  <span className="validation-error" aria-label="Invalid phone number"></span>
                )}
              </div>
              {fieldErrors.phone && (
                <span className="field-error" id="phone-error" role="alert">
                  {fieldErrors.phone}
                </span>
              )}
              {!fieldErrors.phone && formData.phone && formData.phone.length < 10 && (
                <small id="phone-help" style={{ color: '#ff6b6b' }}>
                  {formData.phone.length}/10 digits - Need {10 - formData.phone.length} more
                </small>
              )}
              {!fieldErrors.phone && (!formData.phone || formData.phone.length === 0) && (
                <small id="phone-help">10-digit mobile number starting with 6, 7, 8, or 9</small>
              )}
              {!fieldErrors.phone && formData.phone && formData.phone.length === 10 && validFields.phone === false && (
                <small id="phone-help" style={{ color: '#ff6b6b' }}>
                  Must start with 6, 7, 8, or 9
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                ref={addressRef}
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Plot No. 123, Sector 45"
                maxLength={100}
                autoComplete="street-address"
                aria-invalid={!!fieldErrors.address}
                aria-describedby={fieldErrors.address ? 'address-error' : undefined}
                className={fieldErrors.address ? 'input-error' : ''}
              />
              {fieldErrors.address && (
                <span className="field-error" id="address-error" role="alert">
                  {fieldErrors.address}
                </span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  ref={cityRef}
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  maxLength={50}
                  autoComplete="address-level2"
                  aria-invalid={!!fieldErrors.city}
                  aria-describedby={fieldErrors.city ? 'city-error' : undefined}
                  className={fieldErrors.city ? 'input-error' : ''}
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
                  ref={stateRef}
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  maxLength={50}
                  autoComplete="address-level1"
                  aria-invalid={!!fieldErrors.state}
                  aria-describedby={fieldErrors.state ? 'state-error' : undefined}
                  className={fieldErrors.state ? 'input-error' : ''}
                />
                {fieldErrors.state && (
                  <span className="field-error" id="state-error" role="alert">
                    {fieldErrors.state}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">PIN Code</label>
                <input
                  ref={postalCodeRef}
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="400001"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="postal-code"
                  aria-invalid={!!fieldErrors.postalCode}
                  aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
                  className={fieldErrors.postalCode ? 'input-error' : ''}
                />
                {fieldErrors.postalCode && (
                  <span className="field-error" id="postalCode-error" role="alert">
                    {fieldErrors.postalCode}
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions-fixed">
              <button 
                type="submit" 
                className="btn btn-auth-primary" 
                disabled={loading || submissionAttempts >= 5} 
                style={{ width: '100%' }}
                aria-busy={loading}
              >
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
