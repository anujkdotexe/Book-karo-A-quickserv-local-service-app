import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBanners.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'HOME_TOP',
    displayOrder: 1,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/content/banners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateBannerForm = () => {
    const errors = {};
    
    // URL validation
    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        errors.imageUrl = 'Please enter a valid URL';
      }
    } else {
      errors.imageUrl = 'Image URL is required';
    }
    
    if (formData.linkUrl && formData.linkUrl.trim()) {
      try {
        new URL(formData.linkUrl);
      } catch {
        errors.linkUrl = 'Please enter a valid URL';
      }
    }
    
    // Date range validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    // Title validation
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Title is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateBannerForm();
    if (Object.keys(validationErrors).length > 0) {
      alert('Validation errors: ' + Object.values(validationErrors).join(', '));
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (editingBanner) {
        await axios.put(
          `${API_BASE_URL}/api/v1/admin/content/banners/${editingBanner.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/admin/content/banners`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchBanners();
      closeModal();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      position: banner.position,
      displayOrder: banner.displayOrder,
      startDate: banner.startDate ? banner.startDate.substring(0, 16) : '',
      endDate: banner.endDate ? banner.endDate.substring(0, 16) : '',
      isActive: banner.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/v1/admin/content/banners/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Failed to delete ad');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/v1/admin/content/banners/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Failed to toggle banner status');
    }
  };

  const openModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'HOME_TOP',
      displayOrder: 1,
      startDate: '',
      endDate: '',
      isActive: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const filteredBanners = banners.filter(
    (banner) => filterPosition === 'ALL' || banner.position === filterPosition
  );

  if (loading) {
    return <div className="loading">Loading banners...</div>;
  }

  return (
    <div className="admin-banners">
      <div className="banners-header">
        <h1>Ads Management</h1>
        <button className="btn-primary" onClick={openModal}>
          + Create Ad
        </button>
      </div>

      <div className="banners-filters">
        <label>
          Filter by Position:
          <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}>
            <option value="ALL">All Positions</option>
            <option value="HOME_TOP">Home Top</option>
            <option value="HOME_MIDDLE">Home Middle</option>
            <option value="HOME_BOTTOM">Home Bottom</option>
            <option value="SERVICES_TOP">Services Top</option>
            <option value="DASHBOARD">Dashboard</option>
          </select>
        </label>
      </div>

      <div className="banners-grid">
        {filteredBanners.length === 0 ? (
          <div className="no-banners">No ads found</div>
        ) : (
          filteredBanners.map((banner) => (
            <div key={banner.id} className="banner-card">
              <div className="banner-image">
                {banner.imageUrl ? (
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="no-image">Image Failed to Load</div>';
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="banner-content">
                <div className="banner-title">{banner.title}</div>
                {banner.description && (
                  <div className="banner-description">{banner.description}</div>
                )}
                <div className="banner-meta">
                  <span className="position-badge">{banner.position}</span>
                  <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="banner-stats">
                  <div className="stat">
                    <span className="stat-label">Display Order:</span>
                    <span className="stat-value">{banner.displayOrder}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Clicks:</span>
                    <span className="stat-value">{banner.clickCount || 0}</span>
                  </div>
                </div>
                {banner.linkUrl && (
                  <div className="banner-link">
                    🔗 <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                      {banner.linkUrl}
                    </a>
                  </div>
                )}
                <div className="banner-dates">
                  {banner.startDate && (
                    <div>Start: {new Date(banner.startDate).toLocaleDateString()}</div>
                  )}
                  {banner.endDate && (
                    <div>End: {new Date(banner.endDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
              <div className="banner-actions">
                <button className="btn-edit" onClick={() => handleEdit(banner)}>
                  Edit
                </button>
                <button
                  className={`btn-toggle ${banner.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleStatus(banner.id)}
                >
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(banner.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Ad' : 'Create Ad'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter banner title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter banner description"
                />
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/banner.jpg"
                />
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Link URL</label>
                <input
                  type="url"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/target-page"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position *</label>
                  <select name="position" value={formData.position} onChange={handleInputChange} required>
                    <option value="HOME_TOP">Home Top</option>
                    <option value="HOME_MIDDLE">Home Middle</option>
                    <option value="HOME_BOTTOM">Home Bottom</option>
                    <option value="SERVICES_TOP">Services Top</option>
                    <option value="DASHBOARD">Dashboard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order *</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
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
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
