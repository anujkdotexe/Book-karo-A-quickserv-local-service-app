import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
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
        <Link to="/" className="navbar-brand">
          <span className="brand-name">Bookaro</span>
        </Link>

        {isAuthenticated && (
          <form className="navbar-search" onSubmit={handleSearch}>
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

        <div className="navbar-menu">
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
