import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { useModal } from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import '../Vendor/VendorBookings.css';

const AdminBookings = () => {
  const modal = useModal();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0
  });

  useEffect(() => {
    loadBookings();
  }, [filter, page]);

  useEffect(() => {
    loadStatusCounts();
  }, []);

  const loadStatusCounts = async () => {
    try {
      const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
      const counts = {};
      
      for (const status of statuses) {
        const statusFilter = status === 'ALL' ? null : status;
        const data = await adminAPI.getAllBookings(statusFilter, 0, 1);
        counts[status] = data.totalElements || 0;
      }
      
      setStatusCounts(counts);
    } catch (err) {
      console.error('Failed to load status counts:', err);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusFilter = filter === 'ALL' ? null : filter;
      const data = await adminAPI.getAllBookings(statusFilter, page, 20);
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    modal.prompt('Please provide a reason for cancelling this booking (optional):', {
      title: 'Cancel Booking',
      placeholder: 'Enter cancellation reason (e.g., customer request, vendor unavailable, etc.)...',
      minLength: 0,
      maxLength: 300,
      required: false,
      confirmText: 'Cancel Booking',
      cancelText: 'Go Back',
      onConfirm: async (reason) => {
        modal.confirm(
          `Are you sure you want to cancel this booking?${reason ? '\n\nReason: ' + reason : ''}`,
          {
            title: 'Confirm Cancellation',
            confirmText: 'Yes, Cancel Booking',
            cancelText: 'No, Go Back',
            onConfirm: async () => {
              try {
                await adminAPI.cancelBooking(bookingId, reason || 'Admin cancellation');
                modal.success('Booking cancelled successfully');
                loadBookings();
                loadStatusCounts();
              } catch (error) {
                modal.error(error.response?.data?.message || 'Failed to cancel booking');
              }
            }
          }
        );
      }
    });
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    modal.confirm(
      `Are you sure you want to change the booking status to ${newStatus}?`,
      {
        title: 'Update Booking Status',
        confirmText: 'Update Status',
        onConfirm: async () => {
          try {
            await adminAPI.updateBookingStatus(bookingId, newStatus);
            modal.success('Booking status updated successfully');
            loadBookings();
            loadStatusCounts();
          } catch (error) {
            modal.error(error.response?.data?.message || 'Failed to update status');
          }
        }
      }
    );
  };

  const handleRevertBooking = async (bookingId) => {
    modal.prompt('Please provide a reason for reverting this booking:', {
      title: 'Revert Completed Booking',
      placeholder: 'Enter revert reason (e.g., customer complaint, incorrect completion, etc.)...',
      minLength: 5,
      maxLength: 300,
      required: true,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      onConfirm: async (reason) => {
        // Show status selection modal
        modal.custom({
          title: 'Select New Status',
          content: (
            <div style={{ padding: '20px' }}>
              <p style={{ marginBottom: '20px' }}>Select the status to revert to:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => {
                    modal.close();
                    confirmRevert(bookingId, 'CONFIRMED', reason);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  CONFIRMED
                </button>
                <button
                  onClick={() => {
                    modal.close();
                    confirmRevert(bookingId, 'PENDING', reason);
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '12px' }}
                >
                  PENDING
                </button>
              </div>
            </div>
          ),
          showClose: true
        });
      }
    });
  };

  const confirmRevert = async (bookingId, newStatus, reason) => {
    modal.confirm(
      `Are you sure you want to revert this booking to ${newStatus}?\n\nReason: ${reason}`,
      {
        title: 'Confirm Revert',
        confirmText: 'Yes, Revert Booking',
        cancelText: 'Cancel',
        onConfirm: async () => {
          try {
            await adminAPI.revertBooking(bookingId, newStatus, reason);
            modal.success('Booking reverted successfully');
            loadBookings();
            loadStatusCounts();
          } catch (error) {
            modal.error(error.response?.data?.message || 'Failed to revert booking');
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

  if (loading && bookings.length === 0) {
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
          <h1>All Bookings</h1>
          <p>Manage platform-wide bookings</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => { setFilter('ALL'); setPage(0); }}
        >
          All ({statusCounts.ALL})
        </button>
        <button 
          className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => { setFilter('PENDING'); setPage(0); }}
        >
          Pending ({statusCounts.PENDING})
        </button>
        <button 
          className={`filter-tab ${filter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => { setFilter('CONFIRMED'); setPage(0); }}
        >
          Confirmed ({statusCounts.CONFIRMED})
        </button>
        <button 
          className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => { setFilter('COMPLETED'); setPage(0); }}
        >
          Completed ({statusCounts.COMPLETED})
        </button>
        <button 
          className={`filter-tab ${filter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => { setFilter('CANCELLED'); setPage(0); }}
        >
          Cancelled ({statusCounts.CANCELLED})
        </button>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="empty-state">
          <p>No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}bookings found.</p>
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
                        <strong>{booking.userName}</strong>
                        <span className="customer-email">{booking.userEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vendor-info">
                        <strong>{booking.vendorName}</strong>
                      </div>
                    </td>
                    <td>{booking.serviceName}</td>
                    <td>
                      <div className="booking-datetime">
                        <span className="booking-date">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                        <span className="booking-time">{booking.bookingTime}</span>
                      </div>
                    </td>
                    <td className="booking-price">Rs.{booking.totalAmount?.toLocaleString()}</td>
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
                          <>
                            {booking.status === 'COMPLETED' && (
                              <button
                                onClick={() => handleRevertBooking(booking.id)}
                                className="btn btn-warning btn-sm"
                                title="Revert to previous status"
                              >
                                Revert
                              </button>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <span className="text-muted">No actions</span>
                            )}
                          </>
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
