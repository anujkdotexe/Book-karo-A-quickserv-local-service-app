import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavbarProfileDropdown = ({
  user,
  userRole,
  isOpen,
  onToggle,
  onClose,
  onLogout
}) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const displayName = user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0]) || 'User';
  const displayInitial = (displayName[0] || 'U').toUpperCase();

  return (
    <div className="profile-dropdown" ref={menuRef}>
      <button
        type="button"
        className="profile-button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="User account menu"
      >
        <div className="user-avatar" aria-hidden="true">
          {displayInitial}
        </div>
        <span className="profile-name desktop-only">{displayName}</span>
        <svg className={`chevron-icon ${isOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="profile-menu" role="menu">
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-user-name">{displayName}</div>
              <div className="profile-user-email">{user?.email}</div>
            </div>
          </div>

          <div className="profile-menu-items">
            <Link to="/profile" className="profile-menu-item" onClick={onClose} role="menuitem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              My Profile
            </Link>

            {userRole === 'USER' && (
              <>
                <Link to="/bookings" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  My Bookings
                </Link>
                <Link to="/favorites" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  Saved Favorites
                </Link>
                <Link to="/addresses" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Delivery Addresses
                </Link>
              </>
            )}

            {userRole === 'VENDOR' && (
              <>
                <Link to="/vendor/dashboard" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Vendor Dashboard
                </Link>
                <Link to="/vendor/services" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  Manage Services
                </Link>
                <Link to="/vendor/bookings" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Vendor Bookings
                </Link>
              </>
            )}

            {userRole === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Admin Dashboard
                </Link>
                <Link to="/admin/users" className="profile-menu-item" onClick={onClose} role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  Platform Users
                </Link>
              </>
            )}

            <div className="profile-menu-divider" />
            <button
              type="button"
              className="profile-menu-item logout-button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarProfileDropdown;
