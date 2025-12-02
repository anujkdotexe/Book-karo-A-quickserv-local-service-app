import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceAPI, reviewAPI, favoriteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useModal } from '../../components/Modal/Modal';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const modal = useModal();
  
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Review section state
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [reviewSort, setReviewSort] = useState('RECENT');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState({});

  const checkFavoriteStatus = useCallback(async () => {
    if (!user) {
      setIsFavorite(false);
      return;
    }
    try {
      const response = await favoriteAPI.checkFavorite(id);
      setIsFavorite(response.data.data === true);
    } catch (err) {
      setIsFavorite(false);
    }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      modal.warning('Please login to save favorites');
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        await favoriteAPI.removeFromFavorites(id);
        setIsFavorite(false);
        modal.success('Service removed from your favorites');
      } else {
        await favoriteAPI.addToFavorites(id);
        setIsFavorite(true);
        modal.success('Service added to your favorites');
      }
    } catch (err) {
      modal.error('Failed to update favorites. Please try again.');
    }
  };

  const fetchServiceDetails = useCallback(async () => {
    try {
      const response = await serviceAPI.getServiceById(id);
      setService(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError(err.response?.data?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async (filterRating = null) => {
    try {
      const response = await reviewAPI.getServiceReviews(id, filterRating);
      const reviewsData = response.data?.data || [];
      setReviews(reviewsData);
    } catch (err) {
      console.error('❌ Error fetching reviews:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error message:', err.message);
      setReviews([]);
    }
  }, [id]);

  useEffect(() => {
    setIsFavorite(false);
    
    const loadData = async () => {
      await fetchServiceDetails();
      await fetchReviews();
      await checkFavoriteStatus();
    };
    
    loadData();
    
    return () => {
      setIsFavorite(false);
    };
  }, [id, fetchServiceDetails, fetchReviews, checkFavoriteStatus]);

  const handleBookNow = async () => {
    if (!user) {
      modal.warning('Please login to book services');
      navigate('/login');
      return;
    }

    if (isInCart(parseInt(id))) {
      navigate('/cart');
      return;
    }

    const result = await addToCart({
      id: parseInt(id),
      name: service.serviceName,
      description: service.description,
      price: service.price,
      category: service.category,
      city: service.city,
      state: service.state,
      vendor: service.vendor
    });

    if (result.success) {
      // Show success message and navigate to cart
      modal.success('Service added to cart successfully!', {
        onConfirm: () => navigate('/cart')
      });
    } else {
      modal.error(result.message);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      modal.warning('Please login to add services to cart');
      navigate('/login');
      return;
    }

    if (isInCart(parseInt(id))) {
      modal.info('This service is already in your cart');
      navigate('/cart');
      return;
    }

    const result = await addToCart({
      id: parseInt(id),
      name: service.serviceName,
      description: service.description,
      price: service.price,
      category: service.category,
      city: service.city,
      state: service.state,
      vendor: service.vendor
    });

    if (result.success) {
      modal.success('Service added to cart successfully! You can continue shopping or proceed to checkout.');
    } else {
      modal.error(result.message);
    }
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.round(review.rating || 0);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    return distribution;
  };

  // Sort reviews (filtering now done by backend)
  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews];

    switch (reviewSort) {
      case 'RECENT':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'TOP':
        filtered.sort((a, b) => (helpfulReviews[b.id] || 0) - (helpfulReviews[a.id] || 0));
        break;
      case 'HIGH_TO_LOW':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'LOW_TO_HIGH':
        filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!user) {
      modal.warning('Please login to mark reviews as helpful');
      navigate('/login');
      return;
    }

    try {
      const response = await reviewAPI.markHelpful(reviewId);
      const newCount = response.data.data;
      setHelpfulReviews(prev => ({
        ...prev,
        [reviewId]: newCount
      }));
      modal.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Error marking review as helpful:', err);
      if (err.response?.status === 401) {
        modal.warning('Please login to mark reviews as helpful');
        navigate('/login');
      } else {
        modal.error('Failed to submit feedback. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="error-container">
        <h2>Service Not Found</h2>
        <p>{error || 'The service you are looking for does not exist.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/services')}>
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <div className="container">
        <Breadcrumb 
          customItems={[
            { label: 'Services', path: '/services' },
            { label: service.serviceName }
          ]} 
        />
        
        <button className="btn btn-outline back-button" onClick={() => navigate('/services')}>
          Back to Services
        </button>

        <div className="service-detail-container fade-in">
          <div className="service-header-section">
            <div className="service-title-section">
              <h1>{service.serviceName}</h1>
              <span className="service-category-badge">{service.category}</span>
            </div>
            <div className="service-actions-section">
              <button 
                className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                onClick={handleToggleFavorite}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill={isFavorite ? '#ef4444' : 'none'}
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {isFavorite ? 'Saved' : 'Save'}
              </button>
              <div className="service-price-section">
                <div className="price-label">Starting at</div>
                <div className="price-value">₹{service.price}</div>
                <div className="duration-label">Duration: {service.durationMinutes} mins</div>
              </div>
            </div>
          </div>

          <div className="service-rating-section">
            <div className="rating-display">
              <span className="rating-stars">
                {service.averageRating ? parseFloat(service.averageRating).toFixed(1) : '0.0'} ⭐
              </span>
              <span className="rating-count">({service.totalReviews || 0} reviews)</span>
            </div>
            <div className="availability-badge">
              {service.isAvailable ? '✓ Available' : '✗ Not Available'}
            </div>
          </div>

          <div className="service-content-grid">
            <div className="service-main-content">
              <section className="service-section">
                <h3>About This Service</h3>
                <p className="service-description">{service.description}</p>
              </section>

              <section className="service-section">
                <h3>Service Location</h3>
                <div className="location-info">
                  <p><strong>Address:</strong> {service.address}</p>
                  <p><strong>City:</strong> {service.city}, {service.state}</p>
                  <p><strong>PIN Code:</strong> {service.postalCode}</p>
                </div>
              </section>

              {service.isAvailable && (
                <section className="service-section">
                  <div className="action-buttons-row">
                    <button 
                      className="btn btn-primary btn-action"
                      onClick={handleBookNow}
                    >
                      Book Now
                    </button>
                    <button
                      className={`btn btn-outline btn-action ${isInCart(parseInt(id)) ? 'in-cart' : ''}`}
                      onClick={handleAddToCart}
                      disabled={isInCart(parseInt(id))}
                    >
                      {isInCart(parseInt(id)) ? (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          In Cart
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}

              <section className="service-section reviews-section">
                  {/* Review Header with Sort */}
                  <div className="review-header-controls">
                    <h3>Customer Reviews</h3>
                    <div className="review-sort">
                      <label>Sort by:</label>
                      <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}>
                        <option value="RECENT">Most Recent</option>
                        <option value="TOP">Top Reviews</option>
                        <option value="HIGH_TO_LOW">Highest to Lowest</option>
                        <option value="LOW_TO_HIGH">Lowest to Highest</option>
                      </select>
                    </div>
                  </div>

                  {/* Rating Summary */}
                  <div className="rating-summary">
                    <div className="rating-overview">
                      <div className="average-rating">
                        <div className="rating-number">{service.averageRating ? parseFloat(service.averageRating).toFixed(1) : '0.0'}</div>
                        <div className="rating-stars-large">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill={star <= Math.round(service.averageRating || 0) ? '#2563eb' : '#e5e7eb'} stroke="none">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                        <div className="rating-count">{reviews.length} ratings</div>
                      </div>
                      
                      <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map(star => {
                          const distribution = getRatingDistribution();
                          const count = distribution[star] || 0;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div 
                              key={star} 
                              className={`rating-bar-row ${reviewFilter === star.toString() ? 'active' : ''}`}
                              onClick={() => {
                                const newFilter = reviewFilter === star.toString() ? 'ALL' : star.toString();
                                setReviewFilter(newFilter);
                                fetchReviews(newFilter === 'ALL' ? null : parseInt(newFilter));
                              }}
                            >
                              <span className="star-label">{star} star</span>
                              <div className="rating-bar-container">
                                <div className="rating-bar" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="rating-count-text">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Filter Badge */}
                  {reviewFilter !== 'ALL' && (
                    <div className="review-filter-info">
                      <span className="filter-badge">
                        Showing {reviewFilter}-star reviews
                        <button onClick={() => { setReviewFilter('ALL'); fetchReviews(null); }} className="clear-filter">✕</button>
                      </span>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="reviews-list">
                    {(() => {
                      const filteredReviews = getFilteredAndSortedReviews();
                      
                      if (reviews.length === 0) {
                        return (
                          <div className="no-reviews-message">
                            <p>No reviews yet. Be the first to review this service!</p>
                          </div>
                        );
                      }
                      
                      return filteredReviews
                        .slice(0, showAllReviews ? undefined : 5)
                        .map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="review-user-info">
                              <div className="review-user-avatar">
                                {(review.userName || 'A').charAt(0).toUpperCase()}
                              </div>
                              <div className="review-user">{review.userName || 'Anonymous'}</div>
                            </div>
                            <div className="review-rating-stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= Math.round(review.rating || 0) ? '#2563eb' : '#e5e7eb'} stroke="none">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                              <span className="rating-text">{review.rating?.toFixed(1) || '0.0'} out of 5</span>
                            </div>
                          </div>
                          
                          <div className="review-date">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Date not available'}
                          </div>
                          
                          <p className="review-comment">{review.comment || 'No comment provided'}</p>
                          
                          <div className="review-footer">
                            <button 
                              className="helpful-btn"
                              onClick={() => handleHelpfulVote(review.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                              </svg>
                              Helpful ({helpfulReviews[review.id] || review.helpfulCount || 0})
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Load More Button */}
                  {getFilteredAndSortedReviews().length > 5 && (
                    <div className="review-load-more">
                      {!showAllReviews ? (
                        <button 
                          className="btn btn-outline btn-load-more"
                          onClick={() => setShowAllReviews(true)}
                        >
                          View All {getFilteredAndSortedReviews().length} Reviews
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline btn-load-more"
                          onClick={() => setShowAllReviews(false)}
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  )}
              </section>
            </div>

            <div className="service-sidebar">
              <div className="vendor-card">
                <h3>Service Provider</h3>
                <div className="vendor-info">
                  {service.vendor?.firstName && service.vendor?.lastName && (
                    <p><strong>Name:</strong> {service.vendor.firstName} {service.vendor.lastName}</p>
                  )}
                  <p><strong>Business:</strong> {service.vendor?.businessName || 'N/A'}</p>
                  {service.vendor?.location && (
                    <p><strong>Location:</strong> {service.vendor.location}</p>
                  )}
                  {service.vendor?.yearsOfExperience && (
                    <p><strong>Experience:</strong> {service.vendor.yearsOfExperience} years</p>
                  )}
                  {service.vendor?.phone && (
                    <p><strong>Contact:</strong> {service.vendor.phone}</p>
                  )}
                  {service.vendor?.email && (
                    <p><strong>Email:</strong> {service.vendor.email}</p>
                  )}
                  {service.vendor?.availability && (
                    <p><strong>Availability:</strong> {service.vendor.availability}</p>
                  )}
                  <div className="vendor-rating">
                    <span>{service.vendor?.averageRating || '0.0'} ⭐</span>
                    <span>({service.vendor?.totalReviews || 0} reviews)</span>
                    {service.vendor?.isVerified && (
                      <span className="verified-badge" title="Verified Vendor">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
