import React, { useState, useEffect } from 'react';
import { refundAPI } from '../services/api';
import { useModal } from '../components/Modal/Modal';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './AdminRefunds.css';

const AdminRefunds = () => {
  const modal = useModal();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [refundToReject, setRefundToReject] = useState(null);

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter, page]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await refundAPI.getAllRefunds(statusFilter, page, 10);
      const data = response.data.data;
      
      setRefunds(data.content || []);
      setTotalPages(data.totalPages || 0);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (refundId) => {
    // Replace alert/confirm with modal
    modal.confirm(
      'Are you sure you want to approve this refund? This will process the refund and cancel the booking.',
      {
        title: 'Approve Refund',
        confirmText: 'Approve Refund',
        onConfirm: async () => {
          try {
            setProcessingId(refundId);
            await refundAPI.approveRefund(refundId);
            
            modal.success('Refund approved successfully!');
            fetchRefunds();
            
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to approve refund');
          } finally {
            setProcessingId(null);
          }
        }
      }
    );
  };

  const openRejectModal = (refund) => {
    setRefundToReject(refund);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setRefundToReject(null);
    setRejectReason('');
    setShowRejectModal(false);
  };

  const handleReject = async () => {
    // Replace alert with modal
    if (!rejectReason.trim()) {
      modal.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(refundToReject.id);
      await refundAPI.rejectRefund(refundToReject.id, rejectReason);
      
      modal.success('Refund rejected successfully!');
      closeRejectModal();
      fetchRefunds();
      
    } catch (err) {
      modal.error(err.response?.data?.message || 'Failed to reject refund');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      PENDING: 'status-pending',
      PROCESSING: 'status-processing',
      COMPLETED: 'status-completed',
      REJECTED: 'status-rejected',
    };
    return classes[status] || 'status-pending';
  };

  if (loading && refunds.length === 0) {
    return <LoadingSpinner message="Loading refunds..." fullScreen />;
  }

  return (
    <div className="admin-refunds-page">
      <div className="admin-refunds-container">
        <div className="page-header">
          <h1>Refund Management</h1>
          <p>Review and process customer refund requests</p>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Status Filter:</label>
            <div className="status-tabs">
              {['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  className={`status-tab ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(0);
                  }}
                >
                  {status}
                </button>
              ))}
              <button
                className={`status-tab ${statusFilter === null ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(null);
                  setPage(0);
                }}
              >
                ALL
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {refunds.length === 0 ? (
          <div className="empty-state">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <h2>No Refunds Found</h2>
            <p>There are no {statusFilter ? statusFilter.toLowerCase() : ''} refund requests at this time.</p>
          </div>
        ) : (
          <>
            <div className="refunds-table-container">
              <table className="refunds-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Booking Date</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => (
                    <tr key={refund.id}>
                      <td>#{refund.id}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{refund.customerName}</div>
                          <div className="customer-email">{refund.customerEmail}</div>
                        </div>
                      </td>
                      <td>{refund.serviceName}</td>
                      <td>{new Date(refund.bookingDate).toLocaleDateString()}</td>
                      <td className="amount-cell">₹{refund.amount.toFixed(2)}</td>
                      <td>
                        <div className="reason-cell" title={refund.reason}>
                          {refund.reason.length > 50 
                            ? refund.reason.substring(0, 50) + '...' 
                            : refund.reason}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(refund.status)}`}>
                          {refund.status}
                        </span>
                      </td>
                      <td>{new Date(refund.createdAt).toLocaleDateString()}</td>
                      <td>
                        {refund.status === 'PENDING' && (
                          <div className="action-buttons">
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(refund.id)}
                              disabled={processingId === refund.id}
                            >
                              {processingId === refund.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => openRejectModal(refund)}
                              disabled={processingId === refund.id}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {refund.status !== 'PENDING' && (
                          <span className="status-final">
                            {refund.processedAt 
                              ? new Date(refund.processedAt).toLocaleDateString()
                              : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0 || loading}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {showRejectModal && (
          <div className="modal-overlay" onClick={closeRejectModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reject Refund Request</h2>
                <button className="modal-close" onClick={closeRejectModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="refund-summary">
                  <p><strong>Customer:</strong> {refundToReject?.customerName}</p>
                  <p><strong>Amount:</strong> ₹{refundToReject?.amount.toFixed(2)}</p>
                  <p><strong>Reason:</strong> {refundToReject?.reason}</p>
                </div>
                <div className="form-group">
                  <label>Rejection Reason *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for rejecting this refund request"
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-outline" onClick={closeRejectModal}>
                  Cancel
                </button>
                <button
                  className="btn-reject-confirm"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processingId}
                >
                  {processingId ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRefunds;
