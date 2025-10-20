import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast/Toast';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleRemove = (serviceId, serviceName) => {
    removeFromCart(serviceId);
    toast.success(`${serviceName} removed from cart`);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    // Navigate to multi-service booking page
    navigate('/cart/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart-card">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>Your Cart is Empty</h2>
            <p>Add services to your cart to book multiple services at once</p>
            <div className="empty-cart-benefits">
              <h3>Why use the cart?</h3>
              <ul>
                <li>Book multiple services in one go</li>
                <li>Review all your services before booking</li>
                <li>Save time with batch bookings</li>
                <li>Easily manage and modify selections</li>
              </ul>
            </div>
            <Link to="/services" className="btn btn-primary btn-large">
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartItems.length} {cartItems.length === 1 ? 'service' : 'services'} in your cart</p>
          <button onClick={handleClearCart} className="btn btn-outline btn-clear">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-description">{item.description}</p>
                  <div className="cart-item-details">
                    <span className="cart-item-category">{item.category}</span>
                    <span className="cart-item-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {item.city}, {item.state}
                    </span>
                    {item.vendor && (
                      <span className="cart-item-vendor">
                        By {item.vendor.firstName} {item.vendor.lastName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-item-price">₹{item.price}</div>
                  <button 
                    onClick={() => handleRemove(item.id, item.name)}
                    className="btn btn-remove"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>
              <div className="cart-summary-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'service' : 'services'})</span>
                <span className="cart-summary-amount">₹{getCartTotal()}</span>
              </div>
              <div className="cart-summary-row">
                <span>Service Fee</span>
                <span className="cart-summary-amount">₹0</span>
              </div>
              <div className="cart-summary-divider"></div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span className="cart-summary-amount">₹{getCartTotal()}</span>
              </div>
              <button onClick={handleCheckout} className="btn btn-primary btn-large btn-checkout">
                Proceed to Checkout
              </button>
              <Link to="/services" className="btn btn-outline btn-large">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
