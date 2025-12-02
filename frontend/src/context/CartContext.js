import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Don't clear cart on logout - user may logout accidentally
  // Cart persists in localStorage for better UX
  // useEffect(() => {
  //   const handleLogout = () => {
  //     setCartItems([]);
  //     localStorage.removeItem('cart');
  //   };
  //
  //   window.addEventListener('user-logout', handleLogout);
  //   return () => window.removeEventListener('user-logout', handleLogout);
  // }, []);

  // Load cart from backend on mount (if authenticated)
  useEffect(() => {
    if (token) {
      loadCartFromBackend();
    } else {
      // If not authenticated, load from localStorage
      loadCartFromLocalStorage();
    }
  }, [token]);

  const loadCartFromBackend = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCartItems();
      setCartItems(response.data.data || []);
    } catch (error) {
      // If backend fails, fallback to localStorage
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        localStorage.removeItem('cart');
      }
    }
  };

  // Save cart to localStorage whenever it changes (fallback)
  useEffect(() => {
    if (!token && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else if (!token) {
      localStorage.removeItem('cart');
    }
  }, [cartItems, token]);

  const addToCart = async (service, userCity = null) => {
    // Validate service city matches user city
    if (userCity && service.city && userCity.toLowerCase() !== service.city.toLowerCase()) {
      return {
        success: false,
        message: `Service is in ${service.city}, but you are in ${userCity}. Cross-city bookings may not be serviceable.`,
        citySuggestion: `Consider searching for services in ${userCity}`
      };
    }

    if (token) {
      // Use backend API
      try {
        const response = await cartAPI.addToCart(service.id, 1);
        
        console.log('Add to cart response:', response.data);
        
        // Check if the backend returned success
        if (response.data && response.data.success === true) {
          // Refresh cart after successful addition
          try {
            await loadCartFromBackend();
          } catch (loadError) {
            // If refresh fails, still count as success since item was added
            console.warn('Cart refresh failed, but item was added:', loadError);
          }
          return { success: true, message: response.data.message || 'Item added to cart' };
        } else {
          console.error('Backend returned non-success:', response.data);
          return { success: false, message: response.data?.message || 'Failed to add to cart' };
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
      }
    } else {
      // Use localStorage (guest user)
      const existingItem = cartItems.find(item => item.id === service.id || item.serviceId === service.id);
      
      if (existingItem) {
        return { success: false, message: 'Service already in cart' };
      }

      const cartItem = {
        id: service.id, // For localStorage cart identification
        serviceId: service.id, // For backend booking creation
        serviceName: service.serviceName || service.name, // Handle both property names
        name: service.serviceName || service.name, // Alias for compatibility
        category: service.category,
        price: service.price,
        city: service.city, // Store city for validation
        state: service.state,
        quantity: 1,
        subtotal: service.price
      };

      setCartItems(prevItems => [...prevItems, cartItem]);
      return { success: true, message: 'Service added to cart' };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (token) {
      // Use backend API
      try {
        await cartAPI.removeFromCart(cartItemId);
        await loadCartFromBackend(); // Refresh cart
      } catch (error) {
        console.error('Failed to remove from cart');
      }
    } else {
      // Use localStorage
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    }
  };

  const clearCart = async () => {
    if (token) {
      // Use backend API
      try {
        await cartAPI.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error('Failed to clear cart');
      }
    } else {
      // Use localStorage
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const isInCart = (serviceId) => {
    // Check using id property (standardized)
    return cartItems.some(item => item.id === serviceId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    getCartTotal,
    getCartCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
