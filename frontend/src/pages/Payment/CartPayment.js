import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../../services/api';
import settingsAPI from '../../services/settingsAPI';
import { useCart } from '../../context/CartContext';
import { useModal } from '../../components/Modal/Modal';
import './Payment.css';

/**
 * Cart Payment Page - Handles payment for multiple services from cart
 */
const CartPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const modal = useModal();
  
  const { cartItems, bookingData, totalAmount, coupon } = location.state || {};
  const [serviceFeePerItem, setServiceFeePerItem] = useState(99); // Default value

  const [paymentData, setPaymentData] = useState({
    cardNumber: '4111 1111 1111 1111',
    cardName: 'TEST USER',
    expiryMonth: '12',
    expiryYear: '2026',
    cvv: '123'
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  useEffect(() => {
    if (!cartItems || !bookingData || cartItems.length === 0) {
      modal.error('Invalid payment session. Please start from cart.');
      navigate('/cart');
    }

    // Fetch service fee from settings
    const fetchServiceFee = async () => {
      try {
        const publicSettings = await settingsAPI.getPublicSettings();
        const fee = parseInt(publicSettings['pricing.service_fee']) || 99;
        setServiceFeePerItem(fee);
      } catch (error) {
        console.error('Error fetching service fee:', error);
        // Keep default value if fetch fails
      }
    };

    fetchServiceFee();
  }, [cartItems, bookingData, navigate, modal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      formattedValue = formattedValue.slice(0, 19);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '').slice(0, name === 'expiryMonth' ? 2 : 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else {
      const cleanedCardNumber = paymentData.cardNumber.replace(/\s/g, '');
      if (!/^4\d{15}$/.test(cleanedCardNumber)) {
        newErrors.cardNumber = 'Please enter a valid Visa card number (16 digits starting with 4)';
      }
    }

    if (!paymentData.cardName) {
      newErrors.cardName = 'Cardholder name is required';
    }

    if (!paymentData.expiryMonth) {
      newErrors.expiryMonth = 'Month is required';
    } else if (parseInt(paymentData.expiryMonth) < 1 || parseInt(paymentData.expiryMonth) > 12) {
      newErrors.expiryMonth = 'Invalid month';
    }

    if (!paymentData.expiryYear) {
      newErrors.expiryYear = 'Year is required';
    } else if (parseInt(paymentData.expiryYear) < new Date().getFullYear()) {
      newErrors.expiryYear = 'Card expired';
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(paymentData.expiryYear) === currentYear && 
          parseInt(paymentData.expiryMonth) < currentMonth) {
        newErrors.expiryMonth = 'Card has expired';
      }
    }

    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (paymentData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create all bookings
      const bookingPromises = cartItems.map(service => {
        const bookingRequest = {
          serviceId: service.serviceId || service.id, // Use serviceId if available, fallback to id
          addressId: bookingData.addressId,
          bookingDate: bookingData.bookingDate,
          bookingTime: bookingData.bookingTime,
          notes: bookingData.notes,
          couponCode: coupon?.code || null  // CRITICAL: Send coupon code for usage tracking
        };
        return bookingAPI.createBooking(bookingRequest);
      });

      const bookingResults = await Promise.all(bookingPromises);
      const createdBookings = bookingResults.map(result => result.data.data);

      // Step 2: Process payments for all bookings
      const paymentPromises = createdBookings.map(booking => {
        const paymentRequest = {
          bookingId: booking.id,
          amount: booking.totalAmount,
          method: 'CREDIT_CARD', // Valid values: UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, CASH_ON_DELIVERY
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
          cardHolderName: paymentData.cardName,
          cvv: paymentData.cvv,
          expiryMonth: paymentData.expiryMonth,
          expiryYear: paymentData.expiryYear
        };
        return paymentAPI.processPayment(paymentRequest);
      });

      const paymentResults = await Promise.all(paymentPromises);
      const allPaymentsSuccessful = paymentResults.every(result => result.data.success);

      if (allPaymentsSuccessful) {
        setPaymentSuccess(true);
        setSuccessDetails({
          bookingCount: createdBookings.length,
          totalAmount: totalAmount,
          bookings: createdBookings
        });

        // Clear cart after successful payment
        clearCart();

        // Redirect to bookings page after 3 seconds
        setTimeout(() => {
          navigate('/bookings');
        }, 3000);
      } else {
        console.warn('⚠️ Some payments failed');
        const failedPayments = paymentResults.filter(result => !result.data.success);
        modal.warning(`${failedPayments.length} payment(s) failed. Please check your bookings page.`);
        navigate('/bookings');
      }
    } catch (err) {
      console.error('Payment error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      // Check for specific error messages
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // If error is about duplicate booking, provide more context
        if (errorMessage.includes('already have a booking') || errorMessage.includes('duplicate')) {
          errorMessage = 'You already have a booking at this time. The previous booking attempt may have succeeded. Please check your Bookings page before trying again.';
          
          // Offer to navigate to bookings
          modal.confirm(errorMessage, {
            confirmText: 'View Bookings',
            cancelText: 'Stay Here',
            onConfirm: () => navigate('/bookings')
          });
          setProcessing(false);
          return;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error in modal as well
      modal.error(errorMessage);
      setErrors({ form: errorMessage });
      setProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  if (paymentSuccess && successDetails) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card">
          <svg className="success-icon" width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#10b981" />
            <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1>Payment Successful!</h1>
          <p className="success-message">All {successDetails.bookingCount} bookings have been confirmed</p>
          <div className="booking-details">
            <div className="detail-row">
              <span className="detail-label">Total Services:</span>
              <span className="detail-value">{successDetails.bookingCount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Amount Paid:</span>
              <span className="detail-value">₹{successDetails.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Booking Date:</span>
              <span className="detail-value">{new Date(bookingData.bookingDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{bookingData.bookingTime}</span>
            </div>
          </div>
          <p className="redirect-message">Redirecting to bookings page...</p>
        </div>
      </div>
    );
  }

  const serviceFee = cartItems.length * serviceFeePerItem;
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const discount = coupon ? (coupon.discountAmount || 0) : 0;
  const total = subtotal + serviceFee - discount;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button 
            className="back-button" 
            onClick={() => navigate('/cart/checkout', { 
              state: { 
                cartItems, 
                bookingData, 
                totalAmount: total,
                coupon 
              } 
            })}
          >
            ← Back
          </button>
          <h1>Complete Payment</h1>
        </div>

        <div className="payment-content">
          {/* Payment Form - Now on LEFT */}
          <div className="payment-form-section">
            <div className="payment-form-card">
              <h2>Payment Information</h2>
              
              {errors.form && (
                <div className="error-banner">{errors.form}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    placeholder="4111 1111 1111 1111"
                    disabled={processing}
                  />
                  {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cardName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentData.cardName}
                    onChange={handleChange}
                    placeholder="TEST USER"
                    disabled={processing}
                  />
                  {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryMonth">Expiry Month</label>
                    <input
                      type="text"
                      id="expiryMonth"
                      name="expiryMonth"
                      value={paymentData.expiryMonth}
                      onChange={handleChange}
                      placeholder="12"
                      disabled={processing}
                    />
                    {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="expiryYear">Expiry Year</label>
                    <input
                      type="text"
                      id="expiryYear"
                      name="expiryYear"
                      value={paymentData.expiryYear}
                      onChange={handleChange}
                      placeholder="2025"
                      disabled={processing}
                    />
                    {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      disabled={processing}
                    />
                    {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-payment-btn"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                </button>
              </form>

              <div className="test-card-info">
                <p className="info-text">
                  <strong>Test Mode:</strong> Use card 4111 1111 1111 1111 with any future date and CVV
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - Now on RIGHT */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h2>Order Summary</h2>
              
              <div className="cart-services-list">
                <h3>{cartItems.length} Service(s)</h3>
                {cartItems.map((service, index) => (
                  <div key={index} className="cart-service-item">
                    <div className="service-info">
                      <h4>{service.serviceName || service.name}</h4>
                      <p>{service.category}</p>
                    </div>
                    <div className="service-price">₹{service.price?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal ({cartItems.length} services)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row">
                  <span>Service Fee</span>
                  <span>₹{serviceFee.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount ({coupon.code})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="booking-info">
                <h3>Booking Details</h3>
                <p><strong>Date:</strong> {new Date(bookingData.bookingDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Time:</strong> {bookingData.bookingTime}</p>
                {bookingData.notes && <p><strong>Notes:</strong> {bookingData.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPayment;
