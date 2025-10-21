import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/vendorAPI';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getDashboard();
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
      <div className="vendor-dashboard">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-dashboard">
        <div className="error-card">
          <p>{error}</p>
          <button onClick={loadDashboard} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <p>Manage your services and bookings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bookings">Bookings</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats?.totalBookings || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">Pending</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{stats?.pendingBookings || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon confirmed">Confirmed</div>
          <div className="stat-content">
            <h3>Confirmed</h3>
            <p className="stat-value">{stats?.confirmedBookings || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">Completed</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{stats?.completedBookings || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon services">Services</div>
          <div className="stat-content">
            <h3>Total Services</h3>
            <p className="stat-value">{stats?.totalServices || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">Active</div>
          <div className="stat-content">
            <h3>Active Services</h3>
            <p className="stat-value">{stats?.activeServices || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">Revenue</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">Rs.{stats?.totalRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon monthly">Monthly</div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-value">Rs.{stats?.monthlyRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">Rating</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-value">{stats?.averageRating?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon reviews">Reviews</div>
          <div className="stat-content">
            <h3>Total Reviews</h3>
            <p className="stat-value">{stats?.totalReviews || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>Recent Bookings</h2>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="bookings-list">
              {stats.recentBookings.map(booking => (
                <div key={booking.bookingId} className="booking-item">
                  <div className="booking-info">
                    <h4>{booking.customerName}</h4>
                    <p>{booking.serviceName}</p>
                    <p className="booking-date">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`booking-status status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </div>
                  <div className="booking-amount">
                    Rs.{booking.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent bookings</p>
          )}
        </div>

        <div className="section">
          <h2>Top Performing Services</h2>
          {stats?.topServices && stats.topServices.length > 0 ? (
            <div className="services-list">
              {stats.topServices.map(service => (
                <div key={service.serviceId} className="service-item">
                  <div className="service-info">
                    <h4>{service.serviceName}</h4>
                    <div className="service-metrics">
                      <span>Bookings: {service.bookingCount}</span>
                      <span>Revenue: Rs.{service.revenue.toLocaleString()}</span>
                      <span>Rating: {service.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No service data available</p>
          )}
        </div>
      </div>

      {stats?.revenueData && (
        <div className="section">
          <h2>Weekly Revenue</h2>
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
  );
};

export default VendorDashboard;
