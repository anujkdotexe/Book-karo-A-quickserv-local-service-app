import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { vendorAPI } from '../../services/vendorAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import { useModal } from '../../components/Modal/Modal';
import './VendorBookings.css';

const VendorBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(location.state?.filter || 'ALL');
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0
  });
  const modal = useModal();

  const loadStatusCounts = useCallback(async () => {
    try {
      const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
      const counts = {};
      
      for (const status of statuses) {
        const statusFilter = status === 'ALL' ? null : status;
        const data = await vendorAPI.getBookings(statusFilter);
        counts[status] = data.totalElements || 0;
      }
      
      setStatusCounts(counts);
    } catch (err) {
      console.error('Failed to load status counts:', err);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statusFilter = filter === 'ALL' ? null : filter;
      const data = await vendorAPI.getBookings(statusFilter);
      setBookings(data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);
  
  // Update filter when navigating from dashboard
  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const statusActions = {
      'CONFIRMED': { action: 'accept', color: 'success' },
      'CANCELLED': { action: 'reject', color: 'danger' },
      'COMPLETED': { action: 'complete', color: 'primary' }
    };
    
    const { action } = statusActions[newStatus] || {};
    
    modal.confirm(
      `Are you sure you want to ${action} this booking?`,
      {
        title: 'Confirm Status Change',
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        onConfirm: async () => {
          try {
            setLoading(true);
            await vendorAPI.updateBookingStatus(bookingId, newStatus);
            modal.success('Booking status updated successfully');
            await loadBookings();
            await loadStatusCounts(); // Reload counts after status change
          } catch (err) {
            modal.error(err.response?.data?.message || 'Failed to update booking status');
          } finally {
            setLoading(false);
          }
        }
      }
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bookings..." fullScreen />;
  }

  if (error && bookings.length === 0) {
    return (
      <ErrorModal
        title="Failed to Load Bookings"
        message={error}
        onRefresh={loadBookings}
        onClose={() => setError(null)}
      />
    );
  }

  return (
    <div className="vendor-bookings">
      <div className="bookings-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>View and manage customer bookings</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Bookings ({statusCounts.ALL})
        </button>
        <button 
          className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pending ({statusCounts.PENDING})
        </button>
        <button 
          className={`filter-tab ${filter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setFilter('CONFIRMED')}
        >
          Confirmed ({statusCounts.CONFIRMED})
        </button>
        <button 
          className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed ({statusCounts.COMPLETED})
        </button>
        <button 
          className={`filter-tab ${filter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setFilter('CANCELLED')}
        >
          Cancelled ({statusCounts.CANCELLED})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!bookings || bookings.length === 0 ? (
        <div className="empty-state">
          <p>No {filter.toLowerCase()} bookings found.</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.length > 0 && bookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{booking.userName || 'N/A'}</strong>
                      <span className="customer-email">{booking.userEmail || ''}</span>
                    </div>
                  </td>
                  <td>{booking.serviceName || booking.service?.serviceName || 'N/A'}</td>
                  <td>
                    <div className="booking-datetime">
                      <span className="booking-date">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      <span className="booking-time">{booking.bookingTime}</span>
                    </div>
                  </td>
                  <td className="booking-price">Rs.{booking.totalAmount?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="booking-actions">
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                            className="btn btn-success btn-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            className="btn btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                          className="btn btn-primary btn-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                      {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
                        <span className="text-muted">No actions</span>
                      )}
                    </div>
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

export default VendorBookings;
