import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { serviceAPI } from '../../services/api';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const profileMenuRef = useRef(null);
  const contentMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Get user role
  const userRole = user?.role || 'USER';

  // Load search history and trending searches
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history.slice(0, 5)); // Keep last 5 searches
    
    // Fetch trending searches from backend
    const fetchTrending = async () => {
      try {
        const response = await serviceAPI.getTrendingSearches();
        if (response.data.success && Array.isArray(response.data.data)) {
          setTrendingSearches(response.data.data);
        }
      } catch (error) {
        // Fallback to default trending searches
        setTrendingSearches(['Plumbing', 'Cleaning', 'Electrician', 'Painting']);
      }
    };
    
    fetchTrending();
  }, []);

  // Save search to history
  const saveToHistory = (query) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const updated = [query, ...history.filter(h => h !== query)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    setSearchHistory(updated);
  };

  // Clear search history
  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (contentMenuRef.current && !contentMenuRef.current.contains(event.target)) {
        setShowContentMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const hamburger = document.querySelector('.hamburger-menu');
        if (hamburger && !hamburger.contains(event.target)) {
          setShowMobileMenu(false);
        }
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    if (showProfileMenu || showContentMenu || showMobileMenu || showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showContentMenu, showMobileMenu, showSuggestions]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const handleSearch = (e, query = null) => {
    if (e) e.preventDefault();
    
    const searchTerm = query || searchQuery;
    const sanitizedQuery = searchTerm.trim().replace(/[<>'"]/g, '');
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return;
    }
    
    saveToHistory(sanitizedQuery);
    // Navigate to services page with search query
    navigate(`/services?search=${encodeURIComponent(sanitizedQuery)}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8081'}/api/services/autocomplete?q=${encodeURIComponent(query)}&limit=8`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
          setShowSuggestions(data.data.length > 0 || searchHistory.length > 0 || trendingSearches.length > 0);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setSelectedSuggestionIndex(-1);
    
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    if (value.trim().length === 0) {
      // Show history and trending when input is empty
      setSuggestions([]);
      setShowSuggestions(searchHistory.length > 0 || trendingSearches.length > 0);
      setIsSearching(false);
    } else {
      // Debounce API calls by 300ms
      suggestionsTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    if (suggestion.id) {
      navigate(`/services/${suggestion.id}`);
    } else {
      handleSearch(null, suggestion.name || suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const allItems = [
      ...suggestions,
      ...(suggestions.length === 0 ? searchHistory.map(h => ({ name: h, isHistory: true })) : []),
      ...(suggestions.length === 0 && searchHistory.length === 0 ? trendingSearches.map(t => ({ name: t, isTrending: true })) : [])
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < allItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(allItems[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Get logo destination based on role
  const getLogoDestination = () => {
    if (!isAuthenticated || userRole === 'USER') {
      return '/';
    } else if (userRole === 'ADMIN') {
      return '/admin/dashboard';
    } else if (userRole === 'VENDOR') {
      return '/vendor/dashboard';
    }
    return '/';
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Skip to Main Content Link for Accessibility */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      <div className="navbar-container container">
        {/* Hamburger Menu (Mobile) */}
        <button 
          className="hamburger-menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle mobile menu"
          aria-expanded={showMobileMenu}
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo (Center on Mobile, Left on Desktop) */}
        <Link to="/" className="navbar-brand" aria-label="BOOKKARO Home">
          <span className="brand-name">BOOKKARO</span>
        </Link>

        {/* Mobile Right Icons */}
        <div className="mobile-right-icons">
          {isAuthenticated && (
            <>
              <Link to="/cart" className="mobile-icon-link" aria-label={`View cart (${getCartCount()} items)`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {getCartCount() > 0 && (
                  <span className="cart-badge-mobile" aria-label={`${getCartCount()} items in cart`}>{getCartCount()}</span>
                )}
              </Link>
              
              <button 
                className="mobile-profile-icon"
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
            </>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="mobile-menu" ref={mobileMenuRef} id="mobile-menu">
            <div className="mobile-menu-content">
              {isAuthenticated && userRole === 'USER' && (
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

              {/* Home - only for non-authenticated or USER role */}
              {(!isAuthenticated || userRole === 'USER') && (
                <Link to="/" className={`mobile-menu-item ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Home
                </Link>
              )}

              {/* Services - only for non-authenticated or USER role */}
              {(!isAuthenticated || userRole === 'USER') && (
                <Link to="/services" className={`mobile-menu-item ${isActive('/services') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  Services
                </Link>
              )}

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
        
        {/* Desktop Search - Only for USER role */}
        {isAuthenticated && userRole === 'USER' && (
          <div className="navbar-search-container desktop-only" ref={searchRef}>
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                className="search-input"
                aria-label="Search services"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="clear-search-button"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
              <button type="submit" className="search-button" aria-label="Search for services">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </form>
            
            {/* Enhanced Autocomplete Suggestions Dropdown */}
            {showSuggestions && (
              <div className="search-suggestions">
                {isSearching && (
                  <div className="suggestion-loading">
                    <div className="loading-spinner"></div>
                    <span>Searching...</span>
                  </div>
                )}
                
                {!isSearching && suggestions.length > 0 && (
                  <>
                    <div className="suggestion-section-header">Services</div>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id || index}
                        className={`suggestion-item ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="suggestion-icon">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <div className="suggestion-content">
                          <span className="suggestion-name">{suggestion.name}</span>
                          {suggestion.category && (
                            <span className="suggestion-category">{suggestion.category}</span>
                          )}
                        </div>
                        {suggestion.price && (
                          <span className="suggestion-price">₹{suggestion.price}</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
                
                {!isSearching && suggestions.length === 0 && searchHistory.length > 0 && (
                  <>
                    <div className="suggestion-section-header">
                      Recent Searches
                      <button onClick={clearSearchHistory} className="clear-history-btn">
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSuggestionClick({ name: item })}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="suggestion-icon history-icon">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </>
                )}
                
                {!isSearching && suggestions.length === 0 && searchHistory.length === 0 && trendingSearches.length > 0 && (
                  <>
                    <div className="suggestion-section-header">Trending Searches</div>
                    {trendingSearches.map((item, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSuggestionClick({ name: item })}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="suggestion-icon trending-icon">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </>
                )}
                
                {!isSearching && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                  <div className="suggestion-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No services found for "{searchQuery}"</p>
                    <small>Try different keywords or browse categories</small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-only">
          {/* Home - only for non-authenticated or USER role */}
          {(!isAuthenticated || userRole === 'USER') && (
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} aria-label="Home page">
              Home
            </Link>
          )}
          {/* Services - only for non-authenticated or USER role */}
          {(!isAuthenticated || userRole === 'USER') && (
            <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`} aria-label="Browse services">
              Services
            </Link>
          )}
          
          {isAuthenticated ? (
            <>
              {/* VENDOR Navigation */}
              {userRole === 'VENDOR' && (
                <>
                  <Link to="/vendor/dashboard" className={`nav-link ${isActive('/vendor/dashboard') ? 'active' : ''}`} aria-label="Vendor Dashboard">
                    Dashboard
                  </Link>
                  <Link to="/vendor/services" className={`nav-link ${isActive('/vendor/services') ? 'active' : ''}`} aria-label="Manage Services">
                    My Services
                  </Link>
                  <Link to="/vendor/bookings" className={`nav-link ${isActive('/vendor/bookings') ? 'active' : ''}`} aria-label="View Bookings">
                    Bookings
                  </Link>
                  <Link to="/vendor/analytics" className={`nav-link ${isActive('/vendor/analytics') ? 'active' : ''}`} aria-label="View Analytics">
                    Analytics
                  </Link>
                </>
              )}

              {/* ADMIN Navigation */}
              {userRole === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} aria-label="Admin Dashboard">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`} aria-label="Manage Users">
                    Users
                  </Link>
                  <Link to="/admin/vendors" className={`nav-link ${isActive('/admin/vendors') ? 'active' : ''}`} aria-label="Manage Vendors">
                    Vendors
                  </Link>
                  <Link to="/admin/services" className={`nav-link ${isActive('/admin/services') ? 'active' : ''}`} aria-label="Manage Services">
                    Services
                  </Link>
                  <Link to="/admin/bookings" className={`nav-link ${isActive('/admin/bookings') ? 'active' : ''}`} aria-label="View All Bookings">
                    Bookings
                  </Link>
                  <Link to="/admin/audit-logs" className={`nav-link ${isActive('/admin/audit-logs') ? 'active' : ''}`} aria-label="Audit Logs">
                    Audit Logs
                  </Link>
                  
                  {/* Content Dropdown */}
                  <div className="nav-dropdown" ref={contentMenuRef}>
                    <button 
                      className={`nav-link dropdown-toggle ${isActive('/admin/content') || isActive('/admin/announcements') || isActive('/admin/faqs') || isActive('/admin/banners') || isActive('/admin/coupons') ? 'active' : ''}`}
                      onClick={() => setShowContentMenu(!showContentMenu)}
                      aria-expanded={showContentMenu}
                      aria-haspopup="true"
                      aria-label="Content Management Menu"
                    >
                      Content
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px', verticalAlign: 'middle'}}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {showContentMenu && (
                      <div className="profile-menu content-menu-dropdown">
                        <Link 
                          to="/admin/functionality-management" 
                          className="profile-menu-item"
                          onClick={() => setShowContentMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m5.2-15.8l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m20.8-5.2l-4.2 4.2m-2 2l-4.2 4.2"></path>
                          </svg>
                          Functionality Management
                        </Link>
                        <Link 
                          to="/admin/announcements" 
                          className="profile-menu-item"
                          onClick={() => setShowContentMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          </svg>
                          Announcements
                        </Link>
                        <Link 
                          to="/admin/faqs" 
                          className="profile-menu-item"
                          onClick={() => setShowContentMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                          FAQs
                        </Link>
                        <Link 
                          to="/admin/banners" 
                          className="profile-menu-item"
                          onClick={() => setShowContentMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                            <polyline points="17 2 12 7 7 2"></polyline>
                          </svg>
                          Ads (Banners)
                        </Link>
                        <Link 
                          to="/admin/coupons" 
                          className="profile-menu-item"
                          onClick={() => setShowContentMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          Coupons
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* USER Navigation */}
              {userRole === 'USER' && (
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

              <NotificationBell />
                </>
              )}

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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}} aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
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
                          to="/admin/content" 
                          className="profile-menu-item"
                          onClick={() => setShowProfileMenu(false)}
                          role="menuitem"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          Content Management
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
