import React, { useState, useEffect } from 'react';
import settingsAPI from '../../services/settingsAPI';
import './FunctionalityManagement.css';

const FunctionalityManagement = () => {
  const [settings, setSettings] = useState({
    contactEmail: '',
    contactPhone: '',
    serviceFee: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settingsData, setSettingsData] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await settingsAPI.getAllSettings();
      setSettingsData(allSettings);

      // Map settings to state
      const emailSetting = allSettings.find(s => s.settingKey === 'contact.email');
      const phoneSetting = allSettings.find(s => s.settingKey === 'contact.phone');
      const feeSetting = allSettings.find(s => s.settingKey === 'pricing.service_fee');

      setSettings({
        contactEmail: emailSetting?.settingValue || '',
        contactPhone: phoneSetting?.settingValue || '',
        serviceFee: feeSetting?.settingValue || '99'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
      
      // If settings don't exist, try to initialize them
      if (error.response?.status === 404 || settingsData.length === 0) {
        try {
          await settingsAPI.initializeSettings();
          fetchSettings();
        } catch (initError) {
          console.error('Error initializing settings:', initError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare updates
      const updates = {
        'contact.email': settings.contactEmail,
        'contact.phone': settings.contactPhone,
        'pricing.service_fee': settings.serviceFee
      };

      // Bulk update settings
      await settingsAPI.bulkUpdateSettings(updates);

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      
      // Refresh settings to ensure we have latest data
      setTimeout(() => {
        fetchSettings();
      }, 1000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="functionality-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="functionality-management">
      <div className="functionality-header">
        <h1>Functionality Management</h1>
        <p>Configure system-wide settings for contact information and pricing</p>
      </div>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {message.type === 'success' ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            ) : (
              <circle cx="12" cy="12" r="10"></circle>
            )}
            {message.type === 'success' ? (
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            ) : (
              <line x1="15" y1="9" x2="9" y2="15"></line>
            )}
            {message.type === 'error' && <line x1="9" y1="9" x2="15" y2="15"></line>}
          </svg>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="functionality-form">
        {/* Contact Information Section */}
        <div className="settings-section">
          <div className="section-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <h2>Contact Information</h2>
          </div>
          <p className="section-description">
            Configure the contact details displayed in the footer and contact pages
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contactEmail">
                Support Email
                <span className="required">*</span>
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                placeholder="support@bookkaro.com"
                required
              />
              <small>Primary email address for customer support</small>
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">
                Support Phone
                <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                required
              />
              <small>Primary phone number for customer support</small>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="settings-section">
          <div className="section-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <h2>Pricing Configuration</h2>
          </div>
          <p className="section-description">
            Configure platform fees and pricing structure
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="serviceFee">
                Service Fee (₹)
                <span className="required">*</span>
              </label>
              <input
                type="number"
                id="serviceFee"
                name="serviceFee"
                value={settings.serviceFee}
                onChange={handleInputChange}
                placeholder="99"
                min="0"
                step="1"
                required
              />
              <small>Platform service fee charged per booking (in rupees)</small>
            </div>

            <div className="fee-preview">
              <h3>Fee Preview</h3>
              <div className="preview-content">
                <div className="preview-row">
                  <span>Service Amount:</span>
                  <span>₹500</span>
                </div>
                <div className="preview-row fee">
                  <span>Service Fee:</span>
                  <span>₹{Number(settings.serviceFee) || 0}</span>
                </div>
                <div className="preview-row total">
                  <span>Total Amount:</span>
                  <span>₹{500 + (Number(settings.serviceFee) || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Reset Changes
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Panel */}
      <div className="info-panel">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Important Information
        </h3>
        <ul>
          <li>Changes to contact information will be reflected across the entire platform including footer and contact pages</li>
          <li>Service fee changes will apply to all new bookings immediately</li>
          <li>Existing bookings will retain their original service fee</li>
          <li>All changes are logged in the audit trail for security purposes</li>
        </ul>
      </div>
    </div>
  );
};

export default FunctionalityManagement;
