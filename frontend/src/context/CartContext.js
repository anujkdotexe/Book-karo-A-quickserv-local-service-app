import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const addToCart = (service) => {
    // Check if service already exists in cart
    const existingItem = cartItems.find(item => item.id === service.id);
    
    if (existingItem) {
      return { success: false, message: 'Service already in cart' };
    }

    const cartItem = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      city: service.city,
      state: service.state,
      vendor: service.vendor,
      addedAt: new Date().toISOString()
    };

    setCartItems(prevItems => [...prevItems, cartItem]);
    return { success: true, message: 'Service added to cart' };
  };

  const removeFromCart = (serviceId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== serviceId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const isInCart = (serviceId) => {
    return cartItems.some(item => item.id === serviceId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0);
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
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
