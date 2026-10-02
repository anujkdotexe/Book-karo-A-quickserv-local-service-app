import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NotificationBell from './NotificationBell';
import NavbarSearch from './NavbarSearch';
import NavbarProfileDropdown from './NavbarProfileDropdown';
import NavbarMobileDrawer from './NavbarMobileDrawer';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path) => location.pathname === path;
  const userRole = user?.role || 'USER';
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container container">
        {/* Mobile Hamburger Button */}
        <button
          className="hamburger-menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle navigation menu"
          aria-expanded={showMobileMenu}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setShowMobileMenu(false)}>
          <span className="brand-name">BOOK-KARO</span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="desktop-search-container desktop-only">
          <NavbarSearch />
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-nav desktop-only">
          <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
            Services
          </Link>
          <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>
            Categories
          </Link>

          {isAuthenticated && userRole === 'VENDOR' && (
            <Link to="/vendor/dashboard" className={`nav-link ${isActive('/vendor/dashboard') ? 'active' : ''}`}>
              Vendor Dashboard
            </Link>
          )}

          {isAuthenticated && userRole === 'ADMIN' && (
            <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* Actions (Cart, Notifications, Profile / Login) */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Cart Icon (Customer role only) */}
              {userRole === 'USER' && (
                <Link to="/cart" className="action-button cart-button" aria-label={`Shopping cart with ${cartCount} items`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
                </Link>
              )}

              {/* Profile Dropdown */}
              <NavbarProfileDropdown
                user={user}
                userRole={userRole}
                isOpen={showProfileMenu}
                onToggle={() => setShowProfileMenu(prev => !prev)}
                onClose={() => setShowProfileMenu(false)}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <div className="auth-buttons desktop-only">
              <Link to="/login" className="btn btn-outline btn-nav">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-nav">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <NavbarMobileDrawer
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        userRole={userRole}
        onLogout={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
