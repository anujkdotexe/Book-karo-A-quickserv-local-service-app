import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import './AdminDashboard.css';

const AdminDashboard = () => {
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
    return <div className="admin-dashboard"><div className="loading-spinner">Loading dashboard...</div></div>;
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

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Total Vendors</h3>
            <p className="stat-value">{stats?.totalVendors || 0}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🛠️</div>
          <div className="stat-content">
            <h3>Total Services</h3>
            <p className="stat-value">{stats?.totalServices || 0}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats?.totalBookings || 0}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Pending Vendor Approvals</h3>
            <p className="stat-value">{stats?.pendingVendorApprovals || 0}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Service Approvals</h3>
            <p className="stat-value">{stats?.pendingServiceApprovals || 0}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Platform Revenue</h3>
            <p className="stat-value">Rs.{stats?.platformRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-value">Rs.{stats?.monthlyRevenue?.toLocaleString() || 0}</p>
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

        {stats?.vendorStats && (
          <div className="section">
            <h2>Vendor Statistics</h2>
            <div className="stats-list">
              <div className="stat-item">
                <span>Active Vendors</span>
                <strong>{stats.vendorStats.activeVendors}</strong>
              </div>
              <div className="stat-item">
                <span>Pending Approvals</span>
                <strong>{stats.vendorStats.pendingVendors}</strong>
              </div>
              <div className="stat-item">
                <span>Top Vendors (Revenue)</span>
                <div className="vendor-list">
                  {stats.vendorStats.topVendors?.map(vendor => (
                    <div key={vendor.id} className="vendor-item">
                      {vendor.name} - Rs.{vendor.revenue.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {stats?.serviceStats && (
          <div className="section">
            <h2>Service Statistics</h2>
            <div className="stats-list">
              <div className="stat-item">
                <span>Active Services</span>
                <strong>{stats.serviceStats.activeServices}</strong>
              </div>
              <div className="stat-item">
                <span>Pending Approvals</span>
                <strong>{stats.serviceStats.pendingServices}</strong>
              </div>
              <div className="stat-item">
                <span>Most Popular Category</span>
                <strong>{stats.serviceStats.popularCategory}</strong>
              </div>
            </div>
          </div>
        )}

        {stats?.revenueData && (
          <div className="section full-width">
            <h2>Revenue Trend (Last 7 Days)</h2>
            <div className="revenue-chart">
              {stats.revenueData.map(data => (
                <div key={data.date} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ height: `${(data.amount / Math.max(...stats.revenueData.map(d => d.amount))) * 100}%` }}
                  >
                    <span className="bar-value">Rs.{data.amount}</span>
                  </div>
                  <span className="bar-label">{new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
