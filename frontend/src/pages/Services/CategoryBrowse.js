import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './CategoryBrowse.css';

/**
 * Category Browse Component
 * Hierarchical category browsing with parent-child relationships
 */
const CategoryBrowse = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/categories');
      setCategories(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId && cat.isActive);
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isActive);
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/services?category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="category-browse">
        <LoadingSpinner message="Loading categories..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-browse">
        <div className="error-container">
          <h2>Unable to Load Categories</h2>
          <p>{error}</p>
          <button onClick={loadCategories} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const parentCategories = getParentCategories();

  return (
    <div className="category-browse">
      <div className="container">
        <div className="category-header">
          <h1>Browse Services by Category</h1>
          <p>Find the perfect service for your needs</p>
        </div>

        {parentCategories.length === 0 ? (
          <div className="empty-state">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            <h2>No Categories Available</h2>
            <p>Check back later for service categories</p>
          </div>
        ) : (
          <div className="categories-grid">
            {parentCategories.map(parent => {
              const children = getChildCategories(parent.id);
              const isExpanded = selectedParent === parent.id;

              return (
                <div 
                  key={parent.id} 
                  className={`category-card ${isExpanded ? 'expanded' : ''}`}
                >
                  <div 
                    className="category-header-section"
                    onClick={() => setSelectedParent(isExpanded ? null : parent.id)}
                  >
                    <div className="category-icon">
                      {getCategoryIcon(parent.name)}
                    </div>
                    <div className="category-info">
                      <h3>{parent.name}</h3>
                      {parent.description && (
                        <p className="category-description">{parent.description}</p>
                      )}
                      {children.length > 0 && (
                        <span className="subcategory-count">
                          {children.length} subcategories
                        </span>
                      )}
                    </div>
                    {children.length > 0 && (
                      <div className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>

                  {children.length > 0 && isExpanded && (
                    <div className="subcategories">
                      {children.map(child => (
                        <div
                          key={child.id}
                          className="subcategory-item"
                          onClick={() => handleCategoryClick(child.id, child.name)}
                        >
                          <div className="subcategory-icon">→</div>
                          <div className="subcategory-info">
                            <h4>{child.name}</h4>
                            {child.description && (
                              <p className="subcategory-description">{child.description}</p>
                            )}
                          </div>
                          <div className="browse-arrow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {children.length === 0 && (
                    <button
                      className="btn btn-outline btn-sm view-services-btn"
                      onClick={() => handleCategoryClick(parent.id, parent.name)}
                    >
                      View Services
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="browse-info">
          <h3>Can't find what you're looking for?</h3>
          <p>Browse all services or use the search to find specific providers</p>
          <div className="browse-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/services')}
            >
              View All Services
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/services?search=true')}
            >
              Search Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get category icon based on name
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Cleaning': '🧹',
    'Plumbing': '🔧',
    'Electrical': '⚡',
    'Painting': '🎨',
    'Carpentry': '🪛',
    'Beauty': '💄',
    'Salon': '💇',
    'Spa': '💆',
    'Fitness': '💪',
    'Tutoring': '📚',
    'Photography': '📷',
    'Catering': '🍽️',
    'Gardening': '🌱',
    'Pest Control': '🐛',
    'Moving': '📦',
    'Appliance': '🔌',
    'AC Repair': '❄️',
    'default': '📋'
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }

  return iconMap.default;
};

export default CategoryBrowse;
