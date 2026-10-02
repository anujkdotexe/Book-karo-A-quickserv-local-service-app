import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarSearch from './NavbarSearch';

const NavbarMobileDrawer = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  userRole,
  onLogout
}) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay active" onClick={onClose} aria-hidden="true" />
      <aside className="mobile-menu open" role="dialog" aria-label="Mobile navigation menu">
        <div className="mobile-menu-header">
          <span className="mobile-brand">Menu</span>
          <button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="mobile-menu-content">
          <div className="mobile-search-container">
            <NavbarSearch isMobile onSearchComplete={onClose} />
          </div>

          <div className="mobile-nav-section">
            <Link to="/" className={`mobile-menu-item ${isActive('/') ? 'active' : ''}`} onClick={onClose}>
              Home
            </Link>
            <Link to="/services" className={`mobile-menu-item ${isActive('/services') ? 'active' : ''}`} onClick={onClose}>
              Browse Services
            </Link>
            <Link to="/categories" className={`mobile-menu-item ${isActive('/categories') ? 'active' : ''}`} onClick={onClose}>
              Categories
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              <div className="mobile-menu-divider" />
              <div className="mobile-section-title">
                {userRole === 'ADMIN' ? 'Admin Portal' : userRole === 'VENDOR' ? 'Vendor Portal' : 'My Account'}
              </div>

              {userRole === 'USER' && (
                <>
                  <Link to="/bookings" className={`mobile-menu-item ${isActive('/bookings') ? 'active' : ''}`} onClick={onClose}>
                    My Bookings
                  </Link>
                  <Link to="/cart" className={`mobile-menu-item ${isActive('/cart') ? 'active' : ''}`} onClick={onClose}>
                    Shopping Cart
                  </Link>
                  <Link to="/favorites" className={`mobile-menu-item ${isActive('/favorites') ? 'active' : ''}`} onClick={onClose}>
                    Favorites
                  </Link>
                  <Link to="/addresses" className={`mobile-menu-item ${isActive('/addresses') ? 'active' : ''}`} onClick={onClose}>
                    Saved Addresses
                  </Link>
                </>
              )}

              {userRole === 'VENDOR' && (
                <>
                  <Link to="/vendor/dashboard" className={`mobile-menu-item ${isActive('/vendor/dashboard') ? 'active' : ''}`} onClick={onClose}>
                    Vendor Dashboard
                  </Link>
                  <Link to="/vendor/services" className={`mobile-menu-item ${isActive('/vendor/services') ? 'active' : ''}`} onClick={onClose}>
                    My Services
                  </Link>
                  <Link to="/vendor/bookings" className={`mobile-menu-item ${isActive('/vendor/bookings') ? 'active' : ''}`} onClick={onClose}>
                    Manage Bookings
                  </Link>
                  <Link to="/vendor/availability" className={`mobile-menu-item ${isActive('/vendor/availability') ? 'active' : ''}`} onClick={onClose}>
                    Availability Schedule
                  </Link>
                  <Link to="/vendor/analytics" className={`mobile-menu-item ${isActive('/vendor/analytics') ? 'active' : ''}`} onClick={onClose}>
                    Performance Analytics
                  </Link>
                  <Link to="/vendor/reviews" className={`mobile-menu-item ${isActive('/vendor/reviews') ? 'active' : ''}`} onClick={onClose}>
                    Client Reviews
                  </Link>
                </>
              )}

              {userRole === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className={`mobile-menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={onClose}>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/analytics" className={`mobile-menu-item ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={onClose}>
                    Platform Analytics
                  </Link>
                  <Link to="/admin/users" className={`mobile-menu-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={onClose}>
                    Manage Users
                  </Link>
                  <Link to="/admin/vendors" className={`mobile-menu-item ${isActive('/admin/vendors') ? 'active' : ''}`} onClick={onClose}>
                    Manage Vendors
                  </Link>
                  <Link to="/admin/services" className={`mobile-menu-item ${isActive('/admin/services') ? 'active' : ''}`} onClick={onClose}>
                    Manage Services
                  </Link>
                  <Link to="/admin/bookings" className={`mobile-menu-item ${isActive('/admin/bookings') ? 'active' : ''}`} onClick={onClose}>
                    Manage Bookings
                  </Link>
                  <Link to="/admin/refunds" className={`mobile-menu-item ${isActive('/admin/refunds') ? 'active' : ''}`} onClick={onClose}>
                    Manage Refunds
                  </Link>
                  <Link to="/admin/coupons" className={`mobile-menu-item ${isActive('/admin/coupons') ? 'active' : ''}`} onClick={onClose}>
                    Coupons & Offers
                  </Link>
                  <Link to="/admin/content" className={`mobile-menu-item ${isActive('/admin/content') ? 'active' : ''}`} onClick={onClose}>
                    Content Management
                  </Link>
                  <Link to="/admin/audit-logs" className={`mobile-menu-item ${isActive('/admin/audit-logs') ? 'active' : ''}`} onClick={onClose}>
                    Audit Logs
                  </Link>
                </>
              )}

              <div className="mobile-menu-divider" />
              <Link to="/profile" className={`mobile-menu-item ${isActive('/profile') ? 'active' : ''}`} onClick={onClose}>
                Account Profile ({user?.email})
              </Link>
              <button type="button" className="mobile-menu-item logout-item" onClick={onLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider" />
              <Link to="/login" className="mobile-menu-item" onClick={onClose}>
                Sign In
              </Link>
              <Link to="/register" className="mobile-menu-item highlight-item" onClick={onClose}>
                Register Account
              </Link>
            </>
          )}

          <div className="mobile-menu-divider" />
          <div className="mobile-section-title">Support & Policies</div>
          <Link to="/help" className="mobile-menu-item" onClick={onClose}>Help Center</Link>
          <Link to="/faq" className="mobile-menu-item" onClick={onClose}>Frequently Asked Questions</Link>
          <Link to="/contact" className="mobile-menu-item" onClick={onClose}>Contact Support</Link>
          <Link to="/terms" className="mobile-menu-item" onClick={onClose}>Terms of Service</Link>
          <Link to="/privacy" className="mobile-menu-item" onClick={onClose}>Privacy Policy</Link>
        </div>
      </aside>
    </>
  );
};

export default NavbarMobileDrawer;
