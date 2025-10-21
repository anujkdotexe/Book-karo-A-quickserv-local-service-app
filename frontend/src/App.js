import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Services from './pages/Services/Services';
import ServiceDetail from './pages/Services/ServiceDetail';
import Bookings from './pages/Bookings/Bookings';
import BookingDetail from './pages/Bookings/BookingDetail';
import Addresses from './pages/Addresses/Addresses';
import Favorites from './pages/Favorites/Favorites';
import FAQ from './pages/Support/FAQ';
import HelpCenter from './pages/Support/HelpCenter';
import Contact from './pages/Support/Contact';
import TermsOfService from './pages/Support/TermsOfService';
import PrivacyPolicy from './pages/Support/PrivacyPolicy';
import Cart from './pages/Cart/Cart';
import CartCheckout from './pages/Cart/CartCheckout';

// Vendor Pages
import VendorDashboard from './pages/Vendor/VendorDashboard';
import VendorServices from './pages/Vendor/VendorServices';
import VendorBookings from './pages/Vendor/VendorBookings';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminVendors from './pages/Admin/AdminVendors';
import AdminServices from './pages/Admin/AdminServices';

// Error Pages
import Forbidden from './pages/Forbidden/Forbidden';

// Utils
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast/Toast';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

/**
 * Bookaro Main Application Component
 * Phase 1: User Module (Customer Side)
 */
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Protected Routes */}
                <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/addresses" element={
                <PrivateRoute>
                  <Addresses />
                </PrivateRoute>
              } />
              <Route path="/favorites" element={
                <PrivateRoute>
                  <Favorites />
                </PrivateRoute>
              } />
              <Route path="/services" element={
                <PrivateRoute>
                  <Services />
                </PrivateRoute>
              } />
              <Route path="/services/:id" element={
                <PrivateRoute>
                  <ServiceDetail />
                </PrivateRoute>
              } />
              <Route path="/bookings" element={
                <PrivateRoute>
                  <Bookings />
                </PrivateRoute>
              } />
              <Route path="/bookings/:id" element={
                <PrivateRoute>
                  <BookingDetail />
                </PrivateRoute>
              } />
              <Route path="/cart" element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              } />
              <Route path="/cart/checkout" element={
                <PrivateRoute>
                  <CartCheckout />
                </PrivateRoute>
              } />

              {/* Vendor Routes (VENDOR role only) */}
              <Route path="/vendor/dashboard" element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/vendor/services" element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorServices />
                </ProtectedRoute>
              } />
              <Route path="/vendor/bookings" element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorBookings />
                </ProtectedRoute>
              } />

              {/* Admin Routes (ADMIN role only) */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/vendors" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminVendors />
                </ProtectedRoute>
              } />
              <Route path="/admin/services" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminServices />
                </ProtectedRoute>
              } />

              {/* Error Pages */}
              <Route path="/403" element={<Forbidden />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
