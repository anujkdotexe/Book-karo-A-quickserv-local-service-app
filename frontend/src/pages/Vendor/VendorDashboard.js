import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../../services/vendorAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import './VendorDashboard.css';

const VendorDashboard = () => {
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
    return <LoadingSpinner message="Loading dashboard..." size="thick" fullScreen />;
  }

  if (error) {
    return (
      <ErrorModal
        title="Failed to Load Dashboard"
        message={error}
        onRefresh={loadDashboard}
        onClose={() => setError(null)}
      />
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <p>Manage your services and bookings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/vendor/bookings')}>
          <div className="stat-icon bookings">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Bookings</h2>
            <div>
              <span className="stat-value">{stats?.totalBookings || 0}</span>
              <span className="stat-label">All Time</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/bookings', { state: { filter: 'PENDING' } })}>
          <div className="stat-icon pending">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Pending</h2>
            <div>
              <span className="stat-value">{stats?.pendingBookings || 0}</span>
              <span className="stat-label">Awaiting Response</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/bookings', { state: { filter: 'CONFIRMED' } })}>
          <div className="stat-icon confirmed">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Confirmed</h2>
            <div>
              <span className="stat-value">{stats?.confirmedBookings || 0}</span>
              <span className="stat-label">Active Orders</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/bookings', { state: { filter: 'COMPLETED' } })}>
          <div className="stat-icon completed">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Completed</h2>
            <div>
              <span className="stat-value">{stats?.completedBookings || 0}</span>
              <span className="stat-label">Finished Jobs</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/services')}>
          <div className="stat-icon services">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Services</h2>
            <div>
              <span className="stat-value">{stats?.totalServices || 0}</span>
              <span className="stat-label">Service Offerings</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/services')}>
          <div className="stat-icon active">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Active Services</h2>
            <div>
              <span className="stat-value">{stats?.activeServices || 0}</span>
              <span className="stat-label">Currently Available</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Revenue</h2>
            <div>
              <span className="stat-value">Rs.{stats?.totalRevenue?.toLocaleString() || 0}</span>
              <span className="stat-label">Lifetime Earnings</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon monthly">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Monthly Revenue</h2>
            <div>
              <span className="stat-value">Rs.{stats?.monthlyRevenue?.toLocaleString() || 0}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Average Rating</h2>
            <div>
              <span className="stat-value">{stats?.averageRating?.toFixed(1) || 'N/A'}</span>
              <span className="stat-label">Customer Feedback</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/availability')}>
          <div className="stat-icon availability">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Availability</h2>
            <div>
              <span className="stat-value">{stats?.availabilitySlots || 0}</span>
              <span className="stat-label">Weekly Time Slots</span>
            </div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/vendor/reviews')}>
          <div className="stat-icon reviews">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Total Reviews</h2>
            <div>
              <span className="stat-value">{stats?.totalReviews || 0}</span>
              <span className="stat-label">Customer Reviews</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h2>Response Time</h2>
            <div>
              <span className="stat-value">{stats?.avgResponseTime || '2.5h'}</span>
              <span className="stat-label">Average Response</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <button 
              onClick={() => navigate('/vendor/bookings')} 
              className="view-all-btn"
            >
              View All →
            </button>
          </div>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="bookings-list">
              {stats.recentBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="booking-item clickable-row"
                  onClick={() => navigate('/vendor/bookings')}
                >
                  <div className="booking-info">
                    <h4>{booking.customerName}</h4>
                    <p>{booking.serviceName}</p>
                    <p className="booking-date">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`booking-status status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </div>
                  <div className="booking-amount">
                    Rs.{booking.price?.toLocaleString() || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent bookings</p>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Top Performing Services</h2>
            <button 
              onClick={() => navigate('/vendor/services')} 
              className="view-all-btn"
            >
              View All →
            </button>
          </div>
          {stats?.topServices && stats.topServices.length > 0 ? (
            <div className="services-list">
              {stats.topServices.map(service => (
                <div 
                  key={service.serviceId} 
                  className="service-item clickable-row"
                  onClick={() => navigate('/vendor/services')}
                >
                  <div className="service-info">
                    <h4>{service.serviceName}</h4>
                    <div className="service-metrics">
                      <span>Bookings: {service.bookingCount || 0}</span>
                      <span>Revenue: Rs.{service.revenue?.toLocaleString() || 0}</span>
                      <span>Rating: {service.averageRating?.toFixed(1) || 'N/A'}</span>
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

      {stats?.weeklyRevenue && stats.weeklyRevenue.length > 0 && (
        <div className="section">
          <h2>Weekly Revenue</h2>
          <div className="revenue-chart">
            {stats.weeklyRevenue.map(data => {
              const maxAmount = Math.max(...stats.weeklyRevenue.map(d => d.amount), 1); // Prevent division by zero
              const heightPercent = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
              return (
                <div key={data.date} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ height: `${heightPercent}%` }}
                  >
                    <span className="bar-value">Rs.{data.amount || 0}</span>
                  </div>
                  <span className="bar-label">{new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
