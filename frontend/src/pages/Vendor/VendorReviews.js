import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../../services/vendorAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import './VendorReviews.css';

const VendorReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reviews, filterRating, sortBy]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={star <= rating ? 'star filled' : 'star'}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateStats = () => {
    if (reviews.length === 0) {
      return { average: 0, distribution: [0, 0, 0, 0, 0] };
    }

    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => distribution[r.rating - 1]++);

    return { average, distribution };
  };

  const stats = calculateStats();

  if (loading) {
    return <LoadingSpinner message="Loading reviews..." size="thick" fullScreen />;
  }

  if (error) {
    return (
      <ErrorModal
        title="Failed to Load Reviews"
        message={error}
        onRefresh={loadReviews}
        onClose={() => setError(null)}
      />
    );
  }

  return (
    <div className="vendor-reviews">
      <div className="reviews-header">
        <div className="header-top">
          <button className="back-button" onClick={() => navigate('/vendor/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1>Customer Reviews</h1>
        </div>

        {/* Rating Statistics */}
        <div className="rating-stats">
          <div className="average-rating">
            <div className="rating-number">{stats.average.toFixed(1)}</div>
            {renderStars(Math.round(stats.average))}
            <div className="total-reviews">{reviews.length} reviews</div>
          </div>

          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating - 1];
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={rating} className="distribution-row">
                  <span className="rating-label">{rating} star</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="reviews-controls">
        <div className="filter-group">
          <label htmlFor="filter-rating">Filter by Rating:</label>
          <select
            id="filter-rating"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="no-reviews">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h2>No Reviews Found</h2>
          <p>
            {filterRating !== 'all'
              ? 'No reviews match your selected rating filter.'
              : reviews.length === 0
              ? 'You have not received any customer reviews yet.'
              : 'No reviews match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="reviews-list">
          {filteredReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="reviewer-details">
                    <h3>{review.userName}</h3>
                    <p className="review-date">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <div className="review-service">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>{review.serviceName}</span>
              </div>

              {review.comment && (
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
