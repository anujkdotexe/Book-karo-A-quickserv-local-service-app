import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import './AppRoutes.css';

// Immediate load components (critical for app)
import Home from '../../pages/Home/Home';
import Login from '../../pages/Auth/Login';
import Register from '../../pages/Auth/Register';

// Lazy loaded components with code splitting
const ForgotPassword = lazy(() => import('../../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../../pages/Auth/ResetPassword'));
const Profile = lazy(() => import('../../pages/Profile/Profile'));
const Services = lazy(() => import('../../pages/Services/Services'));
const ServiceDetail = lazy(() => import('../../pages/Services/ServiceDetail'));
const CategoryBrowse = lazy(() => import('../../pages/Services/CategoryBrowse'));
const Bookings = lazy(() => import('../../pages/Bookings/Bookings'));
const BookingDetail = lazy(() => import('../../pages/Bookings/BookingDetail'));
const Addresses = lazy(() => import('../../pages/Addresses/Addresses'));
const Favorites = lazy(() => import('../../pages/Favorites/Favorites'));
const NotificationList = lazy(() => import('../../pages/Notifications/NotificationList'));
const FAQ = lazy(() => import('../../pages/Support/FAQ'));
const HelpCenter = lazy(() => import('../../pages/Support/HelpCenter'));
const Contact = lazy(() => import('../../pages/Support/Contact'));
const TermsOfService = lazy(() => import('../../pages/Support/TermsOfService'));
const PrivacyPolicy = lazy(() => import('../../pages/Support/PrivacyPolicy'));
const Cart = lazy(() => import('../../pages/Cart/Cart'));
const CartCheckout = lazy(() => import('../../pages/Cart/CartCheckout'));
const Payment = lazy(() => import('../../pages/Payment/Payment'));
const CartPayment = lazy(() => import('../../pages/Payment/CartPayment'));
const RefundRequest = lazy(() => import('../../pages/RefundRequest'));

// Vendor Pages (Lazy loaded)
const VendorDashboard = lazy(() => import('../../pages/Vendor/VendorDashboard'));
const VendorServices = lazy(() => import('../../pages/Vendor/VendorServices'));
const VendorBookings = lazy(() => import('../../pages/Vendor/VendorBookings'));
const VendorAnalytics = lazy(() => import('../../pages/Vendor/VendorAnalytics'));
const VendorAvailability = lazy(() => import('../../pages/Vendor/VendorAvailability'));
const VendorReviews = lazy(() => import('../../pages/Vendor/VendorReviews'));

// Admin Pages (Lazy loaded)
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../../pages/Admin/AdminUsers'));
const AdminVendors = lazy(() => import('../../pages/Admin/AdminVendors'));
const AdminServices = lazy(() => import('../../pages/Admin/AdminServices'));
const AdminBookings = lazy(() => import('../../pages/Admin/AdminBookings'));
const AdminRefunds = lazy(() => import('../../pages/Admin/AdminRefunds'));
const AdminCoupons = lazy(() => import('../../pages/Admin/AdminCoupons'));
const AdminAnnouncements = lazy(() => import('../../pages/Admin/AdminAnnouncements'));
const AdminBanners = lazy(() => import('../../pages/Admin/AdminBanners'));
const AdminFAQs = lazy(() => import('../../pages/Admin/AdminFAQs'));
const PlatformAnalytics = lazy(() => import('../../pages/Admin/PlatformAnalytics'));
const AdminAuditLogs = lazy(() => import('../../pages/Admin/AdminAuditLogs'));
const ContentManagement = lazy(() => import('../../pages/Admin/ContentManagement'));
const FunctionalityManagement = lazy(() => import('../../pages/Admin/FunctionalityManagement'));

// Error Pages
const Forbidden = lazy(() => import('../../pages/Forbidden/Forbidden'));

// Loading component for lazy routes
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
);

/**
 * Centralized route configuration with lazy loading
 * Improves initial bundle size and load performance
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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

        {/* User Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/addresses" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Addresses />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Favorites />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationList />
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <CategoryBrowse />
          </ProtectedRoute>
        } />
        <Route path="/services/:id" element={
          <ProtectedRoute>
            <ServiceDetail />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <BookingDetail />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/cart/checkout" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <CartCheckout />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/payment/cart" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <CartPayment />
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
        <Route path="/vendor/availability" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <VendorAvailability />
          </ProtectedRoute>
        } />
        <Route path="/vendor/reviews" element={
          <ProtectedRoute allowedRoles={['VENDOR']}>
            <VendorReviews />
          </ProtectedRoute>
        } />

        {/* Admin Routes (ADMIN role only) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PlatformAnalytics />
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
        <Route path="/admin/content" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ContentManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/functionality-management" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <FunctionalityManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/coupons" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCoupons />
          </ProtectedRoute>
        } />
        <Route path="/admin/refunds" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminRefunds />
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAnnouncements />
          </ProtectedRoute>
        } />
        <Route path="/admin/banners" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminBanners />
          </ProtectedRoute>
        } />
        <Route path="/admin/faqs" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminFAQs />
          </ProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAuditLogs />
          </ProtectedRoute>
        } />

        {/* Refund Routes */}
        <Route path="/refunds/request/:bookingId" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <RefundRequest />
          </ProtectedRoute>
        } />

        {/* Error Pages */}
        <Route path="/403" element={<Forbidden />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;