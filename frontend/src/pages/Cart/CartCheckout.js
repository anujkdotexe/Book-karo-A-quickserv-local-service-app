import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast/Toast';
import { bookingAPI } from '../../services/api';
import './CartCheckout.css';

/**
 * Multi-Service Checkout Component
 * Allows booking multiple services from cart in one transaction
 */
const CartCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [commonBookingData, setCommonBookingData] = useState({
    bookingDate: '',
    bookingTime: '',
    notes: ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add services first.');
      navigate('/services');
    }
  }, [cartItems, navigate, toast]);

  // Track unsaved changes
  useEffect(() => {
    const hasData = commonBookingData.bookingDate || 
                    commonBookingData.bookingTime || 
                    commonBookingData.notes;
    setHasUnsavedChanges(hasData);
  }, [commonBookingData]);

  // Warn on page leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved booking details. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommonBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!commonBookingData.bookingDate) {
      toast.error('Please select a booking date');
      return false;
    }

    if (!commonBookingData.bookingTime) {
      toast.error('Please select a booking time');
      return false;
    }

    // Validate date is not in the past
    const selectedDate = new Date(commonBookingData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Booking date cannot be in the past');
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    // Prevent double submission
    if (loading) return;

    setLoading(true);

    try {
      // Create bookings for all cart items
      const bookingPromises = cartItems.map(service => 
        bookingAPI.createBooking({
          serviceId: service.id,
          bookingDate: commonBookingData.bookingDate,
          bookingTime: commonBookingData.bookingTime,
          notes: commonBookingData.notes
        })
      );

      const results = await Promise.all(bookingPromises);

      // Check if all bookings succeeded
      const allSuccessful = results.every(result => result.data.success);

      if (allSuccessful) {
        toast.success(`Successfully booked ${cartItems.length} service(s)!`);
        clearCart();
        setHasUnsavedChanges(false);
        navigate('/bookings');
      } else {
        toast.error('Some bookings failed. Please check your bookings page.');
        navigate('/bookings');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create bookings. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const serviceFee = cartItems.length * 99;
  const total = getCartTotal() + serviceFee;

  return (
    <div className="checkout-page container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your booking for {cartItems.length} service(s)</p>
      </div>

      <div className="checkout-content">
        {/* Booking Details Form */}
        <div className="booking-form-section">
          <div className="booking-form-card">
            <h2>Booking Details</h2>
            <p className="form-subtitle">These details will apply to all services in your cart</p>

            <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
              <div className="form-group">
                <label htmlFor="bookingDate">
                  Booking Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  value={commonBookingData.bookingDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookingTime">
                  Preferred Time <span className="required">*</span>
                </label>
                <input
                  type="time"
                  id="bookingTime"
                  name="bookingTime"
                  value={commonBookingData.bookingTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={commonBookingData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or instructions for the service providers..."
                  rows="4"
                  maxLength={500}
                />
                <small className="character-count">
                  {commonBookingData.notes.length}/500 characters
                </small>
              </div>
            </form>
          </div>

          {/* Services Summary */}
          <div className="services-summary">
            <h3>Services to be booked ({cartItems.length})</h3>
            <div className="services-list">
              {cartItems.map(service => (
                <div key={service.id} className="service-summary-item">
                  <div>
                    <h4>{service.name}</h4>
                    <p>{service.category} • {service.city}</p>
                  </div>
                  <span className="service-price">₹{service.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary-card">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Services ({cartItems.length})</span>
              <span className="summary-amount">₹{getCartTotal()}</span>
            </div>

            <div className="summary-row">
              <span>Service Fee</span>
              <span className="summary-amount">₹{serviceFee}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total Amount</span>
              <span className="summary-amount">₹{total}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-large btn-checkout"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Confirm Booking (₹${total})`}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/cart')}
              disabled={loading}
            >
              Back to Cart
            </button>

            <div className="checkout-info">
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Your bookings will be confirmed once the service providers accept them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
