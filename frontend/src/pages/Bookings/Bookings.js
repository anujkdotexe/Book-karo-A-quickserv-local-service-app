import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingAPI.getUserBookings(
        statusFilter === 'ALL' ? null : statusFilter
      );
      const bookingsData = response.data.data || [];
      // Deduplicate bookings by ID
      const uniqueBookings = Array.from(
        new Map(bookingsData.map(b => [b.id, b])).values()
      );
      setBookings(uniqueBookings);
      setLoading(false);
    } catch (err) {
      setError('Failed to load bookings');
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <div className="bookings-header fade-in">
          <h1>My Bookings</h1>
          <p>Manage and track all your service bookings</p>
        </div>

        <div className="bookings-filter fade-in">
          <button
            className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'CONFIRMED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CONFIRMED')}
          >
            Confirmed
          </button>
          <button
            className={`filter-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CANCELLED')}
          >
            Cancelled
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {bookings.length > 0 ? (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="booking-card"
              >
                <div className="booking-header">
                  <h3>{booking.serviceName}</h3>
                  <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                    {booking.status === 'PENDING' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                    {booking.status === 'COMPLETED' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    )}
                    {booking.status === 'CANCELLED' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    )}
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-row">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">#{booking.id}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{booking.bookingTime}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span className="detail-label">Service Provider:</span>
                    <span className="detail-value">{booking.vendorName}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="booking-notes">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}

                <div className="booking-footer">
                  <span className="booking-date-created">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                  <span className="view-details">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 18h.01"></path>
              <path d="M12 18h.01"></path>
              <path d="M16 18h.01"></path>
            </svg>
            <h2>
              {statusFilter === 'ALL'
                ? 'No Bookings Yet'
                : `No ${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Bookings`}
            </h2>
            <p>
              {statusFilter === 'ALL'
                ? 'Start exploring our services and book your first appointment!'
                : `You don't have any ${statusFilter.toLowerCase()} bookings at the moment.`}
            </p>
            {statusFilter === 'ALL' && (
              <div className="empty-state-benefits">
                <h3>Why book with bookkaro?</h3>
                <ul>
                  <li>Browse 165+ quality services across multiple categories</li>
                  <li>Verified service providers with real customer ratings</li>
                  <li>Easy and secure booking process</li>
                  <li>Track your bookings in real-time</li>
                </ul>
              </div>
            )}
            <Link to="/services" className="btn btn-primary btn-large btn-cta-prominent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
