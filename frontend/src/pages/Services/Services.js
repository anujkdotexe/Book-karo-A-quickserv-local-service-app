import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { serviceAPI, favoriteAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import './Services.css';

// Utility function to sanitize input (prevent XSS)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
    .replace(/[;\\]/g, '') // Remove SQL special characters
    .trim();
};

const Services = () => {
  const [urlSearchParams] = useSearchParams();
  const modal = useModal();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortLoading, setSortLoading] = useState(false);
  const [error, setError] = useState('');
  const favoritePendingRef = useRef(new Set()); // Track pending favorite operations
  
  // Load filters from localStorage on mount
  const loadFiltersFromStorage = () => {
    try {
      const savedFilters = localStorage.getItem('serviceFilters');
      if (savedFilters) {
        return JSON.parse(savedFilters);
      }
    } catch (err) {
      console.error('Failed to load filters from localStorage:', err);
    }
    return {
      category: '',
      city: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    };
  };

  const loadSortFromStorage = () => {
    try {
      const savedSort = localStorage.getItem('serviceSort');
      if (savedSort) {
        const { sortBy, sortDir } = JSON.parse(savedSort);
        return { sortBy: sortBy || 'averageRating', sortDir: sortDir || 'desc' };
      }
    } catch (err) {
      console.error('Failed to load sort from localStorage:', err);
    }
    return { sortBy: 'averageRating', sortDir: 'desc' };
  };

  const [searchParams, setSearchParams] = useState(loadFiltersFromStorage());
  const savedSort = loadSortFromStorage();
  const [sortBy, setSortBy] = useState(savedSort.sortBy);
  const [sortDir, setSortDir] = useState(savedSort.sortDir);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('serviceFilters', JSON.stringify(searchParams));
    } catch (err) {
      console.error('Failed to save filters to localStorage:', err);
    }
  }, [searchParams]);

  // Save sort to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('serviceSort', JSON.stringify({ sortBy, sortDir }));
    } catch (err) {
      console.error('Failed to save sort to localStorage:', err);
    }
  }, [sortBy, sortDir]);

  // Handle search query from URL
  useEffect(() => {
    const searchQuery = urlSearchParams.get('search');
    if (searchQuery) {
      setSearchParams(prev => ({
        ...prev,
        category: searchQuery  // Use category field for general search
      }));
    }
  }, [urlSearchParams]);

  // Helper function to sync favorites to localStorage
  const syncFavoritesToStorage = (favoriteSet) => {
    try {
      localStorage.setItem('favoriteIds', JSON.stringify([...favoriteSet]));
    } catch (e) {
      console.error('Failed to cache favorites:', e);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      const favServices = response.data.data || [];
      const ids = new Set(favServices.map(fav => fav.id));
      setFavoriteIds(ids);
      syncFavoritesToStorage(ids);
    } catch (err) {
      try {
        const cached = localStorage.getItem('favoriteIds');
        if (cached) {
          setFavoriteIds(new Set(JSON.parse(cached)));
        } else {
          setFavoriteIds(new Set());
        }
      } catch (e) {
        setFavoriteIds(new Set());
      }
    }
  };

  const fetchCities = async () => {
    try {
      const response = await serviceAPI.getCities();
      setCities(response.data.data || []);
    } catch (err) {
      // Failed to load cities - not critical, continue without city suggestions
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await serviceAPI.getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      // Failed to load categories - will extract from services instead
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchCategories();
    fetchFavorites();
    
    // Periodically refresh favorites to handle network instability
    const favoritesRefreshInterval = setInterval(() => {
      fetchFavorites();
    }, 60000); // Refresh every 60 seconds
    
    // Cleanup
    return () => {
      clearInterval(favoritesRefreshInterval);
      // Optionally clear filters on unmount (disabled by default)
      // localStorage.removeItem('serviceFilters');
    };
  }, []);

  const fetchServices = useCallback(async () => {
    setSortLoading(true);
    setLoading(true);
    setError('');
    try {
      const response = await serviceAPI.searchServices(
        searchParams,
        page,
        9,
        sortBy,
        sortDir
      );
      
      // Handle both paginated and non-paginated responses
      let servicesList = [];
      if (response.data.data) {
        if (response.data.data.content) {
          // Paginated response
          servicesList = response.data.data.content || [];
          setTotalPages(response.data.data.totalPages || 0);
          setTotalElements(response.data.data.totalElements || servicesList.length);
        } else if (Array.isArray(response.data.data)) {
          // Array response
          servicesList = response.data.data;
          setTotalPages(1);
          setTotalElements(servicesList.length);
        }
      }
      
      setServices(servicesList);
      
      // Extract unique categories from services only if not already loaded
      if (categories.length === 0) {
        const uniqueCategories = [...new Set(servicesList.map(s => s.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      setServices([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
      setSortLoading(false);
    }
  }, [searchParams, page, sortBy, sortDir]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleToggleFavorite = async (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent duplicate requests
    if (favoritePendingRef.current.has(serviceId)) {
      return;
    }
    
    favoritePendingRef.current.add(serviceId);
    
    try {
      if (favoriteIds.has(serviceId)) {
        await favoriteAPI.removeFromFavorites(serviceId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          syncFavoritesToStorage(newSet);
          return newSet;
        });
        modal.success('Removed from favorites');
      } else {
        await favoriteAPI.addToFavorites(serviceId);
        setFavoriteIds(prev => {
          const newSet = new Set([...prev, serviceId]);
          syncFavoritesToStorage(newSet);
          return newSet;
        });
        modal.success('Added to favorites');
      }
    } catch (err) {
      modal.error('Failed to update favorites. Please login to save favorites.');
      setError('Failed to update favorites. Please login to save favorites.');
    } finally {
      favoritePendingRef.current.delete(serviceId);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate price range
    const minPrice = parseFloat(searchParams.minPrice) || 0;
    const maxPrice = parseFloat(searchParams.maxPrice) || Infinity;
    
    if (minPrice > maxPrice && searchParams.maxPrice !== '') {
      modal.error('Minimum price cannot be greater than maximum price');
      return;
    }
    
    setPage(0);
    fetchServices();
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    // Sanitize text inputs (including city)
    if (name === 'location') {
      // Allow only letters, numbers, spaces, commas, and hyphens for location
      sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
      // Limit location length
      if (sanitizedValue.length > 100) {
        sanitizedValue = sanitizedValue.substring(0, 100);
      }
    } else if (name === 'category' || name === 'city') {
      sanitizedValue = sanitizeInput(value);
    }
    
    // Validate numeric inputs
    if ((name === 'minPrice' || name === 'maxPrice' || name === 'minRating') && value) {
      // Remove non-numeric characters except decimal point
      sanitizedValue = value.replace(/[^\d.]/g, '');
      // Prevent negative numbers
      if (parseFloat(sanitizedValue) < 0) {
        sanitizedValue = '0';
      }
      // Limit rating to 0-5
      if (name === 'minRating' && parseFloat(sanitizedValue) > 5) {
        sanitizedValue = '5';
      }
    }
    
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: sanitizedValue,
    }));
    // Reset to page 0 when filters change
    setPage(0);
  };

  const handleKeyPress = (e) => {
    // Allow Enter key to submit search from location input
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = { ...validationErrors };
    
    // Validate price range
    if (name === 'minPrice' || name === 'maxPrice') {
      const minPrice = parseFloat(name === 'minPrice' ? value : searchParams.minPrice) || 0;
      const maxPrice = parseFloat(name === 'maxPrice' ? value : searchParams.maxPrice) || Infinity;
      
      if (searchParams.maxPrice && minPrice > maxPrice) {
        errors.priceRange = 'Minimum price cannot be greater than maximum price';
      } else {
        delete errors.priceRange;
      }
    }
    
    // Validate rating
    if (name === 'minRating' && value) {
      const rating = parseFloat(value);
      if (rating < 0 || rating > 5) {
        errors.minRating = 'Rating must be between 0 and 5';
      } else {
        delete errors.minRating;
      }
    }
    
    // Validate location length
    if (name === 'location' && value && value.length > 100) {
      errors.location = 'Location must be less than 100 characters';
    } else if (name === 'location') {
      delete errors.location;
    }
    
    setValidationErrors(errors);
  };

  const handleSortChange = (newSortBy) => {
    setSortLoading(true);
    if (sortBy === newSortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
  };

  const clearFilters = () => {
    setSearchParams({
      category: '',
      city: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    });
    setPage(0);
  };

  if (loading && services.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="container">
          <h1 className="fade-in">Find Your Perfect Service</h1>
          <p className="fade-in">Browse through our curated list of quality service providers</p>
        </div>
      </div>

      <div className="container">
        {/* ARIA Live Region for Search Results Announcement */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {!loading && !error && services.length > 0 && (
            `Found ${totalElements} services${searchParams.category ? ` in ${searchParams.category}` : ''}${searchParams.city ? ` in ${searchParams.city}` : ''}.`
          )}
          {!loading && !error && services.length === 0 && (
            'No services found matching your criteria.'
          )}
        </div>
        
        <div className="search-filter-section fade-in">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-inputs">
              <select
                name="category"
                value={searchParams.category}
                onChange={handleSearchChange}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                name="city"
                value={searchParams.city}
                onChange={handleSearchChange}
                aria-label="Filter by city"
              >
                <option value="">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
              <input
                type="text"
                name="location"
                placeholder="Location or area"
                value={searchParams.location}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                aria-label="Search by location or area"
                aria-invalid={!!validationErrors.location}
                aria-describedby={validationErrors.location ? 'location-error' : undefined}
                maxLength="100"
              />
              {validationErrors.location && (
                <span id="location-error" className="validation-error" role="alert">
                  {validationErrors.location}
                </span>
              )}
              <button type="submit" className="btn btn-primary" aria-label="Search services">
                Search
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filters-panel"
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </form>

          {showFilters && (
            <div className="filters-panel" id="filters-panel" role="region" aria-label="Advanced filters">
              <div className="filter-group">
                <label htmlFor="minPrice">Price Range</label>
                <div className="price-inputs">
                  <input
                    id="minPrice"
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={searchParams.minPrice}
                    onChange={handleSearchChange}
                    onBlur={handleBlur}
                    min="0"
                    step="1"
                    aria-label="Minimum price"
                    aria-invalid={!!validationErrors.priceRange}
                  />
                  <span>to</span>
                  <input
                    id="maxPrice"
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={searchParams.maxPrice}
                    onChange={handleSearchChange}
                    onBlur={handleBlur}
                    min="0"
                    step="1"
                    aria-label="Maximum price"
                    aria-invalid={!!validationErrors.priceRange}
                  />
                </div>
                {validationErrors.priceRange && (
                  <span className="validation-error" role="alert">
                    {validationErrors.priceRange}
                  </span>
                )}
              </div>

              <div className="filter-group">
                <label htmlFor="minRating">Minimum Rating</label>
                <select
                  id="minRating"
                  name="minRating"
                  value={searchParams.minRating}
                  onChange={handleSearchChange}
                  aria-label="Filter by minimum rating"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>

              <div className="filter-group">
                <button className="btn btn-outline" onClick={clearFilters} aria-label="Clear all filters">
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="sort-section" role="toolbar" aria-label="Sort options">
            <span aria-hidden="true">Sort by:</span>
            {sortLoading && <span className="sort-loading-spinner" aria-label="Loading sorted results"></span>}
            <button 
              className={`sort-btn ${sortBy === 'averageRating' ? 'active' : ''}`}
              onClick={() => handleSortChange('averageRating')}
              aria-label={`Sort by rating ${sortBy === 'averageRating' ? (sortDir === 'desc' ? 'descending' : 'ascending') : ''}`}
              aria-pressed={sortBy === 'averageRating'}
            >
              Rating {sortBy === 'averageRating' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
              onClick={() => handleSortChange('price')}
              aria-label={`Sort by price ${sortBy === 'price' ? (sortDir === 'desc' ? 'descending' : 'ascending') : ''}`}
              aria-pressed={sortBy === 'price'}
            >
              Price {sortBy === 'price' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'serviceName' ? 'active' : ''}`}
              onClick={() => handleSortChange('serviceName')}
              aria-label={`Sort by name ${sortBy === 'serviceName' ? (sortDir === 'desc' ? 'descending' : 'ascending') : ''}`}
              aria-pressed={sortBy === 'serviceName'}
            >
              Name {sortBy === 'serviceName' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message-card" role="alert">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Unable to Load Services</h3>
            <p>{error}</p>
            {error.includes('not found') || error.includes('No services') ? (
              <div className="error-help-text">
                <p><strong>Currently serving:</strong> Mumbai, Delhi, Bangalore</p>
                <p>Can't find what you're looking for? <Link to="/contact" className="link-primary">Contact us</Link> to request service in your area.</p>
              </div>
            ) : null}
            <button onClick={fetchServices} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Services Grid */}
        {loading && services.length === 0 ? (
          <div className="services-grid">
            <SkeletonLoader type="service" count={9} />
          </div>
        ) : !error && services.length === 0 && !loading ? (
          <div className="no-results-message" role="status" aria-live="polite">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <h3>No Services Found</h3>
            <p>We couldn't find any services matching your search criteria.</p>
            
            {/* Show active filters */}
            {(searchParams.category || searchParams.city || searchParams.location || 
              searchParams.minPrice || searchParams.maxPrice || searchParams.minRating) && (
              <div className="active-filters-info">
                <p><strong>Active filters:</strong></p>
                <ul>
                  {searchParams.category && <li>Category: {searchParams.category}</li>}
                  {searchParams.city && <li>City: {searchParams.city}</li>}
                  {searchParams.location && <li>Location: {searchParams.location}</li>}
                  {searchParams.minPrice && <li>Min Price: ₹{searchParams.minPrice}</li>}
                  {searchParams.maxPrice && <li>Max Price: ₹{searchParams.maxPrice}</li>}
                  {searchParams.minRating && <li>Min Rating: {searchParams.minRating} Stars</li>}
                </ul>
                <p className="suggestion-text">
                  <strong>Suggestions:</strong> Try removing some filters or expanding your search area.
                </p>
              </div>
            )}
            
            <div className="no-results-actions">
              <button 
                onClick={clearFilters}
                className="btn btn-primary"
                aria-label="Clear all filters and show all services"
              >
                Clear All Filters
              </button>
              {cities.length > 0 && (
                <p className="available-cities">
                  <strong>Available in:</strong> {cities.slice(0, 5).join(', ')}
                  {cities.length > 5 && ` and ${cities.length - 5} more`}
                </p>
              )}
            </div>
          </div>
        ) : !error && services.length > 0 ? (
          <>
            <div className="services-grid" role="list" aria-label="Available services">
              {services.map((service) => (
                <div key={service.id} className="service-card-wrapper" role="listitem">
                  <Link
                    to={`/services/${service.id}`}
                    className="service-card"
                    aria-label={`View details for ${service.serviceName}`}
                  >
                    <div className="service-header">
                      <h3>{service.serviceName}</h3>
                      <span className="service-category">{service.category}</span>
                    </div>
                    <p className="service-description" title={service.description}>
                      {service.description && service.description.length > 120
                        ? service.description.substring(0, 120).replace(/\s+\S*$/, '') + '...'
                        : service.description || 'No description available'}
                    </p>
                    <div className="service-details">
                      <div className="service-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{service.city || 'N/A'}, {service.state || 'N/A'}</span>
                      </div>
                      <div className="service-rating" aria-label={`Rating ${service.averageRating ? parseFloat(service.averageRating).toFixed(1) : '0.0'} out of 5 stars, ${service.totalReviews || 0} reviews`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{service.averageRating ? parseFloat(service.averageRating).toFixed(1) : '0.0'}</span>
                        <span className="review-count">({service.totalReviews || 0})</span>
                      </div>
                    </div>
                    <div className="service-footer">
                      <div className="service-vendor" aria-label="Service provider">
                        By {service.vendor?.businessName || 
                            (service.vendor?.firstName && service.vendor?.lastName 
                              ? `${service.vendor.firstName} ${service.vendor.lastName}` 
                              : 'Verified Provider')}
                      </div>
                      <div className="service-price" aria-label={`Price ${service.price || '0'} rupees`}>₹{service.price || '0'}</div>
                    </div>
                  </Link>
                  <button 
                    className={`favorite-icon-btn ${favoriteIds.has(service.id) ? 'favorited' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, service.id)}
                    aria-label={favoriteIds.has(service.id) ? `Remove ${service.serviceName} from favorites` : `Add ${service.serviceName} to favorites`}
                    disabled={favoritePendingRef.current.has(service.id)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill={favoriteIds.has(service.id) ? '#ef4444' : 'none'}
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" role="navigation" aria-label="Pagination navigation">
                <button
                  className="btn btn-outline pagination-btn"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  aria-label={`Go to previous page, page ${page}`}
                  aria-disabled={page === 0}
                  tabIndex={page === 0 ? -1 : 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  <span>Previous</span>
                </button>
                <span className="page-info" role="status" aria-live="polite" aria-atomic="true">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  className="btn btn-outline pagination-btn"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  aria-label={`Go to next page, page ${page + 2}`}
                  aria-disabled={page >= totalPages - 1}
                  tabIndex={page >= totalPages - 1 ? -1 : 0}
                >
                  <span>Next</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : !error && !loading ? (
          <div className="no-results-card">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
            </svg>
            <h2>No Services Found</h2>
            <p>We couldn't find any services matching your search criteria.</p>
            <div className="no-results-suggestions">
              <h3>Try these tips:</h3>
              <ul>
                <li>Check your spelling and try different keywords</li>
                <li>Select a different city or remove location filters</li>
                <li>Adjust your price range or rating filters</li>
                <li>Try browsing all categories</li>
              </ul>
            </div>
            <div className="no-results-actions">
              <button onClick={clearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
              <Link to="/contact" className="btn btn-outline">
                Request a Service
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Services;
