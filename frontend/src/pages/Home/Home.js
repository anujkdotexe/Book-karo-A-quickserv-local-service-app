import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin and vendor to their respective dashboards
    if (isAuthenticated && user?.role) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'VENDOR') {
        navigate('/vendor/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user?.role && (user.role === 'ADMIN' || user.role === 'VENDOR')) {
    return <LoadingSpinner message="Redirecting..." fullScreen />;
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Book Services <span className="highlight">Easily</span>
            </h1>
            <p className="hero-subtitle">
              Your trusted marketplace for top-rated local services.
              Connect with verified providers, compare ratings, and book instantly.
            </p>
            <div className="hero-actions">
              <Link to="/services" className="btn-hero-primary">
                Browse All Services
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-hero-secondary">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn-hero-outline">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/bookings" className="btn-hero-secondary">
                  My Bookings
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose BOOK-KARO?</h2>
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3>Smart Search</h3>
              <p>Filter services by category, location, rating, and verified price ranges.</p>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3>Verified Reviews</h3>
              <p>Read authentic ratings and detailed feedback from verified customers.</p>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Instant Booking</h3>
              <p>Select your preferred slot, add your address, and confirm in seconds.</p>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>Secure Platform</h3>
              <p>Protected transactions, clear refund policies, and real-time status updates.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Book a Trusted Service?</h2>
            <p>Join thousands of satisfied customers on BOOK-KARO today.</p>
            {!isAuthenticated ? (
              <Link to="/register" className="btn-hero-primary">
                Create Free Account
              </Link>
            ) : (
              <Link to="/services" className="btn-hero-primary">
                Explore Services Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
