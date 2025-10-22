import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and role requirements
 * 
 * @param {ReactNode} children - Child components to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication state
  if (loading) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
