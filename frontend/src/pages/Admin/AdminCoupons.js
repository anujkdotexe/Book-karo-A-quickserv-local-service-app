import React, { useState, useEffect } from 'react';
import adminAPI from '../../services/adminAPI';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    startsAt: '',
    endsAt: '',
    usageLimit: '',
    perUserLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, statusFilter]);

  const filterCoupons = () => {
    let filtered = [...coupons];
    
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(coupon => {
        const isExpired = coupon.endsAt && new Date(coupon.endsAt) < now;
        const isNotStarted = coupon.startsAt && new Date(coupon.startsAt) > now;
        
        switch (statusFilter) {
          case 'active':
            return coupon.isActive && !isExpired && !isNotStarted;
          case 'inactive':
            return !coupon.isActive;
          case 'expired':
            return isExpired;
          case 'scheduled':
            return isNotStarted;
          default:
            return true;
        }
      });
    }
    
    setFilteredCoupons(filtered);
    setCurrentPage(1);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllCoupons();
      setCoupons(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
      console.error('Coupons fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateCouponForm = () => {
    const errors = {};
    
    // Date range validation
    if (formData.startsAt && formData.endsAt) {
      const startDate = new Date(formData.startsAt);
      const endDate = new Date(formData.endsAt);
      if (endDate < startDate) {
        errors.endsAt = 'End date must be after start date';
      }
    }
    
    // Numeric validations
    if (formData.discountValue && parseFloat(formData.discountValue) <= 0) {
      errors.discountValue = 'Discount value must be greater than 0';
    }
    
    if (formData.minOrderValue && parseFloat(formData.minOrderValue) < 0) {
      errors.minOrderValue = 'Minimum order value cannot be negative';
    }
    
    if (formData.maxDiscountAmount && parseFloat(formData.maxDiscountAmount) <= 0) {
      errors.maxDiscountAmount = 'Maximum discount must be greater than 0';
    }
    
    if (formData.usageLimit && parseInt(formData.usageLimit) < 1) {
      errors.usageLimit = 'Usage limit must be at least 1';
    }
    
    if (formData.perUserLimit && parseInt(formData.perUserLimit) < 1) {
      errors.perUserLimit = 'Per user limit must be at least 1';
    }
    
    // Code validation
    if (!formData.code || formData.code.trim() === '') {
      errors.code = 'Coupon code is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationErrors = validateCouponForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors).join(', '));
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare coupon data with proper datetime formatting
      const couponData = {
        ...formData,
        // Convert date strings to ISO datetime format for backend
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        // Convert empty strings to null for numeric fields
        minOrderValue: formData.minOrderValue === '' ? null : formData.minOrderValue,
        maxDiscountAmount: formData.maxDiscountAmount === '' ? null : formData.maxDiscountAmount,
        usageLimit: formData.usageLimit === '' ? null : formData.usageLimit,
        perUserLimit: formData.perUserLimit === '' ? null : formData.perUserLimit
      };
      
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon.id, couponData);
      } else {
        await adminAPI.createCoupon(couponData);
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      await fetchCoupons();
    } catch (err) {
      setError(err.message || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      startsAt: coupon.startsAt ? coupon.startsAt.split('T')[0] : '',
      endsAt: coupon.endsAt ? coupon.endsAt.split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit || '',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      await adminAPI.toggleCouponStatus(id);
      await fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to update coupon status');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '',
      maxDiscountAmount: '',
      startsAt: '',
      endsAt: '',
      usageLimit: '',
      perUserLimit: '',
      isActive: true
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
  };

  if (loading && coupons.length === 0) return <LoadingSpinner />;

  return (
    <div className="admin-coupons">
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      
      <div className="coupons-header">
        <h1>Coupon Management</h1>
        <div className="header-actions">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Coupons</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="fas fa-plus"></i> Create New Coupon
          </button>
        </div>
      </div>

      <div className="coupons-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Coupons</h2>
            <div>
              <span className="stat-value">{coupons.length}</span>
              <span className="stat-label">All Coupons</span>
            </div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Coupons</h2>
            <div>
              <span className="stat-value">{coupons.filter(c => c.isActive).length}</span>
              <span className="stat-label">Currently Active</span>
            </div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Redemptions</h2>
            <div>
              <span className="stat-value">{coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}</span>
              <span className="stat-label">Times Used</span>
            </div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Expired Coupons</h2>
            <div>
              <span className="stat-value">{coupons.filter(c => c.endsAt && new Date(c.endsAt) < new Date()).length}</span>
              <span className="stat-label">Past End Date</span>
            </div>
          </div>
        </div>
      </div>

      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Valid Period</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex);
              
              return paginatedCoupons.map(coupon => {
                // Check if coupon is expired
                const isExpired = coupon.endsAt && new Date(coupon.endsAt) < new Date();
                const isNotStarted = coupon.startsAt && new Date(coupon.startsAt) > new Date();
                
                return (
                  <tr key={coupon.id} className={!coupon.isActive || isExpired ? 'inactive' : ''}>
                    <td className="coupon-code">{coupon.code}</td>
                    <td>{coupon.description}</td>
                    <td>
                      <span className={`type-badge ${coupon.discountType.toLowerCase()}`}>
                        {coupon.discountType === 'PERCENTAGE' ? '%' : '₹'}
                      </span>
                    </td>
                    <td className="discount-value">
                      {coupon.discountType === 'PERCENTAGE' 
                        ? `${coupon.discountValue}%` 
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td>₹{coupon.minOrderValue || 0}</td>
                    <td className="date-range">
                      {coupon.startsAt && new Date(coupon.startsAt).toLocaleDateString()} -
                      {coupon.endsAt && new Date(coupon.endsAt).toLocaleDateString()}
                    </td>
                    <td>
                      {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                    </td>
                    <td>
                      {isExpired ? (
                        <span className="status-badge expired">EXPIRED</span>
                      ) : isNotStarted ? (
                        <span className="status-badge scheduled">SCHEDULED</span>
                      ) : (
                        <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                          {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )}
                    </td>
                    <td className="actions">
                      <button 
                        className="btn btn-edit" 
                        onClick={() => handleEdit(coupon)}
                        title="Edit Coupon"
                      >
                        Edit
                      </button>
                      <button 
                        className={`btn ${coupon.isActive ? 'btn-disable' : 'btn-enable'}`}
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        title={coupon.isActive ? 'Disable Coupon' : 'Enable Coupon'}
                        disabled={isExpired && !coupon.isActive}
                      >
                        {coupon.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>

        {/* Pagination */}
        {Math.ceil(filteredCoupons.length / itemsPerPage) > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            
            {(() => {
              const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
              const pages = [];
              for (let i = 1; i <= totalPages; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`btn ${currentPage === i ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCoupons.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredCoupons.length / itemsPerPage)}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}

        {filteredCoupons.length === 0 && !loading && (
          <div className="no-data">
            <i className="fas fa-ticket-alt"></i>
            <p>No coupons found</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Create First Coupon
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE20"
                    required
                    disabled={editingCoupon}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the coupon"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                    min="0"
                    step="0.01"
                    required
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteValue = e.clipboardData.getData('text');
                      if (parseFloat(pasteValue) <= 0 || isNaN(parseFloat(pasteValue))) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Min Order Value</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="500"
                    min="0"
                    step="0.01"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteValue = e.clipboardData.getData('text');
                      if (parseFloat(pasteValue) < 0 || isNaN(parseFloat(pasteValue))) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Max Discount Amount</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="200"
                    min="0"
                    step="0.01"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteValue = e.clipboardData.getData('text');
                      if (parseFloat(pasteValue) <= 0 || isNaN(parseFloat(pasteValue))) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteValue = e.clipboardData.getData('text');
                      if (parseInt(pasteValue) < 1 || isNaN(parseInt(pasteValue))) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Per User Limit</label>
                  <input
                    type="number"
                    name="perUserLimit"
                    value={formData.perUserLimit}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteValue = e.clipboardData.getData('text');
                      if (parseInt(pasteValue) < 1 || isNaN(parseInt(pasteValue))) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
