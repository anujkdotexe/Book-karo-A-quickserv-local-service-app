import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/vendorAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useModal } from '../../components/Modal/Modal';
import './VendorServices.css';

const VendorServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'PLUMBING',
    price: '',
    durationMinutes: '',
    isAvailable: true
  });
  const modal = useModal();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getServices();
      setServices(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        serviceName: service.serviceName,
        description: service.description,
        category: service.category,
        price: service.price,
        durationMinutes: service.durationMinutes,
        isAvailable: service.isAvailable
      });
    } else {
      setEditingService(null);
      setFormData({
        serviceName: '',
        description: '',
        category: 'PLUMBING',
        price: '',
        durationMinutes: '',
        isAvailable: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await vendorAPI.updateService(editingService.id, formData);
        modal.success('Service updated successfully');
      } else {
        await vendorAPI.createService(formData);
        modal.success('Service created successfully');
      }
      handleCloseModal();
      loadServices();
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to save service');
    }
  };

  const handleToggleAvailability = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    const newStatus = !service?.isAvailable;
    
    modal.confirm(
      `Are you sure you want to ${newStatus ? 'enable' : 'disable'} this service?`,
      {
        title: 'Toggle Service Availability',
        confirmText: newStatus ? 'Enable' : 'Disable',
        onConfirm: async () => {
          try {
            await vendorAPI.toggleServiceAvailability(serviceId);
            modal.success(`Service ${newStatus ? 'enabled' : 'disabled'} successfully`);
            loadServices();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to toggle service');
          }
        }
      }
    );
  };

  const handleDelete = async (serviceId) => {
    modal.confirm(
      'Are you sure you want to delete this service? This action cannot be undone.',
      {
        title: 'Delete Service',
        confirmText: 'Delete',
        onConfirm: async () => {
          try {
            await vendorAPI.deleteService(serviceId);
            modal.success('Service deleted successfully');
            loadServices();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to delete service');
          }
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="vendor-services">
        <LoadingSpinner message="Loading services..." />
      </div>
    );
  }

  return (
    <div className="vendor-services">
      <div className="services-header">
        <div>
          <h1>My Services</h1>
          <p>Manage your service offerings</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          Add New Service
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!services || services.length === 0 ? (
        <div className="empty-state">
          <p>No services yet. Create your first service to start receiving bookings!</p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            Create Service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.serviceName}</h3>
                <div className="service-badges">
                  <span className={`badge ${service.isAvailable ? 'active' : 'inactive'}`}>
                    {service.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                  {service.approvalStatus && (
                    <span className={`badge status-${service.approvalStatus.toLowerCase()}`}>
                      {service.approvalStatus}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="service-description">{service.description}</p>
              
              <div className="service-details">
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span>{service.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price:</span>
                  <span className="price">Rs.{service.price?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span>{service.durationMinutes} mins</span>
                </div>
                {service.averageRating > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Rating:</span>
                    <span>{service.averageRating.toFixed(1)} / 5.0</span>
                  </div>
                )}
              </div>

              <div className="service-actions">
                <button onClick={() => handleToggleAvailability(service.id)} className="btn btn-outline btn-sm">
                  {service.isAvailable ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleOpenModal(service)} className="btn btn-outline btn-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(service.id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleCloseModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={e => setFormData({...formData, serviceName: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="PAINTING">Painting</option>
                    <option value="PEST_CONTROL">Pest Control</option>
                    <option value="APPLIANCE_REPAIR">Appliance Repair</option>
                    <option value="AC_REPAIR">AC Repair</option>
                    <option value="SALON">Salon</option>
                    <option value="PHOTOGRAPHY">Photography</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={e => setFormData({...formData, durationMinutes: e.target.value})}
                  min="15"
                  step="15"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                  />
                  <span>Service is available for booking</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorServices;
