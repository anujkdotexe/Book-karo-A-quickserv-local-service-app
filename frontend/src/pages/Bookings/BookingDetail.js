import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import './BookingDetail.css';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await bookingAPI.getBookingById(id);
      setBooking(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load booking details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleReviewChange = (e) => {
    setReviewData({
      ...reviewData,
      [e.target.name]: e.target.value
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    try {
      await reviewAPI.createReview({
        bookingId: parseInt(id),
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment
      });
      
      setReviewSuccess('Review submitted successfully');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      
      setTimeout(() => {
        fetchBookingDetails();
      }, 1500);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.updateBookingStatus(id, 'CANCELLED');
      toast.success('Booking cancelled successfully');
      fetchBookingDetails();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel booking';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      COMPLETED: '#10b981',
      CANCELLED: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="error-container">
        <h2>Booking Not Found</h2>
        <p>{error || 'The booking you are looking for does not exist.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/bookings')}>
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="booking-detail-page">
      <div className="container">
        <button className="btn btn-outline back-button" onClick={() => navigate('/bookings')}>
          Back to Bookings
        </button>

        <div className="booking-detail-container fade-in">
          <div className="booking-detail-header">
            <div className="header-left">
              <h1>Booking Details</h1>
              <p className="booking-id">Booking ID: #{booking.id}</p>
            </div>
            <span
              className="booking-status-badge"
              style={{ backgroundColor: getStatusColor(booking.status) }}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="booking-detail-grid">
            <div className="booking-main-content">
              <section className="detail-section">
                <h3>Service Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Service Name:</span>
                    <span className="info-value">{booking.serviceName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Category:</span>
                    <span className="info-value">{booking.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Service Provider:</span>
                    <span className="info-value">{booking.vendorName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Price:</span>
                    <span className="info-value">₹{booking.price}</span>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h3>Booking Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Booking Date:</span>
                    <span className="info-value">
                      {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Booking Time:</span>
                    <span className="info-value">{booking.bookingTime}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Created On:</span>
                    <span className="info-value">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                    <div className="info-item">
                      <span className="info-label">Last Updated:</span>
                      <span className="info-value">
                        {new Date(booking.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {booking.notes && (
                  <div className="booking-notes-section">
                    <h4>Additional Notes:</h4>
                    <p>{booking.notes}</p>
                  </div>
                )}
              </section>

              {booking.status === 'COMPLETED' && (
                <section className="detail-section">
                  <h3>Review This Service</h3>
                  {!showReviewForm ? (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </button>
                  ) : (
                    <div className="review-form-container">
                      {reviewError && <div className="error-message">{reviewError}</div>}
                      {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
                      
                      <form onSubmit={handleReviewSubmit}>
                        <div className="form-group">
                          <label htmlFor="rating">Rating</label>
                          <select
                            id="rating"
                            name="rating"
                            value={reviewData.rating}
                            onChange={handleReviewChange}
                            required
                          >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Below Average</option>
                            <option value="1">1 - Poor</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="comment">Review Comment</label>
                          <textarea
                            id="comment"
                            name="comment"
                            value={reviewData.comment}
                            onChange={handleReviewChange}
                            rows="4"
                            placeholder="Share your experience with this service"
                            required
                          />
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary">
                            Submit Review
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => setShowReviewForm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="booking-sidebar">
              <div className="status-timeline">
                <h3>Booking Status</h3>
                <div className="timeline">
                  <div className={`timeline-item ${['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status) ? 'active' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <strong>Booking Placed</strong>
                      <p>Your booking has been received</p>
                    </div>
                  </div>
                  <div className={`timeline-item ${['CONFIRMED', 'COMPLETED'].includes(booking.status) ? 'active' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <strong>Confirmed</strong>
                      <p>Service provider confirmed</p>
                    </div>
                  </div>
                  <div className={`timeline-item ${booking.status === 'COMPLETED' ? 'active' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <strong>Completed</strong>
                      <p>Service has been delivered</p>
                    </div>
                  </div>
                  {booking.status === 'CANCELLED' && (
                    <div className="timeline-item active cancelled">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <strong>Cancelled</strong>
                        <p>Booking has been cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {booking.status === 'PENDING' && (
                <div className="action-card">
                  <h3>Actions</h3>
                  <button 
                    className="btn btn-danger btn-block"
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </button>
                  <p className="action-note">
                    You can cancel this booking before it is confirmed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
