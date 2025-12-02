import React, { useState, useEffect } from 'react';
import adminAPI from '../../services/adminAPI';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './PlatformAnalytics.css';

const PlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPlatformAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Analytics error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="platform-analytics">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="platform-analytics">
        <div className="error-message-card">
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={loadAnalytics} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Extract data from the comprehensive analytics response
  const userAnalytics = analytics?.userAnalytics || {};
  const vendorAnalytics = analytics?.vendorAnalytics || {};
  const serviceAnalytics = analytics?.serviceAnalytics || {};
  const bookingAnalytics = analytics?.bookingAnalytics || {};
  const revenueAnalytics = analytics?.revenueAnalytics || {};
  const customerExperience = analytics?.customerExperienceAnalytics || {};

  // Helper functions
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Data calculations
  const totalBookings = bookingAnalytics.totalBookings || 1;
  const statusBreakdown = bookingAnalytics.statusBreakdown || {};
  const categoryRevenues = revenueAnalytics.revenueByCategory || [];
  const totalCategoryRevenue = categoryRevenues.reduce((sum, cat) => sum + (cat.revenue || 0), 0) || 1;

  return (
    <div className="platform-analytics">
      {/* Header with Tabs */}
      <div className="analytics-header">
        <div className="header-content">
          <div>
            <h1>Platform Analytics Dashboard</h1>
            <p>Comprehensive insights into your platform's performance and health</p>
          </div>
          <button onClick={loadAnalytics} className="refresh-btn" title="Refresh data">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Vendors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            Services
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Bookings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Revenue
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab 
        userAnalytics={userAnalytics}
        vendorAnalytics={vendorAnalytics}
        serviceAnalytics={serviceAnalytics}
        bookingAnalytics={bookingAnalytics}
        revenueAnalytics={revenueAnalytics}
        customerExperience={customerExperience}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
      />}

      {activeTab === 'users' && <UsersTab 
        userAnalytics={userAnalytics}
        formatNumber={formatNumber}
      />}

      {activeTab === 'vendors' && <VendorsTab 
        vendorAnalytics={vendorAnalytics}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
      />}

      {activeTab === 'services' && <ServicesTab 
        serviceAnalytics={serviceAnalytics}
        revenueAnalytics={revenueAnalytics}
        customerExperience={customerExperience}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
      />}

      {activeTab === 'bookings' && <BookingsTab 
        bookingAnalytics={bookingAnalytics}
        statusBreakdown={statusBreakdown}
        totalBookings={totalBookings}
        formatNumber={formatNumber}
      />}

      {activeTab === 'revenue' && <RevenueTab 
        revenueAnalytics={revenueAnalytics}
        categoryRevenues={categoryRevenues}
        totalCategoryRevenue={totalCategoryRevenue}
        formatCurrency={formatCurrency}
      />}
    </div>
  );
};

