import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/vendorAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import './VendorBookings.css';

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'ALL' ? null : filter;
      const data = await vendorAPI.getBookings(statusFilter);
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await vendorAPI.updateBookingStatus(bookingId, newStatus);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
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
    return (
      <div className="vendor-bookings">
        <LoadingSpinner message="Loading bookings..." />
      </div>
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
          All Bookings
        </button>
        <button 
          className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setFilter('CONFIRMED')}
        >
          Confirmed
        </button>
        <button 
          className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed
        </button>
        <button 
          className={`filter-tab ${filter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setFilter('CANCELLED')}
        >
          Cancelled
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
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{booking.user?.firstName} {booking.user?.lastName}</strong>
                      <span className="customer-email">{booking.user?.email}</span>
                      {booking.user?.phone && <span className="customer-phone">{booking.user?.phone}</span>}
                    </div>
                  </td>
                  <td>{booking.service?.serviceName}</td>
                  <td>
                    <div className="booking-datetime">
                      <span className="booking-date">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      <span className="booking-time">{booking.bookingTime}</span>
                    </div>
                  </td>
                  <td className="booking-price">Rs.{booking.price?.toLocaleString()}</td>
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
