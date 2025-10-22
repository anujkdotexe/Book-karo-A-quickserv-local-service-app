import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
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
import Payment from './pages/Payment/Payment';
import RefundRequest from './pages/RefundRequest';
import AdminRefunds from './pages/AdminRefunds';

// Vendor Pages
import VendorDashboard from './pages/Vendor/VendorDashboard';
import VendorServices from './pages/Vendor/VendorServices';
import VendorBookings from './pages/Vendor/VendorBookings';
import VendorAnalytics from './pages/Vendor/VendorAnalytics';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminVendors from './pages/Admin/AdminVendors';
import AdminServices from './pages/Admin/AdminServices';
import AdminBookings from './pages/Admin/AdminBookings';

// Error Pages
import Forbidden from './pages/Forbidden/Forbidden';

// Utils
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast/Toast';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

/**
 * bookkaro Main Application Component
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
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Protected Routes */}
                <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/addresses" element={
                <ProtectedRoute>
                  <Addresses />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="/services/:id" element={
                <ProtectedRoute>
                  <ServiceDetail />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } />
              <Route path="/bookings/:id" element={
                <ProtectedRoute>
                  <BookingDetail />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/cart/checkout" element={
                <ProtectedRoute>
                  <CartCheckout />
                </ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
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
              <Route path="/vendor/analytics" element={
                <ProtectedRoute allowedRoles={['VENDOR']}>
                  <VendorAnalytics />
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
              <Route path="/admin/bookings" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookings />
                </ProtectedRoute>
              } />
              <Route path="/admin/refunds" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminRefunds />
                </ProtectedRoute>
              } />

              {/* Refund Routes */}
              <Route path="/refunds/request/:bookingId" element={
                <ProtectedRoute>
                  <RefundRequest />
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
