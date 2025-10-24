import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ customItems }) => {
  const location = useLocation();

  // If custom items provided, use them
  if (customItems && customItems.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className="breadcrumb-nav">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </Link>
          </li>
          {customItems.map((item, index) => (
            <li key={index} className="breadcrumb-item" aria-current={index === customItems.length - 1 ? 'page' : undefined}>
              {item.path && index < customItems.length - 1 ? (
                <Link to={item.path}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  // Auto-generate breadcrumbs from URL path
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null;

  const breadcrumbNameMap = {
    'services': 'Services',
    'bookings': 'My Bookings',
    'cart': 'Cart',
    'favorites': 'Favorites',
    'profile': 'Profile',
    'payment': 'Payment',
    'admin': 'Admin',
    'vendor': 'Vendor',
    'dashboard': 'Dashboard',
    'login': 'Login',
    'register': 'Sign Up',
  };

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

          return (
            <li key={routeTo} className="breadcrumb-item" aria-current={isLast ? 'page' : undefined}>
              {isLast ? (
                <span>{displayName}</span>
              ) : (
                <Link to={routeTo}>{displayName}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
