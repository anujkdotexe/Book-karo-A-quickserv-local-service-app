import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast/Toast';

const AuthContext = createContext();

// Helper to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (!payload.exp) return false; // No expiration set
    
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Treat as expired if we can't parse it
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        // Token expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Your session has expired. Please log in again.');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [toast]);

  // Listen for session expiration events
  useEffect(() => {
    const handleSessionExpired = (event) => {
      toast.error(event.detail.message);
      setUser(null);
      setToken(null);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [toast]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      const { token, id, email: userEmail, firstName, lastName, role, roles } = response.data.data;

      const userData = { 
        id, 
        email: userEmail, 
        firstName, 
        lastName, 
        role, // Primary role for backward compatibility
        roles: roles || [role] // All roles for multi-role support
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);

      return { success: true, userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, id, email, firstName, lastName, role, roles } = response.data.data;

      const user = { 
        id, 
        email, 
        firstName, 
        lastName, 
        role,
        roles: roles || [role]
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cart data - INTENTIONAL: Prevents cart items from one user being shown to another
    // This is a security measure to avoid data leakage between accounts
    localStorage.removeItem('cart');
    
    // Clear service filters (optional, but good for privacy)
    localStorage.removeItem('serviceFilters');
    localStorage.removeItem('serviceSort');
    
    // Dispatch custom event for other contexts to listen to
    window.dispatchEvent(new CustomEvent('user-logout'));
    
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
