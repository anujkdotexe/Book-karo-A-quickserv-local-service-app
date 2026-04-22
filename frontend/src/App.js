import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import AppRoutes from './components/AppRoutes/AppRoutes';
import NavigationServiceProvider from './components/NavigationServiceProvider/NavigationServiceProvider';

// Utils
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast/Toast';
import { ModalProvider } from './components/Modal/Modal';

/**
 * bookkaro Main Application Component
 * Refactored for better performance with lazy loading and route separation
 */
function App() {
  return (
    <ErrorBoundary>
      <ModalProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <NavigationServiceProvider>
                  <div className="app">
                    <Navbar />
                    <main className="main-content">
                      <AppRoutes />
                    </main>
                    <Footer />
                  </div>
                </NavigationServiceProvider>
              </Router>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ModalProvider>
    </ErrorBoundary>
  );
}

export default App;
