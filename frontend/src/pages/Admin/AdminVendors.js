import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { useModal } from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import './AdminVendors.css';

const AdminVendors = () => {
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [approvedVendors, setApprovedVendors] = useState([]);
  const [suspendedVendors, setSuspendedVendors] = useState([]);
  const [rejectedVendors, setRejectedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [activeTab, setActiveTab] = useState(location.state?.filter === 'PENDING' ? 'pending' : 'all');
  const modal = useModal();

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getAllVendors(currentPage, 20);
      setVendors(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalVendors(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors. Please try again.');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadPendingVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getPendingVendors();
      setPendingVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending vendors. Please try again.');
      setPendingVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApprovedVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getAllVendors(0, 1000); // Get all to filter approved
      const approved = (data.content || []).filter(v => v.approvalStatus === 'APPROVED');
      setApprovedVendors(approved);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approved vendors. Please try again.');
      setApprovedVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuspendedVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getAllVendors(0, 1000); // Get all to filter suspended
      const suspended = (data.content || []).filter(v => v.approvalStatus === 'SUSPENDED');
      setSuspendedVendors(suspended);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suspended vendors. Please try again.');
      setSuspendedVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRejectedVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getAllVendors(0, 1000); // Get all to filter rejected
      const rejected = (data.content || []).filter(v => v.approvalStatus === 'REJECTED');
      setRejectedVendors(rejected);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rejected vendors. Please try again.');
      setRejectedVendors([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removed unused 'modal' dependency

  // Load counts for all categories on initial page load
  useEffect(() => {
    const loadAllCounts = async () => {
      try {
        const [allData, pendingData] = await Promise.all([
          adminAPI.getAllVendors(0, 1000),
          adminAPI.getPendingVendors()
        ]);
        
        const allVendors = allData.content || [];
        setPendingVendors(Array.isArray(pendingData) ? pendingData : []);
        setApprovedVendors(allVendors.filter(v => v.approvalStatus === 'APPROVED'));
        setSuspendedVendors(allVendors.filter(v => v.approvalStatus === 'SUSPENDED'));
        setRejectedVendors(allVendors.filter(v => v.approvalStatus === 'REJECTED'));
      } catch (err) {
        console.error('Failed to load vendor counts:', err);
      }
    };
    
    loadAllCounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingVendors();
    } else if (activeTab === 'approved') {
      loadApprovedVendors();
    } else if (activeTab === 'suspended') {
      loadSuspendedVendors();
    } else if (activeTab === 'rejected') {
      loadRejectedVendors();
    } else {
      loadVendors();
    }
  }, [activeTab, currentPage, loadVendors, loadPendingVendors, loadApprovedVendors, loadSuspendedVendors, loadRejectedVendors]);

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
    modal.prompt('Please provide a detailed reason for rejecting this vendor application:', {
      title: 'Reject Vendor',
      placeholder: 'Enter rejection reason (e.g., incomplete documents, invalid information, etc.)...',
      minLength: 10,
      maxLength: 500,
      confirmText: 'Reject Vendor',
      cancelText: 'Cancel',
      onConfirm: async (reason) => {
        modal.confirm(
          `Are you sure you want to reject this vendor?\n\nReason: ${reason}`,
          {
            title: 'Confirm Rejection',
            confirmText: 'Yes, Reject',
            cancelText: 'No, Cancel',
            onConfirm: async () => {
              try {
                setLoading(true);
                await adminAPI.rejectVendor(vendorId, reason);
                modal.success('Vendor rejected successfully');
                // Reload appropriate vendor list
                if (activeTab === 'pending') {
                  await loadPendingVendors();
                } else {
                  await loadVendors();
                }
              } catch (err) {
                console.error('Vendor rejection error:', err);
                modal.error(err.response?.data?.message || 'Failed to reject vendor. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          }
        );
      }
    });
  };

  const handleSuspend = async (vendorId) => {
    modal.prompt('Please provide a detailed reason for suspending this vendor:', {
      title: 'Suspend Vendor',
      placeholder: 'Enter suspension reason (e.g., policy violation, quality issues, customer complaints, etc.)...',
      minLength: 10,
      maxLength: 500,
      confirmText: 'Suspend Vendor',
      cancelText: 'Cancel',
      onConfirm: async (reason) => {
        modal.confirm(
          `Are you sure you want to suspend this vendor?\n\nReason: ${reason}\n\nThe vendor will be unable to accept new bookings.`,
          {
            title: 'Confirm Suspension',
            confirmText: 'Yes, Suspend',
            cancelText: 'No, Cancel',
            onConfirm: async () => {
              try {
                await adminAPI.suspendVendor(vendorId, reason);
                modal.success('Vendor suspended successfully');
                loadVendors();
                loadSuspendedVendors(); // Refresh suspended list
              } catch (err) {
                modal.error(err.response?.data?.message || 'Failed to suspend vendor');
              }
            }
          }
        );
      }
    });
  };

  const handleReactivate = async (vendorId) => {
    modal.confirm(
      'Are you sure you want to reactivate this vendor? They will be able to accept bookings again.',
      {
        title: 'Reactivate Vendor',
        confirmText: 'Reactivate',
        onConfirm: async () => {
          try {
            await adminAPI.reactivateVendor(vendorId);
            modal.success('Vendor reactivated successfully');
            loadVendors();
            loadSuspendedVendors(); // Refresh suspended list
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to reactivate vendor');
          }
        }
      }
    );
  };

  const displayVendors = activeTab === 'pending' ? pendingVendors : 
                         (activeTab === 'approved' ? approvedVendors : 
                         (activeTab === 'suspended' ? suspendedVendors : 
                         (activeTab === 'rejected' ? rejectedVendors : vendors)));

  if (loading && displayVendors.length === 0) {
    return <LoadingSpinner message="Loading vendors..." fullScreen />;
  }

  if (error && displayVendors.length === 0) {
    return (
      <ErrorModal
        title="Failed to Load Vendors"
        message={error}
        onRefresh={() => {
          if (activeTab === 'pending') loadPendingVendors();
          else if (activeTab === 'suspended') loadSuspendedVendors();
          else if (activeTab === 'rejected') loadRejectedVendors();
          else loadVendors();
        }}
        onClose={() => setError(null)}
      />
    );
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
          All Vendors ({totalVendors})
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingVendors.length})
        </button>
        <button
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({approvedVendors.length})
        </button>
        <button
          className={`tab ${activeTab === 'suspended' ? 'active' : ''}`}
          onClick={() => setActiveTab('suspended')}
        >
          Suspended ({suspendedVendors.length})
        </button>
        <button
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected ({rejectedVendors.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!displayVendors || displayVendors.length === 0 ? (
        <div className="empty-state">
          <p>No {activeTab === 'all' ? '' : activeTab + ' '}vendors found.</p>
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
                {vendor.approvalStatus === 'SUSPENDED' && (
                  <button onClick={() => handleReactivate(vendor.id)} className="btn btn-success btn-sm">
                    Reactivate
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
