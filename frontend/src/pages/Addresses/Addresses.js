import React, { useState, useEffect } from 'react';
import { addressAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Addresses.css';

const Addresses = () => {
  const modal = useModal();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    addressType: 'HOME',
    houseNumber: '',
    buildingName: '',
    street: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getUserAddresses();
      setAddresses(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load addresses');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear field error when user starts typing
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    
    // House Number validation
    if (!formData.houseNumber || formData.houseNumber.trim().length === 0) {
      errors.houseNumber = 'House/Flat number is required';
    } else if (formData.houseNumber.trim().length < 1) {
      errors.houseNumber = 'House number must be at least 1 character';
    }
    
    // Building Name validation
    if (!formData.buildingName || formData.buildingName.trim().length === 0) {
      errors.buildingName = 'Building/Society name is required';
    } else if (formData.buildingName.trim().length < 3) {
      errors.buildingName = 'Building name must be at least 3 characters';
    }
    
    // Area validation
    if (!formData.area || formData.area.trim().length === 0) {
      errors.area = 'Area/Locality is required';
    } else if (formData.area.trim().length < 3) {
      errors.area = 'Area must be at least 3 characters';
    }
    
    // City validation
    if (!formData.city || formData.city.trim().length === 0) {
      errors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      errors.city = 'City name must be at least 2 characters';
    }
    
    // State validation
    if (!formData.state || formData.state.trim().length === 0) {
      errors.state = 'State is required';
    } else if (formData.state.trim().length < 2) {
      errors.state = 'State name must be at least 2 characters';
    }
    
    // Enhanced pincode validation - exactly 6 digits for India
    if (!formData.postalCode || formData.postalCode.trim().length === 0) {
      errors.postalCode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      errors.postalCode = 'Pincode must be exactly 6 digits';
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
    
    try {
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id, formData);
        modal.success('Address updated successfully');
      } else {
        const response = await addressAPI.createAddress(formData);
        modal.success('Address added successfully');
        // Optimistically add new address to list
        if (response.data.data) {
          setAddresses(prevAddresses => [...prevAddresses, response.data.data]);
        }
      }
      setShowForm(false);
      setEditingAddress(null);
      resetForm();
      // Fetch to ensure we have the latest data from server
      await fetchAddresses();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save address';
      setError(errorMsg);
      modal.error(errorMsg);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    // Map old structure to new if needed, or use new structure directly
    setFormData({
      addressType: address.addressType,
      houseNumber: address.houseNumber || address.addressLine1?.split(',')[0] || '',
      buildingName: address.buildingName || '',
      street: address.street || address.addressLine2 || '',
      area: address.area || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    modal.confirm('Are you sure you want to delete this address?', {
      onConfirm: async () => {
        try {
          await addressAPI.deleteAddress(id);
          modal.success('Address deleted successfully');
          fetchAddresses();
        } catch (err) {
          const errorMsg = 'Failed to delete address';
          setError(errorMsg);
          modal.error(errorMsg);
        }
      },
      title: 'Delete Address',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefaultAddress(id);
      modal.success('Default address updated successfully');
      fetchAddresses();
    } catch (err) {
      const errorMsg = 'Failed to set default address';
      setError(errorMsg);
      modal.error(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      addressType: 'HOME',
      houseNumber: '',
      buildingName: '',
      street: '',
      area: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: false,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    resetForm();
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="addresses-page">
      <div className="container">
        <div className="addresses-header">
          <h1>My Addresses</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add New Address
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="address-form-card">
            <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Address Type *</label>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="HOME">Home</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>House/Flat Number *</label>
                <input
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  placeholder="A-101, House #45"
                  required
                  aria-invalid={!!fieldErrors.houseNumber}
                  aria-describedby={fieldErrors.houseNumber ? 'houseNumber-error' : undefined}
                />
                {fieldErrors.houseNumber && (
                  <span className="field-error" id="houseNumber-error" role="alert">
                    {fieldErrors.houseNumber}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Building/Society Name *</label>
                <input
                  type="text"
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleInputChange}
                  placeholder="Sunshine Apartments, Green Villa"
                  required
                  aria-invalid={!!fieldErrors.buildingName}
                  aria-describedby={fieldErrors.buildingName ? 'buildingName-error' : undefined}
                />
                {fieldErrors.buildingName && (
                  <span className="field-error" id="buildingName-error" role="alert">
                    {fieldErrors.buildingName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Street/Road Name</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="MG Road, Park Street"
                />
              </div>

              <div className="form-group">
                <label>Area/Locality *</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Andheri West, Koramangala"
                  required
                  aria-invalid={!!fieldErrors.area}
                  aria-describedby={fieldErrors.area ? 'area-error' : undefined}
                />
                {fieldErrors.area && (
                  <span className="field-error" id="area-error" role="alert">
                    {fieldErrors.area}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Near Metro Station, Opposite Mall"
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>Optional but helps delivery</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    required
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
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    required
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
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    maxLength="6"
                    required
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

              <div className="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark (optional)"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  Set as default address
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="addresses-list">
          {addresses.length === 0 ? (
            <div className="empty-state-card">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <h2>No Saved Addresses</h2>
              <p>Save your frequently used addresses to make service bookings faster and easier!</p>
              <div className="empty-state-benefits">
                <h3>Why save addresses?</h3>
                <ul>
                  <li>Quick checkout for service bookings</li>
                  <li>Save multiple locations (home, office, etc.)</li>
                  <li>Set a default address for convenience</li>
                  <li>Update or manage addresses anytime</li>
                </ul>
              </div>
              <button
                className="btn btn-primary btn-large"
                onClick={() => setShowForm(true)}
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="address-card">
                <div className="address-header">
                  <div className={`address-type-badge type-${address.addressType.toLowerCase()}`}>
                    {address.addressType === 'HOME' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    )}
                    {address.addressType === 'OFFICE' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    )}
                    {address.addressType === 'OTHER' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    )}
                    {address.addressType}
                  </div>
                  {address.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                </div>

                <div className="address-details">
                  <p className="address-line">
                    {address.houseNumber && `${address.houseNumber}, `}
                    {address.buildingName || address.addressLine1 || 'Building not specified'}
                  </p>
                  {(address.street || address.addressLine2) && (
                    <p className="address-line">
                      {address.street || address.addressLine2}
                    </p>
                  )}
                  <p className="address-line">
                    {address.area && `${address.area}, `}
                    {address.city || 'City'}, {address.state || 'State'} - {address.postalCode || 'PIN'}
                  </p>
                  {address.landmark && (
                    <p className="address-landmark">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {address.landmark}
                    </p>
                  )}
                </div>

                <div className="address-actions">
                  {!address.isDefault && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Addresses;
