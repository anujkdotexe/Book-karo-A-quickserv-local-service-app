import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminRefunds.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8081';

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('ASC');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortKey(key);
      setSortDir('ASC');
    }
  };

  const renderSortIndicator = (key) => {
    if (sortKey !== key) return <span className="sort-indicator neutral" aria-hidden="true">↕</span>;
    return <span className="sort-indicator active" aria-hidden="true">{sortDir === 'ASC' ? '▲' : '▼'}</span>;
  };

  const getSortedRefunds = () => {
    if (!refunds || !Array.isArray(refunds)) return [];
    return [...refunds].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === 'bookingRef') {
        aVal = (a.booking?.bookingReference || `BK-${a.booking?.id}` || '').toLowerCase();
        bVal = (b.booking?.bookingReference || `BK-${b.booking?.id}` || '').toLowerCase();
      } else if (sortKey === 'customer') {
        aVal = (a.booking?.user?.fullName || a.booking?.user?.email || '').toLowerCase();
        bVal = (b.booking?.user?.fullName || b.booking?.user?.email || '').toLowerCase();
      } else if (sortKey === 'amount') {
        aVal = Number(a.amount) || 0;
        bVal = Number(b.amount) || 0;
      } else if (sortKey === 'id') {
        aVal = Number(a.id) || 0;
        bVal = Number(b.id) || 0;
      } else if (sortKey === 'requestedAt') {
        aVal = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
        bVal = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
      } else if (sortKey === 'processedAt') {
        aVal = a.processedAt ? new Date(a.processedAt).getTime() : 0;
        bVal = b.processedAt ? new Date(b.processedAt).getTime() : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDir === 'ASC' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'ASC' ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = statusFilter === 'ALL' 
        ? `${API_BASE_URL}/api/v1/admin/refunds`
        : `${API_BASE_URL}/api/v1/admin/refunds?status=${statusFilter}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRefunds(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching refunds:', err);
      setError('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundId, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this refund?`)) {
      return;
    }

    try {
      setProcessingId(refundId);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/v1/admin/refunds/${refundId}/${action.toLowerCase()}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRefunds();
    } catch (err) {
      console.error('Error processing refund:', err);
      alert(`Failed to ${action.toLowerCase()} refund: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-badge pending';
      case 'PROCESSING': return 'status-badge processing';
      case 'COMPLETED': return 'status-badge completed';
      case 'REJECTED': return 'status-badge rejected';
      default: return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading refunds..." size="thick" fullScreen />;
  }

  return (
    <div className="admin-refunds">
      <div className="refunds-header">
        <h1>Refund Management</h1>
        <div className="header-stats">
          <span className="stat-badge pending">Pending: {refunds.filter(r => r.status === 'PENDING').length}</span>
          <span className="stat-badge processing">Processing: {refunds.filter(r => r.status === 'PROCESSING').length}</span>
          <span className="stat-badge completed">Completed: {refunds.filter(r => r.status === 'COMPLETED').length}</span>
        </div>
      </div>

      <div className="filters">
        <button 
          className={statusFilter === 'ALL' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setStatusFilter('ALL')}
        >
          All ({refunds.length})
        </button>
        <button 
          className={statusFilter === 'PENDING' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setStatusFilter('PENDING')}
        >
          Pending
        </button>
        <button 
          className={statusFilter === 'PROCESSING' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setStatusFilter('PROCESSING')}
        >
          Processing
        </button>
        <button 
          className={statusFilter === 'COMPLETED' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          Completed
        </button>
        <button 
          className={statusFilter === 'REJECTED' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setStatusFilter('REJECTED')}
        >
          Rejected
        </button>
      </div>

      {error && (
        <div className="error-card">
          <p>{error}</p>
          <button onClick={fetchRefunds} className="btn btn-primary">Retry</button>
        </div>
      )}

      {refunds.length === 0 ? (
        <div className="empty-state">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <h2>No Refunds Found</h2>
          <p>There are no refunds {statusFilter !== 'ALL' && `with status ${statusFilter}`} at the moment.</p>
        </div>
      ) : (
        <div className="refunds-table-container">
          <table className="refunds-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className="sortable-header" title="Sort by Refund ID">
                  Refund ID {renderSortIndicator('id')}
                </th>
                <th onClick={() => handleSort('bookingRef')} className="sortable-header" title="Sort by Booking ID">
                  Booking ID {renderSortIndicator('bookingRef')}
                </th>
                <th onClick={() => handleSort('customer')} className="sortable-header" title="Sort by Customer">
                  Customer {renderSortIndicator('customer')}
                </th>
                <th onClick={() => handleSort('amount')} className="sortable-header" title="Sort by Amount">
                  Amount {renderSortIndicator('amount')}
                </th>
                <th onClick={() => handleSort('reason')} className="sortable-header" title="Sort by Reason">
                  Reason {renderSortIndicator('reason')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable-header" title="Sort by Status">
                  Status {renderSortIndicator('status')}
                </th>
                <th onClick={() => handleSort('requestedAt')} className="sortable-header" title="Sort by Requested Date">
                  Requested At {renderSortIndicator('requestedAt')}
                </th>
                <th onClick={() => handleSort('processedAt')} className="sortable-header" title="Sort by Processed Date">
                  Processed At {renderSortIndicator('processedAt')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedRefunds().map(refund => (
                <tr key={refund.id}>
                  <td>#{refund.id}</td>
                  <td>
                    <span className="booking-ref">
                      {refund.booking?.bookingReference || `BK-${refund.booking?.id}`}
                    </span>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{refund.booking?.user?.fullName || 'N/A'}</div>
                      <div className="customer-email">{refund.booking?.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="amount">Rs.{refund.amount?.toLocaleString() || 0}</td>
                  <td className="reason">{refund.reason || 'No reason provided'}</td>
                  <td>
                    <span className={getStatusBadgeClass(refund.status)}>
                      {refund.status}
                    </span>
                  </td>
                  <td>{formatDate(refund.requestedAt)}</td>
                  <td>{formatDate(refund.processedAt)}</td>
                  <td className="actions">
                    {refund.status === 'PENDING' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleProcessRefund(refund.id, 'APPROVE')}
                          disabled={processingId === refund.id}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleProcessRefund(refund.id, 'REJECT')}
                          disabled={processingId === refund.id}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {refund.status === 'PROCESSING' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleProcessRefund(refund.id, 'COMPLETE')}
                        disabled={processingId === refund.id}
                      >
                        Mark Completed
                      </button>
                    )}
                    {(refund.status === 'COMPLETED' || refund.status === 'REJECTED') && (
                      <span className="action-disabled">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
