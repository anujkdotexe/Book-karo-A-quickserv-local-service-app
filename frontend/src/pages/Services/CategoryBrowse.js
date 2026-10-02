import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './CategoryBrowse.css';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Home Cleaning', description: 'Deep cleaning, dusting, sanitization and kitchen care', isActive: true, parentId: null },
  { id: 101, name: 'Full House Deep Cleaning', description: 'Complete floor, window, and furniture sanitization', isActive: true, parentId: 1 },
  { id: 102, name: 'Kitchen & Bathroom Cleaning', description: 'Degreasing, tile scrubbing and disinfection', isActive: true, parentId: 1 },
  { id: 103, name: 'Sofa & Carpet Shampooing', description: 'Fabric stain removal and deep vacuuming', isActive: true, parentId: 1 },

  { id: 2, name: 'Plumbing', description: 'Pipe leak repairs, tap fixtures, bathroom and drainage solutions', isActive: true, parentId: null },
  { id: 201, name: 'Taps & Mixers Repair', description: 'Fix dripping faucets, showers, and pipe valves', isActive: true, parentId: 2 },
  { id: 202, name: 'Drainage & Pipe Blockage', description: 'Kitchen sink unclogging and sewer line clearing', isActive: true, parentId: 2 },
  { id: 203, name: 'Water Tank Cleaning', description: 'Hygienic mechanized domestic tank cleaning', isActive: true, parentId: 2 },

  { id: 3, name: 'Electrical', description: 'Wiring, switches, fuse boxes, appliance installations and fans', isActive: true, parentId: null },
  { id: 301, name: 'Fan & Light Fitting', description: 'Ceiling fans, decorative lights, and chandeliers', isActive: true, parentId: 3 },
  { id: 302, name: 'Switchboard & MCB Repair', description: 'Short circuit troubleshooting and socket setup', isActive: true, parentId: 3 },
  { id: 303, name: 'Inverter & Wiring Setup', description: 'Home backup wiring and stabilizer installation', isActive: true, parentId: 3 },

  { id: 4, name: 'Appliance Repair', description: 'AC, refrigerator, microwave, washing machine servicing', isActive: true, parentId: null },
  { id: 401, name: 'AC Service & Gas Refill', description: 'Deep filter jet cleaning and coolant recharge', isActive: true, parentId: 4 },
  { id: 402, name: 'Washing Machine Repair', description: 'Motor, drum, and drainage troubleshooting', isActive: true, parentId: 4 },
  { id: 403, name: 'Refrigerator Servicing', description: 'Cooling coil, thermostat, and gas charging', isActive: true, parentId: 4 },

  { id: 5, name: 'Painting & Waterproofing', description: 'Interior/exterior wall painting, waterproofing and finishes', isActive: true, parentId: null },
  { id: 501, name: 'Interior Wall Painting', description: 'Fresh coat, texture paint, and stencil design', isActive: true, parentId: 5 },
  { id: 502, name: 'Waterproofing & Seepage Fix', description: 'Roof, ceiling, and bathroom leak insulation', isActive: true, parentId: 5 },

  { id: 6, name: 'Carpentry', description: 'Furniture repair, door locks, modular setups and woodwork', isActive: true, parentId: null },
  { id: 601, name: 'Furniture Repair & Assembly', description: 'Beds, tables, wardrobes, and modular fittings', isActive: true, parentId: 6 },
  { id: 602, name: 'Door Locks & Handles', description: 'High security latch, lock, and hinge installation', isActive: true, parentId: 6 },

  { id: 7, name: 'Salon & Spa', description: 'Haircuts, facials, massage, grooming in the comfort of home', isActive: true, parentId: null },
  { id: 701, name: 'Haircut & Styling', description: 'Professional salon hair styling and treatments', isActive: true, parentId: 7 },
  { id: 702, name: 'Facial & Skincare', description: 'Organic glow facials, waxing, and cleanups', isActive: true, parentId: 7 },

  { id: 8, name: 'Pest Control', description: 'Termite, cockroach, rodent and mosquito treatment', isActive: true, parentId: null },
  { id: 801, name: 'Cockroach & Ant Control', description: 'Odorless gel treatment with long lasting effect', isActive: true, parentId: 8 },
  { id: 802, name: 'Termite & Bedbug Shield', description: 'Wood drill & inject treatment with warranty', isActive: true, parentId: 8 }
];

/**
 * Category Browse Component
 * Hierarchical category browsing with parent-child relationships
 */
const CategoryBrowse = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // Correct endpoint: api client baseURL already has /api/v1
      const response = await api.get('/categories');
      const apiCategories = response.data?.data || response.data || [];
      if (Array.isArray(apiCategories) && apiCategories.length > 0) {
        setCategories(apiCategories);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
      setError(null);
    } catch (err) {
      console.warn('Backend categories endpoint not reachable, using verified fallback catalogue:', err?.message);
      // Keep rich default catalogue so users never see a broken white screen
      setCategories(DEFAULT_CATEGORIES);
      setError(null);
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

  if (loading && categories.length === 0) {
    return (
      <div className="category-browse">
        <LoadingSpinner message="Loading categories..." size="large" />
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="category-browse">
        <div className="container">
          <div className="error-container">
            <div className="error-icon" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2>Unable to Load Categories</h2>
            <p>{error}</p>
            <div className="browse-actions">
              <button onClick={loadCategories} className="btn btn-primary">
                Retry
              </button>
              <button onClick={() => navigate('/services')} className="btn btn-outline">
                Browse All Services
              </button>
            </div>
          </div>
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
                          <div className="subcategory-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </div>
                          <div className="subcategory-info">
                            <h4>{child.name}</h4>
                            {child.description && (
                              <p className="subcategory-description">{child.description}</p>
                            )}
                          </div>
                          <div className="browse-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// Helper function to return modern SVG icons for categories
const getCategoryIcon = (categoryName = '') => {
  const name = categoryName.toLowerCase();

  if (name.includes('plumb')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    );
  }

  if (name.includes('electr')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    );
  }

  if (name.includes('clean') || name.includes('home service')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    );
  }

  if (name.includes('paint')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
      </svg>
    );
  }

  if (name.includes('appliance') || name.includes('ac')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    );
  }

  if (name.includes('carpent')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"></path>
        <path d="M17.64 4.36a9 9 0 0 1 2 2"></path>
        <path d="M14 6l6 6"></path>
      </svg>
    );
  }

  if (name.includes('salon') || name.includes('beauty') || name.includes('spa')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3"></circle>
        <circle cx="6" cy="18" r="3"></circle>
        <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
        <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
        <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
      </svg>
    );
  }

  if (name.includes('pest')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    );
  }

  if (name.includes('mov') || name.includes('logistic')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    );
  }

  if (name.includes('it') || name.includes('soft') || name.includes('tech')) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="2" y1="20" x2="22" y2="20"></line>
      </svg>
    );
  }

  // Fallback icon
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  );
};

export default CategoryBrowse;
