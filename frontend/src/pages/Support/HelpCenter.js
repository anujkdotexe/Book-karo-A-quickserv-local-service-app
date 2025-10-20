import React from 'react';
import { Link } from 'react-router-dom';
import './Support.css';

const HelpCenter = () => {
  const helpTopics = [
    {
      title: 'Getting Started',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      ),
      description: 'Learn how to create an account, browse services, and make your first booking',
      links: [
        { text: 'Creating an Account', anchor: 'create-account' },
        { text: 'Browsing Services', anchor: 'browse-services' },
        { text: 'Making a Booking', anchor: 'make-booking' }
      ]
    },
    {
      title: 'Managing Bookings',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      description: 'Track, modify, and cancel your service bookings',
      links: [
        { text: 'Viewing Bookings', anchor: 'view-bookings' },
        { text: 'Cancelling a Booking', anchor: 'cancel-booking' },
        { text: 'Rescheduling Services', anchor: 'reschedule' }
      ]
    },
    {
      title: 'Account & Profile',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      description: 'Update personal information, manage addresses, and account settings',
      links: [
        { text: 'Updating Profile', anchor: 'update-profile' },
        { text: 'Managing Addresses', anchor: 'manage-addresses' },
        { text: 'Password Reset', anchor: 'password-reset' }
      ]
    },
    {
      title: 'Payments & Pricing',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      description: 'Understand pricing, payment methods, and billing',
      links: [
        { text: 'Payment Methods', anchor: 'payment-methods' },
        { text: 'Understanding Pricing', anchor: 'pricing' },
        { text: 'Refund Policy', anchor: 'refunds' }
      ]
    },
    {
      title: 'Service Providers',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      description: 'Information about our vetted service providers and quality standards',
      links: [
        { text: 'Provider Verification', anchor: 'verification' },
        { text: 'Rating & Reviews', anchor: 'reviews' },
        { text: 'Service Quality', anchor: 'quality' }
      ]
    },
    {
      title: 'Safety & Security',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      description: 'Learn about our safety measures and data protection policies',
      links: [
        { text: 'Data Privacy', anchor: 'privacy' },
        { text: 'Safety Guidelines', anchor: 'safety' },
        { text: 'Reporting Issues', anchor: 'report' }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Browse Services',
      description: 'Explore available services in your area',
      link: '/services',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      )
    },
    {
      title: 'My Bookings',
      description: 'View and manage your bookings',
      link: '/bookings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      title: 'Contact Support',
      description: 'Get in touch with our team',
      link: '/contact',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="support-page">
      <div className="container">
        <div className="support-container fade-in">
          <div className="support-header">
            <h1>Help Center</h1>
            <p>Find guides, tutorials, and answers to common questions</p>
          </div>

          <div className="help-search">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="help-search-input"
            />
            <button className="help-search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          <div className="help-topics">
            {helpTopics.map((topic, index) => (
              <div key={index} className="help-topic-card">
                <div className="help-topic-icon">{topic.icon}</div>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <ul className="help-links">
                  {topic.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={`#${link.anchor}`}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link} className="quick-action-card">
                  <div className="quick-action-icon">{action.icon}</div>
                  <div className="quick-action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="help-footer">
            <h3>Still need help?</h3>
            <p>Can't find what you're looking for? Our support team is here to help!</p>
            <div className="help-footer-actions">
              <Link to="/faq" className="btn btn-outline">View FAQs</Link>
              <Link to="/contact" className="btn btn-primary">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
