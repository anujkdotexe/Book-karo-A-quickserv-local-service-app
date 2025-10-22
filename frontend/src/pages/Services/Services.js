import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { serviceAPI, favoriteAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Services.css';

const Services = () => {
  const [urlSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    category: '',
    city: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
  });
  const [sortBy, setSortBy] = useState('averageRating');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

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

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      // Response contains array of services that are favorited
      const favServices = response.data.data || [];
      const ids = new Set(favServices.map(fav => fav.id));
      setFavoriteIds(ids);
    } catch (err) {
      // User not logged in or no favorites - start with empty set
      setFavoriteIds(new Set());
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

  useEffect(() => {
    fetchCities();
    fetchFavorites();
  }, []);

  const fetchServices = useCallback(async () => {
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
      
      // Extract unique categories from services
      const uniqueCategories = [...new Set(servicesList.map(s => s.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      setServices([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, sortBy, sortDir]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleToggleFavorite = async (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (favoriteIds.has(serviceId)) {
        await favoriteAPI.removeFromFavorites(serviceId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          return newSet;
        });
      } else {
        await favoriteAPI.addToFavorites(serviceId);
        setFavoriteIds(prev => new Set([...prev, serviceId]));
      }
    } catch (err) {
      setError('Failed to update favorites. Please login to save favorites.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchServices();
  };

  const handleSearchChange = (e) => {
    const newParams = {
      ...searchParams,
      [e.target.name]: e.target.value,
    };
    setSearchParams(newParams);
    // Reset to page 0 when filters change
    setPage(0);
  };

  const handleSortChange = (newSortBy) => {
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
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </form>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Price Range</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={searchParams.minPrice}
                    onChange={handleSearchChange}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={searchParams.maxPrice}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Minimum Rating</label>
                <select
                  name="minRating"
                  value={searchParams.minRating}
                  onChange={handleSearchChange}
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>

              <div className="filter-group">
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="sort-section">
            <span>Sort by:</span>
            <button 
              className={`sort-btn ${sortBy === 'averageRating' ? 'active' : ''}`}
              onClick={() => handleSortChange('averageRating')}
            >
              Rating {sortBy === 'averageRating' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
              onClick={() => handleSortChange('price')}
            >
              Price {sortBy === 'price' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'serviceName' ? 'active' : ''}`}
              onClick={() => handleSortChange('serviceName')}
            >
              Name {sortBy === 'serviceName' && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner fullScreen />}

        {!loading && error && (
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
        {!loading && !error && services.length > 0 ? (
          <>
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card-wrapper">
                  <Link
                    to={`/services/${service.id}`}
                    className="service-card"
                  >
                    <div className="service-header">
                      <h3>{service.serviceName}</h3>
                      <span className="service-category">{service.category}</span>
                    </div>
                    <p className="service-description">
                      {service.description?.substring(0, 120)}...
                    </p>
                    <div className="service-details">
                      <div className="service-location">
                        {service.city}, {service.state}
                      </div>
                      <div className="service-rating">
                        {service.averageRating || 0} stars ({service.totalReviews || 0} reviews)
                      </div>
                    </div>
                    <div className="service-footer">
                      <div className="service-vendor">
                        By {service.vendor?.firstName} {service.vendor?.lastName}
                      </div>
                      <div className="service-price">₹{service.price}</div>
                    </div>
                  </Link>
                  <button 
                    className={`favorite-icon-btn ${favoriteIds.has(service.id) ? 'favorited' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, service.id)}
                    title={favoriteIds.has(service.id) ? 'Remove from favorites' : 'Add to favorites'}
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
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
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
