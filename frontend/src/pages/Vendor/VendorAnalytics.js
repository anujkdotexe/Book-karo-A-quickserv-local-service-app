import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VendorDashboard.css';
import './VendorAnalytics.css';

const VendorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8081/api/v1/analytics/vendor?days=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-dashboard">
        <div className="container">
          <div className="error-message-card" role="alert">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Unable to Load Analytics</h3>
            <p>{error}</p>
            <button onClick={fetchAnalytics} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Analytics Dashboard</h1>
          <p>Track your performance and revenue</p>
        </div>

        <div className="analytics-date-range">
          <button 
            className={`range-btn ${dateRange === 7 ? 'active' : ''}`}
            onClick={() => setDateRange(7)}
          >
            Last 7 Days
          </button>
          <button 
            className={`range-btn ${dateRange === 30 ? 'active' : ''}`}
            onClick={() => setDateRange(30)}
          >
            Last 30 Days
          </button>
          <button 
            className={`range-btn ${dateRange === 90 ? 'active' : ''}`}
            onClick={() => setDateRange(90)}
          >
            Last 90 Days
          </button>
        </div>

        <div className="analytics-cards-grid">
          <div className="analytics-card">
            <div className="card-icon revenue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3>Total Revenue</h3>
              <p className="card-value">{formatCurrency(analytics?.totalRevenue || 0)}</p>
              <p className="card-subtitle">From {analytics?.completedBookings || 0} completed bookings</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon bookings">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="card-content">
              <h3>Total Bookings</h3>
              <p className="card-value">{analytics?.totalBookings || 0}</p>
              <p className="card-subtitle">
                {analytics?.pendingBookings || 0} pending, {analytics?.cancelledBookings || 0} cancelled
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon rating">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="card-content">
              <h3>Average Rating</h3>
              <p className="card-value">{analytics?.averageServiceRating?.toFixed(1) || '0.0'}</p>
              <p className="card-subtitle">From {analytics?.totalReviews || 0} reviews</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon completion">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="card-content">
              <h3>Completion Rate</h3>
              <p className="card-value">{analytics?.completionRate || 0}%</p>
              <p className="card-subtitle">Avg order: {formatCurrency(analytics?.averageOrderValue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="analytics-sections">
          {/* Top Services Table */}
          <div className="analytics-section">
            <h2>Top Performing Services</h2>
            {analytics?.topServices && analytics.topServices.length > 0 ? (
              <div className="table-responsive">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topServices.map((service, index) => (
                      <tr key={index}>
                        <td>{service.serviceName}</td>
                        <td>{service.bookingCount}</td>
                        <td>{formatCurrency(service.revenue)}</td>
                        <td>
                          <span className="rating-badge">
                            ⭐ {service.averageRating?.toFixed(1) || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No service data available for this period</p>
            )}
          </div>

          {/* Category Stats */}
          <div className="analytics-section">
            <h2>Category Breakdown</h2>
            {analytics?.categoryStats && analytics.categoryStats.length > 0 ? (
              <div className="category-grid">
                {analytics.categoryStats.map((category, index) => (
                  <div key={index} className="category-card">
                    <h3>{category.category}</h3>
                    <div className="category-stats">
                      <div className="stat">
                        <span className="stat-label">Services</span>
                        <span className="stat-value">{category.serviceCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Bookings</span>
                        <span className="stat-value">{category.bookingCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{formatCurrency(category.revenue)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">⭐ {category.averageRating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No category data available</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="analytics-section">
            <h2>Recent Activity</h2>
            {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
              <div className="activity-list">
                {analytics.recentActivities.slice(0, 10).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="activity-details">
                      <p className="activity-description">{activity.description}</p>
                      <p className="activity-time">{activity.timestamp}</p>
                    </div>
                    <span className={`activity-status status-${activity.status?.toLowerCase()}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
