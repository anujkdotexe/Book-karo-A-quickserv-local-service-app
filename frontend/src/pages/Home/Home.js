import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin and vendor to their dashboards immediately
    if (isAuthenticated && user?.role) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'VENDOR') {
        navigate('/vendor/dashboard', { replace: true });
      }
      // USER role stays on home page
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render home page if user is admin or vendor (they'll be redirected)
  if (isAuthenticated && user?.role && (user.role === 'ADMIN' || user.role === 'VENDOR')) {
    return <div className="loading-spinner">Redirecting...</div>;
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
              Your trusted marketplace for professional services.
              Connect with skilled providers and book instantly.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/services" className="btn btn-hero-primary">
                  Browse Services
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-hero-primary">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-hero-secondary">
                    Sign In
                  </Link>
                </>
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
                <span className="icon-search"></span>
              </div>
              <h3>Easy Search</h3>
              <p>Find services by type and location with our powerful search</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <span className="icon-star"></span>
              </div>
              <h3>Verified Reviews</h3>
              <p>Read authentic reviews from real customers</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <span className="icon-calendar"></span>
              </div>
              <h3>Instant Booking</h3>
              <p>Book services instantly with flexible scheduling</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon-box">
                <span className="icon-lock"></span>
              </div>
              <h3>Secure Platform</h3>
              <p>Your data and payments are always protected</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers on BOOK-KARO today!</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-hero-primary">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
