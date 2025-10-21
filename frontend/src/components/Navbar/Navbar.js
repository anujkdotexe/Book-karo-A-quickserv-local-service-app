import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Get user role
  const userRole = user?.role || 'USER';

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const hamburger = document.querySelector('.hamburger-menu');
        if (hamburger && !hamburger.contains(event.target)) {
          setShowMobileMenu(false);
        }
      }
    };

    if (showProfileMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showMobileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Sanitize and validate input
    const sanitizedQuery = searchQuery.trim().replace(/[<>'"]/g, '');
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return;
    }
    
    // Case-insensitive search by converting to lowercase
    navigate(`/services?search=${encodeURIComponent(sanitizedQuery.toLowerCase())}`);
    setSearchQuery('');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Hamburger Menu (Mobile) */}
        <button 
          className="hamburger-menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle mobile menu"
          aria-expanded={showMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo (Center on Mobile, Left on Desktop) */}
        <Link to="/" className="navbar-brand">
          <span className="brand-name">Bookaro</span>
        </Link>

        {/* Mobile Right Icons */}
        <div className="mobile-right-icons">
          {isAuthenticated && (
            <>
              <Link to="/cart" className="mobile-icon-link" aria-label="View cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {getCartCount() > 0 && (
                  <span className="cart-badge-mobile">{getCartCount()}</span>
                )}
              </Link>
              
              <button 
                className="mobile-profile-icon"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Open profile menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="mobile-menu" ref={mobileMenuRef}>
            <div className="mobile-menu-content">
              {isAuthenticated && (
                <form className="mobile-search" onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mobile-search-input"
                  />
                  <button type="submit" className="mobile-search-button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </button>
                </form>
              )}

              <Link to="/" className={`mobile-menu-item ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Home
              </Link>

              <Link to="/services" className={`mobile-menu-item ${isActive('/services') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Services
              </Link>

              {isAuthenticated && (
                <>
                  {/* Role-based menu items */}
                  {userRole === 'USER' && (
                    <>
                      <Link to="/bookings" className={`mobile-menu-item ${isActive('/bookings') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        My Bookings
                      </Link>
                      <Link to="/favorites" className={`mobile-menu-item ${isActive('/favorites') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        Favorites
                      </Link>
                      <Link to="/addresses" className={`mobile-menu-item ${isActive('/addresses') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        My Addresses
                      </Link>
                    </>
                  )}

                  {userRole === 'VENDOR' && (
                    <>
                      <Link to="/vendor/dashboard" className={`mobile-menu-item ${isActive('/vendor/dashboard') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                      </Link>
                      <Link to="/vendor/services" className={`mobile-menu-item ${isActive('/vendor/services') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        My Services
                      </Link>
                      <Link to="/vendor/bookings" className={`mobile-menu-item ${isActive('/vendor/bookings') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Bookings
                      </Link>
                      <Link to="/vendor/analytics" className={`mobile-menu-item ${isActive('/vendor/analytics') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="20" x2="12" y2="10"></line>
                          <line x1="18" y1="20" x2="18" y2="4"></line>
                          <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        Analytics
                      </Link>
                    </>
                  )}

                  {userRole === 'ADMIN' && (
                    <>
                      <Link to="/admin/dashboard" className={`mobile-menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                      </Link>
                      <Link to="/admin/users" className={`mobile-menu-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Manage Users
                      </Link>
                      <Link to="/admin/vendors" className={`mobile-menu-item ${isActive('/admin/vendors') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <polyline points="17 11 19 13 23 9"></polyline>
                        </svg>
                        Manage Vendors
                      </Link>
                      <Link to="/admin/services" className={`mobile-menu-item ${isActive('/admin/services') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        Manage Services
                      </Link>
                      <Link to="/admin/analytics" className={`mobile-menu-item ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="20" x2="12" y2="10"></line>
                          <line x1="18" y1="20" x2="18" y2="4"></line>
                          <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        Platform Analytics
                      </Link>
                    </>
                  )}

                  <Link to="/profile" className={`mobile-menu-item ${isActive('/profile') ? 'active' : ''}`} onClick={closeMobileMenu}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                  </Link>

                  <div className="mobile-menu-divider"></div>

                  <button onClick={handleLogout} className="mobile-menu-item logout-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link to="/login" className="mobile-menu-item" onClick={closeMobileMenu}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Login
                  </Link>
                  <Link to="/register" className="mobile-menu-item" onClick={closeMobileMenu}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Desktop Search */}
        {isAuthenticated && (
          <form className="navbar-search desktop-only" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search services"
            />
            <button type="submit" className="search-button" aria-label="Search for services">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>
        )}

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-only">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} aria-label="Home page">
            Home
          </Link>
          <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`} aria-label="Browse services">
            Services
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`} aria-label="View favorites">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </Link>
              
              <Link to="/cart" className={`nav-link cart-link ${isActive('/cart') ? 'active' : ''}`} aria-label="View cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {getCartCount() > 0 && (
                  <span className="cart-badge" aria-label={`${getCartCount()} items in cart`}>
                    {getCartCount()}
                  </span>
                )}
              </Link>

              <div className="profile-dropdown" ref={profileMenuRef}>
                <button 
                  className="profile-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Open profile menu"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="profile-menu" role="menu" aria-label="Profile menu options">
                    <Link 
                      to="/profile" 
                      className="profile-menu-item"
                      onClick={() => setShowProfileMenu(false)}
                      role="menuitem"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Edit Profile
                    </Link>

                    {/* Role-based menu items */}
                    {userRole === 'USER' && (
                      <>
                        <Link 
                          to="/bookings" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          My Bookings
                        </Link>
                        <Link 
                          to="/addresses" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          My Addresses
                        </Link>
                        <Link 
                          to="/favorites" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          Favorites
                        </Link>
                      </>
                    )}

                    {userRole === 'VENDOR' && (
                      <>
                        <Link 
                          to="/vendor/dashboard" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          Dashboard
                        </Link>
                        <Link 
                          to="/vendor/services" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                          </svg>
                          My Services
                        </Link>
                        <Link 
                          to="/vendor/bookings" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Bookings
                        </Link>
                        <Link 
                          to="/vendor/analytics" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                          </svg>
                          Analytics
                        </Link>
                      </>
                    )}

                    {userRole === 'ADMIN' && (
                      <>
                        <Link 
                          to="/admin/dashboard" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          Dashboard
                        </Link>
                        <Link 
                          to="/admin/users" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          Manage Users
                        </Link>
                        <Link 
                          to="/admin/vendors" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <polyline points="17 11 19 13 23 9"></polyline>
                          </svg>
                          Manage Vendors
                        </Link>
                        <Link 
                          to="/admin/services" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                          Manage Services
                        </Link>
                        <Link 
                          to="/admin/analytics" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                          </svg>
                          Platform Analytics
                        </Link>
                      </>
                    )}

                    <div className="profile-menu-divider" role="separator"></div>
                    <button 
                      onClick={handleLogout}
                      className="profile-menu-item logout-item"
                      role="menuitem"
                      aria-label="Log out of account"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" aria-label="Log in to your account">Login</Link>
              <Link to="/register" className="btn btn-primary" aria-label="Create a new account">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
