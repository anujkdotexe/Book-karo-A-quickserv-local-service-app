import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ContentManagement.css';

const ContentManagement = () => {
  const navigate = useNavigate();

  const contentItems = [
    {
      title: 'Functionality Management',
      description: 'Configure contact info and service fees',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m5.2-15.8l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m20.8-5.2l-4.2 4.2m-2 2l-4.2 4.2"></path>
        </svg>
      ),
      path: '/admin/functionality-management',
      color: 'primary'
    },
    {
      title: 'Announcements',
      description: 'Manage system announcements and notifications',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l18-5v12L3 14v-3z"></path>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
        </svg>
      ),
      path: '/admin/announcements',
      color: 'primary'
    },
    {
      title: 'Ads Management',
      description: 'Manage promotional banners and advertisements',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
      path: '/admin/banners',
      color: 'success'
    },
    {
      title: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      path: '/admin/faqs',
      color: 'warning'
    },
    {
      title: 'Coupons',
      description: 'Create and manage discount coupons',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
      path: '/admin/coupons',
      color: 'info'
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and audit trail',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      path: '/admin/audit-logs',
      color: 'danger'
    }
  ];

  return (
    <div className="content-management">
      <div className="content-header">
        <h1>Content Management</h1>
        <p>Manage platform content, announcements, and promotional materials</p>
      </div>

      <div className="content-stats-grid">
        {contentItems.map((item, index) => (
          <div 
            key={index} 
            className={`content-stat-card ${item.color} clickable`}
            onClick={() => navigate(item.path)}
          >
            <div className="stat-icon">
              {item.icon}
            </div>
            <div className="stat-content">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;
