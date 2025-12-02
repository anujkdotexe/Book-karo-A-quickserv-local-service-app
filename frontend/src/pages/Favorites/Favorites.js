import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteAPI } from '../../services/api';
import { useModal } from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const modal = useModal();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteAPI.getFavorites();
      setFavorites(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load favorites');
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (serviceId) => {
    try {
      await favoriteAPI.removeFromFavorites(serviceId);
      setFavorites(favorites.filter(service => service.id !== serviceId));
      modal.success('Service removed from your favorites successfully');
    } catch (err) {
      setError('Failed to remove from favorites');
      modal.error('Failed to remove from favorites. Please try again.');
    }
  };

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1>My Favorites</h1>
          <p>Quick access to your favorite services</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <LoadingSpinner message="Loading favorites..." size="thick" fullScreen />
        ) : favorites.length === 0 ? (
          <div className="empty-state-card">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>No Favorites Yet</h2>
            <p>Save your favorite services for quick access and easy booking next time!</p>
            <div className="empty-state-benefits">
              <h3>Benefits of saving favorites:</h3>
              <ul>
                <li>Quick access to services you love</li>
                <li>Get notified about special offers</li>
                <li>Track your favorite service providers</li>
                <li>Easily compare and book later</li>
              </ul>
            </div>
            <Link to="/services" className="btn btn-primary btn-large btn-cta-prominent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              Find Services to Favorite
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((service) => (
              <div key={service.id} className="favorite-card">
                <div className="favorite-header">
                  <Link to={`/services/${service.id}`} className="service-link">
                    <h3>{service.serviceName}</h3>
                  </Link>
                  <button
                    className="remove-favorite-btn"
                    onClick={() => handleRemoveFavorite(service.id)}
                    title="Remove from favorites"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <div className="service-category">
                  {service.category}
                </div>

                <p className="service-description">
                  {service.description && service.description.length > 120
                    ? `${service.description.substring(0, 120)}...`
                    : service.description}
                </p>

                <div className="service-details">
                  <div className="service-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {service.city}, {service.state}
                  </div>

                  {service.averageRating > 0 && (
                    <div className="service-rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="gold" stroke="gold">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {service.averageRating.toFixed(1)} ({service.totalReviews})
                    </div>
                  )}
                </div>

                <div className="favorite-footer">
                  <div className="service-price">
                    Rs. {service.price?.toLocaleString()}
                  </div>
                  <Link
                    to={`/services/${service.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
