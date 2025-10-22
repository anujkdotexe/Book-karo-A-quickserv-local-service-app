import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { useToast } from '../../components/Toast/Toast';
import '../Vendor/VendorBookings.css';

const AdminBookings = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadBookings();
  }, [filter, page]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'ALL' ? null : filter;
      const data = await adminAPI.getAllBookings(statusFilter, page, 20);
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Enter cancellation reason (optional):');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      await adminAPI.cancelBooking(bookingId, reason);
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!window.confirm(`Change booking status to ${newStatus}?`)) return;
    
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      toast.success('Booking status updated successfully');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
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

  if (loading && bookings.length === 0) {
    return (
      <div className="vendor-bookings">
        <div className="loading-spinner">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="vendor-bookings">
      <div className="bookings-header">
        <div>
          <h1>All Bookings</h1>
          <p>Manage platform-wide bookings</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => { setFilter('ALL'); setPage(0); }}
        >
          All ({bookings.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => { setFilter('PENDING'); setPage(0); }}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => { setFilter('CONFIRMED'); setPage(0); }}
        >
          Confirmed
        </button>
        <button 
          className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => { setFilter('COMPLETED'); setPage(0); }}
        >
          Completed
        </button>
        <button 
          className={`filter-tab ${filter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => { setFilter('CANCELLED'); setPage(0); }}
        >
          Cancelled
        </button>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="empty-state">
          <p>No {filter.toLowerCase()} bookings found.</p>
        </div>
      ) : (
        <>
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Vendor</th>
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
                        <strong>{booking.user?.fullName || `${booking.user?.firstName} ${booking.user?.lastName}`}</strong>
                        <span className="customer-email">{booking.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vendor-info">
                        <strong>{booking.service?.vendor?.businessName}</strong>
                        <span className="vendor-phone">{booking.service?.vendor?.phone}</span>
                      </div>
                    </td>
                    <td>{booking.service?.serviceName}</td>
                    <td>
                      <div className="booking-datetime">
                        <span className="booking-date">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
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
                              title="Confirm booking"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="btn btn-danger btn-sm"
                              title="Cancel booking"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                              className="btn btn-success btn-sm"
                              title="Mark as completed"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="btn btn-danger btn-sm"
                              title="Cancel booking"
                            >
                              Cancel
                            </button>
                          </>
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

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBookings;
