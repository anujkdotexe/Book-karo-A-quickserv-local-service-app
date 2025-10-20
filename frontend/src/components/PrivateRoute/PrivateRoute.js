import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast/Toast';
import './PrivateRoute.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to access this page');
    }
  }, [loading, isAuthenticated, toast]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;

