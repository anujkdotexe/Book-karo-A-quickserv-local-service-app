import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useModal } from '../../components/Modal/Modal';
import { addressAPI } from '../../services/api';
import api from '../../services/api';
import settingsAPI from '../../services/settingsAPI';
import './CartCheckout.css';

/**
 * Multi-Service Checkout Component
 * Allows booking multiple services from cart in one transaction
 */
const CartCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const modal = useModal();

  // Restore state from location if returning from payment page
  const savedState = location.state;

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [commonBookingData, setCommonBookingData] = useState(
    savedState?.bookingData || {
      addressId: null,
      bookingDate: '',
      bookingTime: '',
      notes: ''
    }
  );

  const [couponCode, setCouponCode] = useState(savedState?.coupon?.code || '');
  const [appliedCoupon, setAppliedCoupon] = useState(savedState?.coupon || null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [serviceFeePerBooking, setServiceFeePerBooking] = useState(99);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      modal.error('Your cart is empty. Please add services first.');
      navigate('/services');
    }
  }, [cartItems, navigate, modal]);

  // Fetch dynamic service fee from settings
  useEffect(() => {
    const fetchServiceFee = async () => {
      try {
        const publicSettings = await settingsAPI.getPublicSettings();
        const fee = parseInt(publicSettings['pricing.service_fee']) || 99;
        setServiceFeePerBooking(fee);
      } catch (error) {
        console.error('Failed to fetch service fee:', error);
        setServiceFeePerBooking(99); // Fallback to default
      }
    };
    fetchServiceFee();
  }, []);

  // Fetch user addresses (extracted so it can be re-used)
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const response = await addressAPI.getUserAddresses();
      const addressData = response.data.data || [];
      setAddresses(addressData);

      // Auto-select default address if available
      const defaultAddr = addressData.find(addr => addr.isDefault);
      if (defaultAddr) {
        setCommonBookingData(prev => ({
          ...prev,
          addressId: defaultAddr.id
        }));
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load addresses. Please try refreshing the page.';
      modal.error(errorMsg);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Fetch addresses on mount and when window regains focus (covers returning from address edit)
  useEffect(() => {
    fetchAddresses();

    const handleFocus = () => {
      fetchAddresses();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [modal]);

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
    
    // Convert addressId to number, or null if empty
    const processedValue = name === 'addressId' 
      ? (value === '' ? null : Number(value))
      : value;
    
    setCommonBookingData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        orderValue: getCartTotal()
      });

      const couponData = response.data.data;
      setAppliedCoupon(couponData);
      modal.success(`Coupon applied! You save ₹${couponData.discountAmount}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid coupon code';
      setCouponError(errorMsg);
      setAppliedCoupon(null);
      modal.error(errorMsg);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError(null);
    modal.info('Coupon removed');
  };

  const validateForm = () => {
    if (!commonBookingData.addressId) {
      modal.error('Please select a service address');
      return false;
    }

    // Validate selected address city matches all cart items
    const selectedAddress = addresses.find(addr => addr.id === commonBookingData.addressId);
    if (selectedAddress) {
      const addressCity = selectedAddress.city?.trim().toLowerCase();
      const mismatchedServices = cartItems.filter(item => {
        const serviceCity = item.city?.trim().toLowerCase();
        return serviceCity && addressCity && serviceCity !== addressCity;
      });

      if (mismatchedServices.length > 0) {
        const serviceNames = mismatchedServices.map(s => s.serviceName || s.name).join(', ');
        modal.error(
          `City mismatch detected! Your selected address is in ${selectedAddress.city}, but the following services are in different cities: ${serviceNames}. ` +
          `Please either select an address in the service city or remove these services from your cart.`
        );
        return false;
      }
    }

    // Strict date validation with trimming
    const dateValue = commonBookingData.bookingDate?.trim();
    if (!dateValue || dateValue === '') {
      modal.error('Please select a booking date');
      return false;
    }

    if (!commonBookingData.bookingTime) {
      modal.error('Please select a booking time');
      return false;
    }

    // Validate date is not in the past
    try {
      const selectedDate = new Date(dateValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if date is valid
      if (isNaN(selectedDate.getTime())) {
        modal.error('Please select a valid booking date');
        return false;
      }

      if (selectedDate < today) {
        modal.error('Booking date cannot be in the past');
        return false;
      }
    } catch (error) {
      modal.error('Invalid date format. Please select a date from the calendar.');
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
      // Log checkout details for debugging
      const selectedAddress = addresses.find(addr => addr.id === commonBookingData.addressId);
      console.log('=== CHECKOUT DETAILS ===');
      console.log('Selected Address:', selectedAddress);
      console.log('Cart Items:', cartItems);
      console.log('Booking Data:', commonBookingData);
      console.log('========================');
      
      // Navigate to payment page with cart data and booking details
      // Payment page will handle creating bookings after successful payment
      navigate('/payment/cart', {
        state: {
          cartItems: cartItems,
          bookingData: commonBookingData,
          totalAmount: getFinalTotal(),
          coupon: appliedCoupon
        }
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Navigation error:', error);
      modal.error('Failed to proceed to payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const getFinalTotal = () => {
    const serviceFee = cartItems.length * serviceFeePerBooking;
    const subtotal = getCartTotal() + serviceFee;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    return subtotal - discount;
  };

  // Service fee calculation - dynamically fetched from settings
  // This covers booking processing, payment gateway charges, customer support, and platform maintenance
  const serviceFee = cartItems.length * serviceFeePerBooking;
  const subtotal = getCartTotal() + serviceFee;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal - discount;

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
                <label htmlFor="addressId">
                  Service Address <span className="required">*</span>
                </label>
                {addressesLoading ? (
                  <p className="loading-text">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <div className="no-addresses-warning">
                    <p>You don't have any saved addresses.</p>
                    <button 
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => navigate('/addresses')}
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      id="addressId"
                      name="addressId"
                      value={commonBookingData.addressId || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Address --</option>
                      {addresses.map(addr => {
                        // Check if address city matches all cart items
                        const addressCity = addr.city?.trim().toLowerCase();
                        const allServicesMatch = cartItems.every(item => {
                          const serviceCity = item.city?.trim().toLowerCase();
                          return !serviceCity || !addressCity || serviceCity === addressCity;
                        });
                        
                        return (
                          <option key={addr.id} value={addr.id}>
                            {addr.label || 'Address'} - {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                            {addr.isDefault ? ' (Default)' : ''}
                            {allServicesMatch ? ' ✓' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <small className="form-help">
                      {(() => {
                        // Show unique cities from cart items
                        const serviceCities = [...new Set(cartItems.map(item => item.city).filter(Boolean))];
                        // Determine selected address city (normalized)
                        const selectedAddr = addresses.find(a => a.id === commonBookingData.addressId);
                        const selectedCity = selectedAddr?.city?.trim().toLowerCase();

                        // Check if all services match the selected address city
                        const servicesMatchSelected = selectedCity && cartItems.every(item => {
                          const svcCity = item.city?.trim().toLowerCase();
                          return !svcCity || svcCity === selectedCity;
                        });

                        if (serviceCities.length === 0) return null;

                        // If multiple service cities in cart, always show a warning
                        if (serviceCities.length > 1) {
                          return (
                            <span style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--navy-blue)' }}>
                              Services in cart are from multiple cities: <strong>{serviceCities.join(', ')}</strong>. Please remove services from other cities or split your checkout.
                            </span>
                          );
                        }

                        // Single city in cart - show message only when selected address does NOT match
                        if (!servicesMatchSelected) {
                          return (
                            <span style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--navy-blue)' }}>
                              Services in cart are from: <strong>{serviceCities[0]}</strong>. Select a matching address.
                            </span>
                          );
                        }

                        // If we reach here, selected address matches services - show nothing
                        return null;
                      })()}
                      <button 
                        type="button" 
                        className="link-button"
                        onClick={() => navigate('/addresses')}
                      >
                        Manage addresses
                      </button>
                    </small>
                  </>
                )}
              </div>

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
                  max={new Date(new Date().getFullYear() + 2, 11, 31).toISOString().split('T')[0]}
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

            {/* Service Items Details */}
            <div className="summary-services-list">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-service-item">
                  <div className="summary-service-info">
                    <div className="summary-service-name">{item.name}</div>
                    <div className="summary-service-meta">
                      <span className="summary-service-vendor">by {item.vendorName || 'Vendor'}</span>
                      <span className="summary-service-location">📍 {item.city}</span>
                    </div>
                  </div>
                  <div className="summary-service-price">₹{item.price}</div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'service' : 'services'})</span>
              <span className="summary-amount">₹{getCartTotal()}</span>
            </div>

            <div className="summary-row">
              <span>Service Fee (18% GST included)</span>
              <span className="summary-amount">₹{serviceFee}</span>
            </div>

            {appliedCoupon && (
              <div className="summary-row summary-discount">
                <span>
                  Discount ({appliedCoupon.code})
                  <button 
                    className="remove-coupon-btn" 
                    onClick={removeCoupon}
                    title="Remove coupon"
                  >
                    ✕
                  </button>
                </span>
                <span className="summary-amount discount-amount">-₹{discount}</span>
              </div>
            )}

            {!appliedCoupon && (
              <div className="coupon-section">
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                    disabled={couponLoading}
                    className={couponError ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="btn-apply-coupon"
                    onClick={validateCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {couponError && <div className="coupon-error">{couponError}</div>}
              </div>
            )}

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
              className="btn btn-outline btn-large btn-back-to-cart"
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