// ============= OVERVIEW TAB =============
const OverviewTab = ({ 
  userAnalytics, vendorAnalytics, serviceAnalytics, bookingAnalytics, 
  revenueAnalytics, customerExperience, formatNumber, formatCurrency 
}) => {
  return (
    <>
      {/* Stat Cards - Dashboard Theme Style */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Users</h2>
            <div>
              <span className="stat-value">{formatNumber(userAnalytics.totalUsers)}</span>
              <span className="stat-label">+{formatNumber(userAnalytics.newUsersThisMonth)} this month</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Vendors</h2>
            <div>
              <span className="stat-value">{formatNumber(vendorAnalytics.activeVendors)}</span>
              <span className="stat-label">{vendorAnalytics.approvalStatus?.approved || 0} approved</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Services</h2>
            <div>
              <span className="stat-value">{formatNumber(serviceAnalytics.totalServices)}</span>
              <span className="stat-label">{serviceAnalytics.activeServices || 0} active</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Bookings</h2>
            <div>
              <span className="stat-value">{formatNumber(bookingAnalytics.totalBookings)}</span>
              <span className="stat-label">{((serviceAnalytics.completionRate || 0)).toFixed(1)}% completion</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Revenue</h2>
            <div>
              <span className="stat-value">{formatCurrency(revenueAnalytics.totalRevenue)}</span>
              <span className="stat-label">{formatCurrency(revenueAnalytics.revenueThisMonth)} this month</span>
            </div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Avg Rating</h2>
            <div>
              <span className="stat-value">{(customerExperience.averageRating || 0).toFixed(1)} ★</span>
              <span className="stat-label">
                Based on {(customerExperience.ratingDistribution?.fiveStar || 0) + 
                           (customerExperience.ratingDistribution?.fourStar || 0) + 
                           (customerExperience.ratingDistribution?.threeStar || 0) + 
                           (customerExperience.ratingDistribution?.twoStar || 0) + 
                           (customerExperience.ratingDistribution?.oneStar || 0)} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="quick-stats-section">
        <h2>Quick Statistics</h2>
        <div className="quick-stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatNumber(userAnalytics.activeUsers)}</div>
              <div className="stat-label">Active Users (30d)</div>
              <div className="stat-sublabel">{(userAnalytics.retentionRate || 0).toFixed(1)}% retention rate</div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{bookingAnalytics.statusBreakdown?.completed || 0}</div>
              <div className="stat-label">Completed Bookings</div>
              <div className="stat-sublabel">
                {((bookingAnalytics.statusBreakdown?.completed || 0) / (bookingAnalytics.totalBookings || 1) * 100).toFixed(1)}% completion rate
              </div>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{(customerExperience.averageResponseTimeHours || 0).toFixed(1)}h</div>
              <div className="stat-label">Avg Response Time</div>
              <div className="stat-sublabel">Platform-wide average</div>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatCurrency(revenueAnalytics.platformCommission)}</div>
              <div className="stat-label">Platform Commission</div>
              <div className="stat-sublabel">{(revenueAnalytics.commissionPercentage || 0).toFixed(1)}% of revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Trend Chart */}
      <div className="analytics-card">
        <h3>User Growth Trend (Last 30 Days)</h3>
        <div className="trends-chart">
          <div className="chart-bars">
            {(() => {
              const userGrowth = userAnalytics.userGrowthTimeline || [];
              const maxUsers = Math.max(...userGrowth.map(d => d.newUsers || 0), 1);
              return userGrowth.slice(-30).map((day, index) => {
                const height = ((day.newUsers || 0) / maxUsers) * 100;
                return (
                  <div key={index} className="chart-bar-item">
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${height}%` }}
                    >
                      <span className="bar-value">{day.newUsers || 0}</span>
                    </div>
                    <div className="chart-bar-label">{day.date || `Day ${index + 1}`}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
        <div className="chart-summary">
          New Users This Month: <strong>{formatNumber(userAnalytics.newUsersThisMonth)}</strong>
          {' • '}
          Total Users: <strong>{formatNumber(userAnalytics.totalUsers)}</strong>
        </div>
      </div>

      {/* Booking Volume Trend Chart */}
      <div className="analytics-card">
        <h3>Booking Volume Trend (Last 30 Days)</h3>
        <div className="trends-chart">
          <div className="chart-bars">
            {(() => {
              const bookingTrends = bookingAnalytics.bookingTrends || [];
              const maxBookings = Math.max(...bookingTrends.map(d => d.count || 0), 1);
              return bookingTrends.slice(-30).map((day, index) => {
                const height = ((day.count || 0) / maxBookings) * 100;
                return (
                  <div key={index} className="chart-bar-item">
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${height}%` }}
                    >
                      <span className="bar-value">{day.count || 0}</span>
                    </div>
                    <div className="chart-bar-label">{day.date || `Day ${index + 1}`}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
        <div className="chart-summary">
          Total Bookings: <strong>{formatNumber(bookingAnalytics.totalBookings)}</strong>
          {' • '}
          Daily Average: <strong>{((bookingAnalytics.totalBookings || 0) / 30).toFixed(0)}</strong>
        </div>
      </div>

      {/* Revenue by Category Chart */}
      <div className="analytics-card">
        <h3>Revenue Distribution by Category</h3>
        <div className="category-chart">
          {(() => {
            const categories = revenueAnalytics.revenueByCategory || [];
            const totalRevenue = categories.reduce((sum, cat) => sum + (cat.revenue || 0), 0) || 1;
            return categories.map((cat, index) => {
              const percentage = ((cat.revenue / totalRevenue) * 100).toFixed(1);
              return (
                <div key={index} className="category-row">
                  <div className="category-info">
                    <div className="category-name">{cat.category}</div>
                    <div className="category-bookings">{formatNumber(cat.bookings)} bookings</div>
                  </div>
                  <div className="category-bar-wrapper">
                    <div 
                      className="category-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="category-value">{formatCurrency(cat.revenue)}</span>
                    </div>
                  </div>
                  <div className="category-percent">{percentage}%</div>
                </div>
              );
            });
          })()}
        </div>
        <div className="chart-summary">
          Total Revenue: <strong>{formatCurrency(revenueAnalytics.totalRevenue)}</strong>
          {' • '}
          Categories: <strong>{(revenueAnalytics.revenueByCategory || []).length}</strong>
        </div>
      </div>

      {/* Platform Health Metrics */}
      <div className="analytics-card">
        <h3>Platform Health Metrics</h3>
        <div className="health-metrics-grid">
          <div className="health-metric">
            <div className="metric-donut">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="10"
                  strokeDasharray={`${((serviceAnalytics.activeServices || 0) / (serviceAnalytics.totalServices || 1)) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20" fontWeight="700" fill="#1e293b">
                  {((serviceAnalytics.activeServices || 0) / (serviceAnalytics.totalServices || 1) * 100).toFixed(0)}%
                </text>
              </svg>
            </div>
            <div className="metric-label">Active Services</div>
            <div className="metric-sublabel">{formatNumber(serviceAnalytics.activeServices)} of {formatNumber(serviceAnalytics.totalServices)}</div>
          </div>

          <div className="health-metric">
            <div className="metric-donut">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="10"
                  strokeDasharray={`${(serviceAnalytics.completionRate || 0) * 2.512} 251.2`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20" fontWeight="700" fill="#1e293b">
                  {(serviceAnalytics.completionRate || 0).toFixed(0)}%
                </text>
              </svg>
            </div>
            <div className="metric-label">Completion Rate</div>
            <div className="metric-sublabel">Booking success rate</div>
          </div>

          <div className="health-metric">
            <div className="metric-donut">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="10"
                  strokeDasharray={`${((vendorAnalytics.activeVendors || 0) / (vendorAnalytics.totalVendors || 1)) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20" fontWeight="700" fill="#1e293b">
                  {((vendorAnalytics.activeVendors || 0) / (vendorAnalytics.totalVendors || 1) * 100).toFixed(0)}%
                </text>
              </svg>
            </div>
            <div className="metric-label">Active Vendors</div>
            <div className="metric-sublabel">{formatNumber(vendorAnalytics.activeVendors)} of {formatNumber(vendorAnalytics.totalVendors)}</div>
          </div>

          <div className="health-metric">
            <div className="metric-donut">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="10"
                  strokeDasharray={`${((customerExperience.averageRating || 0) / 5) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="7" fontSize="18" fontWeight="700" fill="#1e293b">
                  {(customerExperience.averageRating || 0).toFixed(1)}
                </text>
              </svg>
            </div>
            <div className="metric-label">Avg Rating</div>
            <div className="metric-sublabel">Out of 5.0 stars</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="analytics-grid-2col">
        {/* Left Column - Top Performers */}
        <div className="analytics-column">
          {/* Top Performing Services */}
          <div className="analytics-card">
            <h3>Top Performing Services (by Bookings)</h3>
            <div>
              <div className="top-items-list">
                {(serviceAnalytics.topServicesByBookings || []).slice(0, 5).map((service, index) => (
                  <div key={service.id} className="top-item">
                    <div className="item-rank" style={{ 
                      background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e5e7eb',
                      color: index < 3 ? '#000' : '#666'
                    }}>
                      #{index + 1}
                    </div>
                    <div className="item-details">
                      <div className="item-name">{service.serviceName}</div>
                      <div className="item-meta">
                        <span className="badge-cat">{service.category}</span>
                        <span className="badge-vendor">{service.vendorName}</span>
                      </div>
                    </div>
                    <div className="item-stats">
                      <div className="stat-pill bookings">{formatNumber(service.totalBookings)} bookings</div>
                      <div className="stat-pill revenue">{formatCurrency(service.totalRevenue)}</div>
                      <div className="stat-pill rating">★ {(service.averageRating || 0).toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Vendors */}
          <div className="analytics-card">
            <h3>Top Vendors (by Revenue)</h3>
            <div>
              <div className="top-items-list">
                {(vendorAnalytics.topVendorsByRevenue || []).slice(0, 5).map((vendor, index) => (
                  <div key={vendor.id} className="top-item">
                    <div className="item-rank" style={{ 
                      background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e5e7eb',
                      color: index < 3 ? '#000' : '#666'
                    }}>
                      #{index + 1}
                    </div>
                    <div className="item-details">
                      <div className="item-name">{vendor.businessName}</div>
                      <div className="item-meta">
                        <span className="badge-code">{vendor.vendorCode}</span>
                      </div>
                    </div>
                    <div className="item-stats">
                      <div className="stat-pill revenue">{formatCurrency(vendor.totalRevenue)}</div>
                      <div className="stat-pill bookings">{formatNumber(vendor.totalBookings)} bookings</div>
                      <div className="stat-pill rating">★ {(vendor.averageRating || 0).toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Charts and Distributions */}
        <div className="analytics-column">
          {/* Customer Reviews Distribution */}
          <div className="analytics-card">
            <h3>Customer Reviews Distribution</h3>
            <div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = customerExperience.ratingDistribution?.[
                    `${['five', 'four', 'three', 'two', 'one'][5-stars]}Star`
                  ] || 0;
                  const total = (customerExperience.ratingDistribution?.fiveStar || 0) + 
                               (customerExperience.ratingDistribution?.fourStar || 0) + 
                               (customerExperience.ratingDistribution?.threeStar || 0) + 
                               (customerExperience.ratingDistribution?.twoStar || 0) + 
                               (customerExperience.ratingDistribution?.oneStar || 0) || 1;
                  const percentage = ((count / total) * 100);
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];
                  
                  return (
                    <div key={stars} className="rating-bar-row">
                      <div className="rating-stars">
                        {'★'.repeat(stars)} ({stars})
                      </div>
                      <div className="rating-bar-container">
                        <div 
                          className="rating-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            background: colors[5-stars]
                          }}
                        >
                          {count > 0 && <span className="rating-count">{count}</span>}
                        </div>
                      </div>
                      <div className="rating-percentage">{percentage.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="chart-summary">
              Average: <strong>{(customerExperience.averageRating || 0).toFixed(1)} / 5.0</strong> 
              {' • '}
              Total: <strong>{(customerExperience.ratingDistribution?.fiveStar || 0) + 
                            (customerExperience.ratingDistribution?.fourStar || 0) + 
                            (customerExperience.ratingDistribution?.threeStar || 0) + 
                            (customerExperience.ratingDistribution?.twoStar || 0) + 
                            (customerExperience.ratingDistribution?.oneStar || 0)} reviews</strong>
            </div>
          </div>

          {/* Booking Status Breakdown */}
          <div className="analytics-card">
            <h3>Booking Status Breakdown</h3>
            <div>
              <div className="status-breakdown">
                {[
                  { status: 'Completed', key: 'completed', color: '#10b981', icon: '✓' },
                  { status: 'Confirmed', key: 'confirmed', color: '#3b82f6', icon: '◉' },
                  { status: 'Pending', key: 'pending', color: '#f59e0b', icon: '⏱' },
                  { status: 'Cancelled', key: 'cancelled', color: '#ef4444', icon: '✕' }
                ].map(item => {
                  const count = bookingAnalytics.statusBreakdown?.[item.key] || 0;
                  const percentage = ((count / (bookingAnalytics.totalBookings || 1)) * 100);
                  
                  return (
                    <div key={item.status} className="status-bar">
                      <div className="status-header">
                        <span className="status-icon" style={{ color: item.color }}>{item.icon}</span>
                        <span className="status-label">{item.status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                      <div className="status-bar-container">
                        <div 
                          className="status-bar-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            background: item.color
                          }}
                        ></div>
                      </div>
                      <div className="status-percentage">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="chart-summary">
              Total Bookings: <strong>{bookingAnalytics.totalBookings || 0}</strong>
              {' • '}
              Cancellation Rate: <strong>{(bookingAnalytics.cancellationRate || 0).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============= USERS TAB =============
const UsersTab = ({ userAnalytics, formatNumber }) => {
  return (
    <div className="tab-content">
      <h2 className="tab-title">User Analytics</h2>
      
      {/* User Growth Metrics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Users</h2>
            <div>
              <span className="stat-value">{formatNumber(userAnalytics.totalUsers)}</span>
              <span className="stat-label">Platform-wide registered users</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Users</h2>
            <div>
              <span className="stat-value">{formatNumber(userAnalytics.activeUsers)}</span>
              <span className="stat-label">Active in last 30 days</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Retention Rate</h2>
            <div>
              <span className="stat-value">{(userAnalytics.retentionRate || 0).toFixed(1)}%</span>
              <span className="stat-label">User retention percentage</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Churn Rate</h2>
            <div>
              <span className="stat-value">{(userAnalytics.churnRate || 0).toFixed(1)}%</span>
              <span className="stat-label">User churn percentage</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Timeline */}
      <div className="analytics-card">
        <h3>User Growth Timeline</h3>
        <div className="timeline-stats">
          <div className="timeline-stat">
            <div className="timeline-label">Today</div>
            <div className="timeline-value">{userAnalytics.newUsersToday || 0}</div>
            <div className="timeline-sublabel">new users</div>
          </div>
          <div className="timeline-stat">
            <div className="timeline-label">This Week</div>
            <div className="timeline-value">{userAnalytics.newUsersThisWeek || 0}</div>
            <div className="timeline-sublabel">new users</div>
          </div>
          <div className="timeline-stat">
            <div className="timeline-label">This Month</div>
            <div className="timeline-value">{userAnalytics.newUsersThisMonth || 0}</div>
            <div className="timeline-sublabel">new users</div>
          </div>
        </div>
      </div>

      {/* User Segmentation */}
      <div className="analytics-card">
        <h3>User Segmentation</h3>
        <div className="segmentation-grid">
          <div className="segment-card customers">
            <div className="segment-icon"></div>
            <div className="segment-value">{formatNumber(userAnalytics.segmentation?.customers || 0)}</div>
            <div className="segment-label">Customers</div>
            <div className="segment-percentage">
              {((userAnalytics.segmentation?.customers || 0) / (userAnalytics.totalUsers || 1) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="segment-card vendors">
            <div className="segment-icon"></div>
            <div className="segment-value">{formatNumber(userAnalytics.segmentation?.vendors || 0)}</div>
            <div className="segment-label">Vendors</div>
            <div className="segment-percentage">
              {((userAnalytics.segmentation?.vendors || 0) / (userAnalytics.totalUsers || 1) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="segment-card admins">
            <div className="segment-icon"></div>
            <div className="segment-value">{formatNumber(userAnalytics.segmentation?.admins || 0)}</div>
            <div className="segment-label">Admins</div>
            <div className="segment-percentage">
              {((userAnalytics.segmentation?.admins || 0) / (userAnalytics.totalUsers || 1) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= VENDORS TAB =============
const VendorsTab = ({ vendorAnalytics, formatNumber, formatCurrency }) => {
  return (
    <div className="tab-content">
      <h2 className="tab-title">Vendor Analytics</h2>
      
      {/* Vendor Metrics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Vendors</h2>
            <div>
              <span className="stat-value">{formatNumber(vendorAnalytics.totalVendors)}</span>
              <span className="stat-label">Registered vendors</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Vendors</h2>
            <div>
              <span className="stat-value">{formatNumber(vendorAnalytics.activeVendors)}</span>
              <span className="stat-label">Currently active</span>
            </div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Avg Rating</h2>
            <div>
              <span className="stat-value">{(vendorAnalytics.averageVendorRating || 0).toFixed(1)} ★</span>
              <span className="stat-label">Platform average</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Inactive Vendors</h2>
            <div>
              <span className="stat-value">{formatNumber(vendorAnalytics.inactiveVendors)}</span>
              <span className="stat-label">Not currently active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Growth Timeline */}
      <div className="analytics-card">
        <h3>Vendor Growth Timeline</h3>
        <div className="timeline-stats">
          <div className="timeline-stat">
            <div className="timeline-label">Today</div>
            <div className="timeline-value">{vendorAnalytics.newVendorsToday || 0}</div>
            <div className="timeline-sublabel">new vendors</div>
          </div>
          <div className="timeline-stat">
            <div className="timeline-label">This Week</div>
            <div className="timeline-value">{vendorAnalytics.newVendorsThisWeek || 0}</div>
            <div className="timeline-sublabel">new vendors</div>
          </div>
          <div className="timeline-stat">
            <div className="timeline-label">This Month</div>
            <div className="timeline-value">{vendorAnalytics.newVendorsThisMonth || 0}</div>
            <div className="timeline-sublabel">new vendors</div>
          </div>
        </div>
      </div>

      {/* Vendor Approval Status */}
      <div className="analytics-card">
        <h3>Vendor Approval Status</h3>
        <div className="approval-stats-grid">
          <div className="approval-stat-card approved">
            <div className="approval-stat-icon"></div>
            <div className="approval-stat-value">{vendorAnalytics.approvalStatus?.approved || 0}</div>
            <div className="approval-stat-label">Approved</div>
          </div>

          <div className="approval-stat-card pending">
            <div className="approval-stat-icon"></div>
            <div className="approval-stat-value">{vendorAnalytics.approvalStatus?.pending || 0}</div>
            <div className="approval-stat-label">Pending</div>
          </div>

          <div className="approval-stat-card rejected">
            <div className="approval-stat-icon"></div>
            <div className="approval-stat-value">{vendorAnalytics.approvalStatus?.rejected || 0}</div>
            <div className="approval-stat-label">Rejected</div>
          </div>

          <div className="approval-stat-card suspended">
            <div className="approval-stat-icon"></div>
            <div className="approval-stat-value">{vendorAnalytics.approvalStatus?.suspended || 0}</div>
            <div className="approval-stat-label">Suspended</div>
          </div>
        </div>
      </div>

      {/* Top Vendors Lists */}
      <div className="analytics-grid-2col">
        <div className="analytics-column">
          <div className="analytics-card">
            <h3>Top Vendors by Revenue</h3>
            <div className="top-items-list">
              {(vendorAnalytics.topVendorsByRevenue || []).slice(0, 10).map((vendor, index) => (
                <div key={vendor.id} className="top-item">
                  <div className="item-rank" style={{ 
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e5e7eb',
                    color: index < 3 ? '#000' : '#666'
                  }}>
                    #{index + 1}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{vendor.businessName}</div>
                    <div className="item-meta">
                      <span className="badge-code">{vendor.vendorCode}</span>
                    </div>
                  </div>
                  <div className="item-stats">
                    <div className="stat-pill revenue">{formatCurrency(vendor.totalRevenue)}</div>
                    <div className="stat-pill bookings">{formatNumber(vendor.totalBookings)} bookings</div>
                    <div className="stat-pill rating">{(vendor.averageRating || 0).toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-column">
          <div className="analytics-card">
            <h3>Top Vendors by Bookings</h3>
            <div className="top-items-list">
              {(vendorAnalytics.topVendorsByBookings || []).slice(0, 10).map((vendor, index) => (
                <div key={vendor.id} className="top-item">
                  <div className="item-rank" style={{ 
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e5e7eb',
                    color: index < 3 ? '#000' : '#666'
                  }}>
                    #{index + 1}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{vendor.businessName}</div>
                    <div className="item-meta">
                      <span className="badge-code">{vendor.vendorCode}</span>
                    </div>
                  </div>
                  <div className="item-stats">
                    <div className="stat-pill bookings">{formatNumber(vendor.totalBookings)} bookings</div>
                    <div className="stat-pill revenue">{formatCurrency(vendor.totalRevenue)}</div>
                    <div className="stat-pill rating">{(vendor.averageRating || 0).toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= SERVICES TAB =============
const ServicesTab = ({ serviceAnalytics, revenueAnalytics, customerExperience, formatNumber, formatCurrency }) => {
  const categoryRevenues = revenueAnalytics.revenueByCategory || [];
  const totalCategoryRevenue = categoryRevenues.reduce((sum, cat) => sum + (cat.revenue || 0), 0) || 1;

  return (
    <div className="tab-content">
      <h2 className="tab-title">Service Analytics</h2>
      
      {/* Service Metrics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Services</h2>
            <div>
              <span className="stat-value">{formatNumber(serviceAnalytics.totalServices)}</span>
              <span className="stat-label">Listed services</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Services</h2>
            <div>
              <span className="stat-value">{formatNumber(serviceAnalytics.activeServices)}</span>
              <span className="stat-label">Currently available</span>
            </div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Avg Rating</h2>
            <div>
              <span className="stat-value">{(serviceAnalytics.averageServiceRating || 0).toFixed(1)} ★</span>
              <span className="stat-label">Service average</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Completion Rate</h2>
            <div>
              <span className="stat-value">{(serviceAnalytics.completionRate || 0).toFixed(1)}%</span>
              <span className="stat-label">Booking completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="analytics-card">
        <h3>Service Status Overview</h3>
        <div className="service-status-grid">
          <div className="status-stat active">
            <div className="status-stat-icon"></div>
            <div className="status-stat-value">{serviceAnalytics.activeServices || 0}</div>
            <div className="status-stat-label">Active Services</div>
          </div>

          <div className="status-stat inactive">
            <div className="status-stat-icon"></div>
            <div className="status-stat-value">{serviceAnalytics.inactiveServices || 0}</div>
            <div className="status-stat-label">Inactive Services</div>
          </div>

          <div className="status-stat pending">
            <div className="status-stat-icon"></div>
            <div className="status-stat-value">{serviceAnalytics.pendingApprovals || 0}</div>
            <div className="status-stat-label">Pending Approval</div>
          </div>

          <div className="status-stat rejected">
            <div className="status-stat-icon"></div>
            <div className="status-stat-value">{serviceAnalytics.rejectedServices || 0}</div>
            <div className="status-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Service Performance This Month */}
      <div className="analytics-card">
        <h3>This Month's Performance</h3>
        <div className="performance-stats">
          <div className="performance-stat">
            <div className="performance-icon"></div>
            <div className="performance-value">{serviceAnalytics.bookingsThisMonth || 0}</div>
            <div className="performance-label">Bookings this month</div>
          </div>
          <div className="performance-stat">
            <div className="performance-icon"></div>
            <div className="performance-value">{formatCurrency(serviceAnalytics.revenueThisMonth)}</div>
            <div className="performance-label">Revenue this month</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="analytics-card">
        <h3>Service Distribution by Category</h3>
        <div className="category-chart">
          {categoryRevenues.map(cat => {
            const percentage = ((cat.revenue / totalCategoryRevenue) * 100).toFixed(1);
            return (
              <div key={cat.category} className="category-row">
                <div className="category-info">
                  <div className="category-name">{cat.category}</div>
                  <div className="category-bookings">{cat.bookings} bookings</div>
                </div>
                <div className="category-bar-wrapper">
                  <div 
                    className="category-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="category-value">{formatCurrency(cat.revenue)}</span>
                  </div>
                </div>
                <div className="category-percent">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Services Lists */}
      <div className="analytics-grid-2col">
        <div className="analytics-column">
          <div className="analytics-card">
            <h3>Top Services by Bookings</h3>
            <div className="top-items-list">
              {(serviceAnalytics.topServicesByBookings || []).slice(0, 10).map((service, index) => (
                <div key={service.id} className="top-item">
                  <div className="item-rank" style={{ 
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e5e7eb',
                    color: index < 3 ? '#000' : '#666'
                  }}>
                    #{index + 1}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{service.serviceName}</div>
                    <div className="item-meta">
                      <span className="badge-cat">{service.category}</span>
                      <span className="badge-vendor">{service.vendorName}</span>
                    </div>
                  </div>
                  <div className="item-stats">
                    <div className="stat-pill bookings">{formatNumber(service.totalBookings)} bookings</div>
                    <div className="stat-pill revenue">{formatCurrency(service.totalRevenue)}</div>
                    <div className="stat-pill rating">{(service.averageRating || 0).toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-column">
          <div className="analytics-card">
            <h3>Top Services by Revenue</h3>
            <div className="top-items-list">
              {(serviceAnalytics.topServicesByRevenue || []).slice(0, 10).map((service, index) => (
                <div key={service.id} className="top-item">
                  <div className="item-rank" style={{ 
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e5e7eb',
                    color: index < 3 ? '#000' : '#666'
                  }}>
                    #{index + 1}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{service.serviceName}</div>
                    <div className="item-meta">
                      <span className="badge-cat">{service.category}</span>
                      <span className="badge-vendor">{service.vendorName}</span>
                    </div>
                  </div>
                  <div className="item-stats">
                    <div className="stat-pill revenue">{formatCurrency(service.totalRevenue)}</div>
                    <div className="stat-pill bookings">{formatNumber(service.totalBookings)} bookings</div>
                    <div className="stat-pill rating">{(service.averageRating || 0).toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= BOOKINGS TAB =============
const BookingsTab = ({ bookingAnalytics, statusBreakdown, totalBookings, formatNumber }) => {
  const bookingTrends = bookingAnalytics.bookingTrends || [];
  
  return (
    <div className="tab-content">
      <h2 className="tab-title">Booking Analytics</h2>
      
      {/* Booking Metrics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Bookings</h2>
            <div>
              <span className="stat-value">{formatNumber(totalBookings)}</span>
              <span className="stat-label">All-time bookings</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Completed</h2>
            <div>
              <span className="stat-value">{formatNumber(statusBreakdown.completed)}</span>
              <span className="stat-label">{((statusBreakdown.completed || 0) / totalBookings * 100).toFixed(1)}% of total</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Cancelled</h2>
            <div>
              <span className="stat-value">{formatNumber(statusBreakdown.cancelled)}</span>
              <span className="stat-label">{(bookingAnalytics.cancellationRate || 0).toFixed(1)}% cancellation rate</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Abandoned</h2>
            <div>
              <span className="stat-value">{formatNumber(bookingAnalytics.abandonedBookings)}</span>
              <span className="stat-label">Incomplete bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="analytics-card">
        <h3>Booking Status Breakdown</h3>
        <div className="status-breakdown-detailed">
          {[
            { status: 'Completed', key: 'completed', color: '#10b981', icon: '', desc: 'Successfully finished' },
            { status: 'Confirmed', key: 'confirmed', color: '#3b82f6', icon: '', desc: 'Accepted and scheduled' },
            { status: 'Pending', key: 'pending', color: '#f59e0b', icon: '', desc: 'Awaiting confirmation' },
            { status: 'Cancelled', key: 'cancelled', color: '#ef4444', icon: '', desc: 'Booking cancelled' }
          ].map(item => {
            const count = statusBreakdown[item.key] || 0;
            const percentage = ((count / totalBookings) * 100).toFixed(1);
            
            return (
              <div key={item.status} className="status-breakdown-row">
                <div className="status-info">
                  <div className="status-name">
                    <span className="status-icon" style={{ color: item.color }}>{item.icon}</span>
                    {item.status}
                  </div>
                  <div className="status-desc">{item.desc}</div>
                </div>
                <div className="status-stats">
                  <div className="status-count">{count}</div>
                  <div className="status-bar-wrapper">
                    <div 
                      className="status-bar-progress" 
                      style={{ width: `${percentage}%`, background: item.color }}
                    ></div>
                  </div>
                  <div className="status-percent">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Trends Chart */}
      <div className="analytics-card">
        <h3>Booking Trends (Last 30 Days)</h3>
        <div className="trends-chart">
          {bookingTrends.length > 0 ? (
            <div className="chart-bars">
              {bookingTrends.map((trend, index) => {
                const maxCount = Math.max(...bookingTrends.map(t => t.count || 0), 1);
                const height = ((trend.count || 0) / maxCount) * 100;
                
                return (
                  <div key={index} className="chart-bar-item">
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${height}%` }}
                      title={`${trend.date}: ${trend.count} bookings`}
                    >
                      <span className="bar-value">{trend.count}</span>
                    </div>
                    <div className="chart-bar-label">{trend.date}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data">No trend data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============= REVENUE TAB =============
const RevenueTab = ({ revenueAnalytics, categoryRevenues, totalCategoryRevenue, formatCurrency }) => {
  const monthlyRevenue = revenueAnalytics.monthlyRevenue || [];
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value || 0), 1);

  return (
    <div className="tab-content">
      <h2 className="tab-title">Revenue Analytics</h2>
      
      {/* Revenue Metrics */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Revenue</h2>
            <div>
              <span className="stat-value">{formatCurrency(revenueAnalytics.totalRevenue)}</span>
              <span className="stat-label">All-time revenue</span>
            </div>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>This Month</h2>
            <div>
              <span className="stat-value">{formatCurrency(revenueAnalytics.revenueThisMonth)}</span>
              <span className="stat-label">Current month revenue</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Platform Commission</h2>
            <div>
              <span className="stat-value">{formatCurrency(revenueAnalytics.platformCommission)}</span>
              <span className="stat-label">{(revenueAnalytics.commissionPercentage || 0).toFixed(1)}% commission rate</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Vendor Payout</h2>
            <div>
              <span className="stat-value">{formatCurrency(revenueAnalytics.vendorPayout)}</span>
              <span className="stat-label">Total vendor earnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Timeline */}
      <div className="analytics-card">
        <h3>Revenue Timeline</h3>
        <div className="revenue-timeline">
          <div className="timeline-item today">
            <div className="timeline-icon"></div>
            <div className="timeline-label">Today</div>
            <div className="timeline-value">{formatCurrency(revenueAnalytics.revenueToday)}</div>
          </div>
          <div className="timeline-item week">
            <div className="timeline-icon"></div>
            <div className="timeline-label">This Week</div>
            <div className="timeline-value">{formatCurrency(revenueAnalytics.revenueThisWeek)}</div>
          </div>
          <div className="timeline-item month">
            <div className="timeline-icon"></div>
            <div className="timeline-label">This Month</div>
            <div className="timeline-value">{formatCurrency(revenueAnalytics.revenueThisMonth)}</div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="analytics-card">
        <h3>Monthly Revenue Trend (Last 12 Months)</h3>
        <div className="revenue-chart-container">
          {monthlyRevenue.length > 0 ? (
            <div className="revenue-bars">
              {monthlyRevenue.map((month, index) => {
                const height = ((month.value || 0) / maxRevenue) * 100;
                
                return (
                  <div key={index} className="revenue-bar-item">
                    <div 
                      className="revenue-bar-fill" 
                      style={{ height: `${height}%` }}
                      title={`${month.date}: ${formatCurrency(month.value)}`}
                    >
                      <span className="revenue-bar-value">{formatCurrency(month.value)}</span>
                    </div>
                    <div className="revenue-bar-label">{month.date}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data">No monthly data available</div>
          )}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="analytics-card">
        <h3>Revenue Distribution by Category</h3>
        <div className="category-revenue-chart">
          {categoryRevenues.map((cat, index) => {
            const percentage = ((cat.revenue / totalCategoryRevenue) * 100).toFixed(1);
            const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0', '#a8edea', '#fed6e3'];
            const color = colors[index % colors.length];
            
            return (
              <div key={cat.category} className="category-revenue-row">
                <div className="category-revenue-info">
                  <div className="category-revenue-name">
                    <span className="category-dot" style={{ background: color }}></span>
                    {cat.category}
                  </div>
                  <div className="category-revenue-bookings">{cat.bookings} bookings</div>
                </div>
                <div className="category-revenue-bar-wrapper">
                  <div 
                    className="category-revenue-bar" 
                    style={{ width: `${percentage}%`, background: color }}
                  >
                    <span className="category-revenue-amount">{formatCurrency(cat.revenue)}</span>
                  </div>
                </div>
                <div className="category-revenue-percent">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commission vs Payout */}
      <div className="analytics-card">
        <h3>Revenue Distribution</h3>
        <div className="revenue-distribution">
          <div className="distribution-item commission">
            <div className="distribution-bar" style={{ 
              width: `${(revenueAnalytics.commissionPercentage || 0)}%`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <span className="distribution-label">Platform Commission</span>
              <span className="distribution-value">{formatCurrency(revenueAnalytics.platformCommission)}</span>
            </div>
          </div>
          <div className="distribution-item payout">
            <div className="distribution-bar" style={{ 
              width: `${100 - (revenueAnalytics.commissionPercentage || 0)}%`,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}>
              <span className="distribution-label">Vendor Payout</span>
              <span className="distribution-value">{formatCurrency(revenueAnalytics.vendorPayout)}</span>
            </div>
          </div>
        </div>
        <div className="distribution-summary">
          Platform takes {(revenueAnalytics.commissionPercentage || 0).toFixed(1)}% commission, 
          vendors receive {(100 - (revenueAnalytics.commissionPercentage || 0)).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
