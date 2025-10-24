import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { useModal } from '../../components/Modal/Modal';
import './AdminVendors.css';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const modal = useModal();

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllVendors(currentPage, 20);
      setVendors(data.content || []);
      setTotalPages(data.totalPages || 0);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, modal]);

  const loadPendingVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingVendors();
      setPendingVendors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to load pending vendors');
      setPendingVendors([]);
    } finally {
      setLoading(false);
    }
  }, [modal]);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingVendors();
    } else {
      loadVendors();
    }
  }, [activeTab, currentPage, loadVendors, loadPendingVendors]);

  const handleApprove = async (vendorId) => {
    modal.confirm(
      'Are you sure you want to approve this vendor?',
      {
        title: 'Approve Vendor',
        confirmText: 'Approve',
        onConfirm: async () => {
          try {
            await adminAPI.approveVendor(vendorId);
            modal.success('Vendor approved successfully');
            if (activeTab === 'pending') {
              loadPendingVendors();
            } else {
              loadVendors();
            }
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to approve vendor');
          }
        }
      }
    );
  };

  const handleReject = async (vendorId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    modal.confirm(
      `Are you sure you want to reject this vendor?\n\nReason: ${reason}`,
      {
        title: 'Reject Vendor',
        confirmText: 'Reject',
        onConfirm: async () => {
          try {
            await adminAPI.rejectVendor(vendorId, reason);
            modal.success('Vendor rejected successfully');
            if (activeTab === 'pending') {
              loadPendingVendors();
            } else {
              loadVendors();
            }
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to reject vendor');
          }
        }
      }
    );
  };

  const handleSuspend = async (vendorId) => {
    const reason = window.prompt('Please provide a reason for suspension:');
    if (!reason) return;
    
    modal.confirm(
      `Are you sure you want to suspend this vendor?\n\nReason: ${reason}`,
      {
        title: 'Suspend Vendor',
        confirmText: 'Suspend',
        onConfirm: async () => {
          try {
            await adminAPI.suspendVendor(vendorId, reason);
            modal.success('Vendor suspended successfully');
            loadVendors();
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to suspend vendor');
          }
        }
      }
    );
  };

  const displayVendors = activeTab === 'pending' ? pendingVendors : vendors;

  if (loading && displayVendors.length === 0) {
    return <div className="admin-vendors"><div className="loading-spinner">Loading vendors...</div></div>;
  }

  return (
    <div className="admin-vendors">
      <div className="vendors-header">
        <div>
          <h1>Vendor Management</h1>
          <p>Approve and manage service vendors</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Vendors
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingVendors.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!displayVendors || displayVendors.length === 0 ? (
        <div className="empty-state">
          <p>No {activeTab} vendors found.</p>
        </div>
      ) : (
        <div className="vendors-grid">
          {displayVendors.map(vendor => (
            <div key={vendor.id} className="vendor-card">
              <div className="vendor-header">
                <div>
                  <h3>{vendor.businessName}</h3>
                  <p className="vendor-code">Code: {vendor.vendorCode}</p>
                </div>
                <span className={`status-badge status-${vendor.approvalStatus?.toLowerCase()}`}>
                  {vendor.approvalStatus}
                </span>
              </div>

              <div className="vendor-details">
                <div className="detail-item">
                  <span className="detail-label">Owner:</span>
                  <span>{vendor.ownerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact:</span>
                  <span>{vendor.contactEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span>{vendor.contactPhone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span>{vendor.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span>{vendor.primaryCategory}</span>
                </div>
                {vendor.averageRating > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Rating:</span>
                    <span>{vendor.averageRating.toFixed(1)} / 5.0</span>
                  </div>
                )}
              </div>

              {vendor.description && (
                <p className="vendor-description">{vendor.description}</p>
              )}

              {vendor.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong>
                  <p>{vendor.rejectionReason}</p>
                </div>
              )}

              <div className="vendor-actions">
                {vendor.approvalStatus === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(vendor.id)} className="btn btn-success btn-sm">
                      Approve
                    </button>
                    <button onClick={() => handleReject(vendor.id)} className="btn btn-danger btn-sm">
                      Reject
                    </button>
                  </>
                )}
                {vendor.approvalStatus === 'APPROVED' && (
                  <button onClick={() => handleSuspend(vendor.id)} className="btn btn-warning btn-sm">
                    Suspend
                  </button>
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

export default AdminVendors;
