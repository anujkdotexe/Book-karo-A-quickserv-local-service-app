import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboard();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <LoadingSpinner message="Loading dashboard..." size="thick" fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-card">
          <p>{error}</p>
          <button onClick={loadDashboard} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Platform Management & Analytics</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="stats-grid">
        <div className="stat-card primary clickable" onClick={() => navigate('/admin/users')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Users Registered</h2>
            <div>
              <span className="stat-value">{stats?.totalUsers || 0}</span>
              <span className="stat-label">Platform Users</span>
            </div>
          </div>
        </div>

        <div className="stat-card success clickable" onClick={() => navigate('/admin/vendors')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Vendors Count</h2>
            <div>
              <span className="stat-value">{stats?.totalVendors || 0}</span>
              <span className="stat-label">Service Providers</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning clickable" onClick={() => navigate('/admin/services')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Services Available</h2>
            <div>
              <span className="stat-value">{stats?.totalServices || 0}</span>
              <span className="stat-label">Active Listings</span>
            </div>
          </div>
        </div>

        <div className="stat-card info clickable" onClick={() => navigate('/admin/bookings')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Bookings Received</h2>
            <div>
              <span className="stat-value">{stats?.totalBookings || 0}</span>
              <span className="stat-label">All Time</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger clickable" onClick={() => navigate('/admin/vendors', { state: { filter: 'PENDING' } })}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Pending Vendor Approvals</h2>
            <div>
              <span className="stat-value">{stats?.pendingVendorApprovals || 0}</span>
              <span className="stat-label">Requires Action</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger clickable" onClick={() => navigate('/admin/services', { state: { filter: 'PENDING' } })}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Pending Service Approvals</h2>
            <div>
              <span className="stat-value">{stats?.pendingServiceApprovals || 0}</span>
              <span className="stat-label">Awaiting Review</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Platform Revenue Earned</h2>
            <div>
              <span className="stat-value">Rs.{stats?.platformRevenue?.toLocaleString() || 0}</span>
              <span className="stat-label">Total Earnings</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Monthly Revenue Status</h2>
            <div>
              <span className="stat-value">Rs.{stats?.monthlyRevenue?.toLocaleString() || 0}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
        </div>

        <div className="stat-card purple clickable" onClick={() => navigate('/admin/coupons')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Coupons Offers</h2>
            <div>
              <span className="stat-value">{stats?.totalCoupons || 0}</span>
              <span className="stat-label">Active Offers</span>
            </div>
          </div>
        </div>

        <div className="stat-card success clickable" onClick={() => navigate('/admin/payments')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Successful Payments</h2>
            <div>
              <span className="stat-value">{stats?.successfulPayments || 0}</span>
              <span className="stat-label">Completed Transactions</span>
            </div>
          </div>
        </div>

        <div className="stat-card danger clickable" onClick={() => navigate('/admin/payments')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Failed Payments</h2>
            <div>
              <span className="stat-value">{stats?.failedPayments || 0}</span>
              <span className="stat-label">Requires Attention</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning clickable" onClick={() => navigate('/admin/refunds')}>
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Pending Refunds</h2>
            <div>
              <span className="stat-value">{stats?.pendingRefunds || 0}</span>
              <span className="stat-label">Awaiting Processing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        {stats?.userStats && (
          <div className="section">
            <h2>User Statistics</h2>
            <div className="stats-list">
              <div className="stat-item">
                <span>Active Users</span>
                <strong>{stats.userStats.activeUsers}</strong>
              </div>
              <div className="stat-item">
                <span>New Users (This Month)</span>
                <strong>{stats.userStats.newUsersThisMonth}</strong>
              </div>
              <div className="stat-item">
                <span>Top Users (Most Bookings)</span>
                <div className="user-list">
                  {stats.userStats.topUsers?.map(user => (
                    <div key={user.id} className="user-item">
                      {user.name} - {user.bookingCount} bookings
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {stats?.topVendors && stats.topVendors.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2>Top Vendors (Revenue)</h2>
              <button 
                onClick={() => navigate('/admin/analytics')} 
                className="view-all-btn"
              >
                View Analytics →
              </button>
            </div>
            <div className="vendor-list">
              {stats.topVendors.map(vendor => (
                <div 
                  key={vendor.vendorId} 
                  className="vendor-item clickable-row"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <div className="vendor-info">
                    <h4>{vendor.businessName}</h4>
                    <div className="vendor-metrics">
                      <span>Bookings: {vendor.totalBookings || 0}</span>
                      <span>Revenue: Rs.{vendor.totalRevenue?.toLocaleString() || 0}</span>
                      <span>Rating: {vendor.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.topServices && stats.topServices.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2>Top Services (Revenue)</h2>
              <button 
                onClick={() => navigate('/admin/analytics')} 
                className="view-all-btn"
              >
                View Analytics →
              </button>
            </div>
            <div className="services-list">
              {stats.topServices.map(service => (
                <div 
                  key={service.serviceId} 
                  className="service-item clickable-row"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <div className="service-info">
                    <h4>{service.serviceName}</h4>
                    <p className="vendor-name">{service.vendorName}</p>
                    <div className="service-metrics">
                      <span>Bookings: {service.bookingCount || 0}</span>
                      <span>Revenue: Rs.{service.revenue?.toLocaleString() || 0}</span>
                      <span>Rating: {service.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.revenueData && stats.revenueData.length > 0 && (
          <div className="section full-width">
            <h2>Revenue Trend (Last 7 Days)</h2>
            <div className="revenue-chart">
              {(() => {
                const maxRevenue = Math.max(...stats.revenueData.map(d => Number(d.revenue)), 1);
                return stats.revenueData.map(data => {
                  const heightPercent = maxRevenue > 0 ? (Number(data.revenue) / maxRevenue) * 100 : 0;
                  return (
                    <div key={data.date} className="chart-bar">
                      <div 
                        className="bar" 
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="bar-value">Rs.{Number(data.revenue) || 0}</span>
                      </div>
                      <span className="bar-label">{new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
