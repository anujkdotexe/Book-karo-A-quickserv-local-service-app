import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { useModal } from '../../components/Modal/Modal';
import './AdminServices.css';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const modal = useModal();

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingServices();
    } else {
      loadServices();
    }
  }, [activeTab, currentPage]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllServices(currentPage, 20);
      setServices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingServices = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingServices();
      setPendingServices(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to load pending services');
      setPendingServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (serviceId) => {
    modal.confirm(
      'Are you sure you want to approve this service?',
      {
        title: 'Approve Service',
        confirmText: 'Approve',
        onConfirm: async () => {
          try {
            await adminAPI.approveService(serviceId);
            modal.success('Service approved successfully');
            if (activeTab === 'pending') {
              loadPendingServices();
            } else {
              loadServices();
            }
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to approve service');
          }
        }
      }
    );
  };

  const handleReject = async (serviceId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    modal.confirm(
      `Are you sure you want to reject this service?\n\nReason: ${reason}`,
      {
        title: 'Reject Service',
        confirmText: 'Reject',
        onConfirm: async () => {
          try {
            await adminAPI.rejectService(serviceId, reason);
            modal.success('Service rejected successfully');
            if (activeTab === 'pending') {
              loadPendingServices();
            } else {
              loadServices();
            }
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to reject service');
          }
        }
      }
    );
  };

  const handleToggleFeatured = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    const newFeatured = !service?.featured;
    
    modal.confirm(
      `Are you sure you want to ${newFeatured ? 'feature' : 'unfeature'} this service?`,
      {
        title: 'Toggle Featured Status',
        confirmText: newFeatured ? 'Feature' : 'Unfeature',
        onConfirm: async () => {
          try {
            await adminAPI.toggleServiceFeatured(serviceId);
            modal.success(`Service ${newFeatured ? 'featured' : 'unfeatured'} successfully`);
            loadServices();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to toggle featured status');
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
            await adminAPI.deleteService(serviceId);
            modal.success('Service deleted successfully');
            loadServices();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to delete service');
          }
        }
      }
    );
  };

  const displayServices = activeTab === 'pending' ? pendingServices : services;

  if (loading && displayServices.length === 0) {
    return <div className="admin-services"><div className="loading-spinner">Loading services...</div></div>;
  }

  return (
    <div className="admin-services">
      <div className="services-header">
        <div>
          <h1>Service Management</h1>
          <p>Approve and manage platform services</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Services
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingServices.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!displayServices || displayServices.length === 0 ? (
        <div className="empty-state">
          <p>No {activeTab} services found.</p>
        </div>
      ) : (
        <div className="services-grid">
          {displayServices.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.serviceName}</h3>
                <div className="service-badges">
                  {service.isFeatured && (
                    <span className="badge featured">Featured</span>
                  )}
                  <span className={`badge status-${service.approvalStatus?.toLowerCase()}`}>
                    {service.approvalStatus}
                  </span>
                  <span className={`badge ${service.isAvailable ? 'active' : 'inactive'}`}>
                    {service.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="service-description">{service.description}</p>

              <div className="service-details">
                <div className="detail-item">
                  <span className="detail-label">Vendor:</span>
                  <span>{service.vendor?.businessName || 'N/A'}</span>
                </div>
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

              {service.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong>
                  <p>{service.rejectionReason}</p>
                </div>
              )}

              <div className="service-actions">
                {service.approvalStatus === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(service.id)} className="btn btn-success btn-sm">
                      Approve
                    </button>
                    <button onClick={() => handleReject(service.id)} className="btn btn-danger btn-sm">
                      Reject
                    </button>
                  </>
                )}
                {service.approvalStatus === 'APPROVED' && (
                  <>
                    <button onClick={() => handleToggleFeatured(service.id)} className="btn btn-primary btn-sm">
                      {service.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'all' && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
