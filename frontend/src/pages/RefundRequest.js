import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { refundAPI, bookingAPI } from '../services/api';
import './RefundRequest.css';

const RefundRequest = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundPercentage, setRefundPercentage] = useState(0);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBookingById(bookingId);
      const bookingData = response.data.data;
      setBooking(bookingData);
      
      // Calculate refund amount based on time until booking
      const bookingDateTime = new Date(`${bookingData.bookingDate}T${bookingData.bookingTime}`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
      
      let percentage = 0;
      if (hoursUntilBooking >= 24) {
        percentage = 100;
      } else if (hoursUntilBooking >= 12) {
        percentage = 50;
      } else {
        percentage = 0;
      }
      
      setRefundPercentage(percentage);
      setRefundAmount((bookingData.totalAmount * percentage) / 100);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (reason.trim().length < 10) {
      setError('Please provide a reason with at least 10 characters');
      return;
    }
    
    if (reason.trim().length > 500) {
      setError('Reason must not exceed 500 characters');
      return;
    }
    
    if (refundAmount === 0) {
      setError('No refund available. Cancellations must be made at least 12 hours before booking time.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await refundAPI.requestRefund(bookingId, reason);
      
      alert('Refund request submitted successfully! An admin will review it soon.');
      navigate('/bookings');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="refund-request-page">
        <div className="loading-spinner">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="refund-request-page">
        <div className="error-card">
          <h2>Booking Not Found</h2>
          <p>The requested booking could not be found.</p>
          <button onClick={() => navigate('/bookings')} className="btn btn-primary">
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="refund-request-page">
      <div className="refund-container">
        <h1>Request Refund</h1>
        
        <div className="booking-summary-card">
          <h2>Booking Details</h2>
          <div className="booking-info">
            <div className="info-row">
              <span className="label">Service:</span>
              <span className="value">{booking.serviceName}</span>
            </div>
            <div className="info-row">
              <span className="label">Booking Date:</span>
              <span className="value">{new Date(booking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Booking Time:</span>
              <span className="value">{booking.bookingTime}</span>
            </div>
            <div className="info-row">
              <span className="label">Total Amount:</span>
              <span className="value">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className="label">Status:</span>
              <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        <div className="refund-calculation-card">
          <h2>Refund Calculation</h2>
          <div className="refund-info">
            <div className="refund-percentage">
              <span className="percentage-value">{refundPercentage}%</span>
              <span className="percentage-label">Refund Percentage</span>
            </div>
            <div className="refund-amount">
              <span className="amount-label">You will receive:</span>
              <span className="amount-value">₹{refundAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="refund-policy">
            <h3>Refund Policy</h3>
            <ul>
              <li>24+ hours before booking: 100% refund</li>
              <li>12-24 hours before booking: 50% refund</li>
              <li>Less than 12 hours: No refund</li>
            </ul>
          </div>
        </div>

        {refundAmount === 0 ? (
          <div className="no-refund-alert">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>No Refund Available</h3>
            <p>Cancellations must be made at least 12 hours before the booking time to be eligible for a refund.</p>
            <button onClick={() => navigate('/bookings')} className="btn btn-outline">
              Back to Bookings
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="refund-request-form">
            <div className="form-group">
              <label htmlFor="reason">Reason for Refund *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason for requesting this refund (10-500 characters)"
                rows="6"
                required
                minLength="10"
                maxLength="500"
                disabled={submitting}
              />
              <div className="char-count">
                {reason.length} / 500 characters
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || reason.trim().length < 10}
              >
                {submitting ? 'Submitting...' : 'Submit Refund Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RefundRequest;
