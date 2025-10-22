import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import './Profile.css';

const Profile = () => {
  const modal = useModal();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [originalData, setOriginalData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.data;
      setProfile(userData);
      const profileData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        postalCode: userData.postalCode || '',
      };
      setFormData(profileData);
      setOriginalData(profileData);
      setLastUpdated(userData.updatedAt || userData.createdAt);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && isEditing) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-+()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }
    
    // Address validation (optional, but if provided must be valid)
    if (formData.address && formData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }
    
    // City validation (optional, but if provided must be valid)
    if (formData.city && formData.city.trim().length < 2) {
      errors.city = 'City name must be at least 2 characters';
    }
    
    // State validation (optional, but if provided must be valid)
    if (formData.state && formData.state.trim().length < 2) {
      errors.state = 'State name must be at least 2 characters';
    }
    
    // Postal Code validation (if provided)
    if (formData.postalCode && !/^\d{5,6}$/.test(formData.postalCode.trim())) {
      errors.postalCode = 'Postal code must be 5-6 digits';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the errors below before saving');
      modal.error('Please fix the validation errors before saving your profile');
      return;
    }

    try {
      await userAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setHasUnsavedChanges(false);
      
      modal.success('Profile updated successfully');
      
      fetchProfile();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      
      // Handle backend validation errors
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          const field = error.field || 'general';
          backendErrors[field] = error.message;
        });
        setFieldErrors(backendErrors);
      }
      
      setError(errorMsg);
      modal.error(errorMsg);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setFormData(originalData);
        setFieldErrors({});
        setIsEditing(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsEditing(false);
      setFieldErrors({});
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: '' });
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      modal.error('Please fix the validation errors');
      return;
    }
    
    try {
      // Note: This endpoint needs to be implemented in backend
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      modal.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      setShowPasswordChange(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to change password';
      modal.error(errorMsg);
      if (err.response?.status === 401) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      }
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      modal.success(`${label} copied to clipboard`);
    }).catch(() => {
      modal.error('Failed to copy to clipboard');
    });
  };

  const formatLastUpdated = (date) => {
    if (!date) return 'Not available';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container fade-in">
          <div className="profile-header">
            <div>
              <h1>My Profile</h1>
              {lastUpdated && (
                <p className="last-updated">
                  Last updated: {formatLastUpdated(lastUpdated)}
                </p>
              )}
            </div>
            <div className="header-actions">
              {hasUnsavedChanges && isEditing && (
                <span className="unsaved-indicator" role="status" aria-live="polite">
                  Unsaved changes
                </span>
              )}
              <button
                className="btn btn-outline"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                aria-expanded={showPasswordChange}
              >
                Change Password
              </button>
              <button
                className="btn btn-primary"
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}
          {success && (
            <div className="success-message" role="alert" aria-live="polite">
              {success}
            </div>
          )}

          {showPasswordChange && (
            <div className="password-change-section">
              <div className="section-header">
                <h2>Change Password</h2>
                <button 
                  className="close-btn" 
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  aria-label="Close password change form"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="password-form" noValidate>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      aria-required="true"
                      aria-invalid={!!passwordErrors.currentPassword}
                      aria-describedby={passwordErrors.currentPassword ? 'currentPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    >
                      {showCurrentPassword ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <span className="field-error" id="currentPassword-error" role="alert">
                      {passwordErrors.currentPassword}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      aria-required="true"
                      aria-invalid={!!passwordErrors.newPassword}
                      aria-describedby={passwordErrors.newPassword ? 'newPassword-error' : 'newPassword-help'}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword ? (
                    <span className="field-error" id="newPassword-error" role="alert">
                      {passwordErrors.newPassword}
                    </span>
                  ) : (
                    <span className="field-help" id="newPassword-help">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      aria-required="true"
                      aria-invalid={!!passwordErrors.confirmPassword}
                      aria-describedby={passwordErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span className="field-error" id="confirmPassword-error" role="alert">
                      {passwordErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Change Password
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    aria-required="true"
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
                    aria-required="true"
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
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  aria-required="true"
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
                  placeholder="123 Main Street"
                  aria-invalid={!!fieldErrors.address}
                  aria-describedby={fieldErrors.address ? 'address-error' : undefined}
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
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
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
                    placeholder="Maharashtra"
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
                    placeholder="400001"
                    maxLength="6"
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

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-card" role="region" aria-label="Personal Information">
                <div className="card-header">
                  <h3>Personal Information</h3>
                </div>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">
                    {profile?.firstName} {profile?.lastName}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <div className="info-value-with-action">
                    <span className="info-value">{profile?.email}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(profile?.email, 'Email')}
                      aria-label="Copy email to clipboard"
                      title="Copy email"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <div className="info-value-with-action">
                    <span className="info-value">{profile?.phone}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(profile?.phone, 'Phone')}
                      aria-label="Copy phone to clipboard"
                      title="Copy phone"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="section-separator"></div>

              <div className="info-card" role="region" aria-label="Address Information">
                <div className="card-header">
                  <h3>Address Information</h3>
                </div>
                <div className="info-row">
                  <span className="info-label">Street:</span>
                  <span className="info-value">{profile?.address || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">City:</span>
                  <span className="info-value">{profile?.city || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">State:</span>
                  <span className="info-value">{profile?.state || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Postal Code:</span>
                  <span className="info-value">{profile?.postalCode || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
