import api from './api';

/**
 * Admin API Service
 * Handles all admin-related API calls
 */
export const adminAPI = {
  /**
   * Get admin dashboard statistics
   * @returns {Promise} Platform-wide stats
   */
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  // ========== User Management ==========
  
  /**
   * Get all users (paginated)
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise} Paginated user list
   */
  getAllUsers: async (page = 0, size = 20) => {
    const response = await api.get('/admin/users', { params: { page, size } });
    return response.data.data;
  },

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @returns {Promise} List of matching users
   */
  searchUsers: async (query) => {
    const response = await api.get('/admin/users/search', { params: { q: query } });
    return response.data.data;
  },

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} role - New role (USER, VENDOR, ADMIN)
   * @returns {Promise} Updated user
   */
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data.data;
  },

  /**
   * Toggle user active status
   * @param {number} userId - User ID
   * @returns {Promise} Updated user
   */
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data.data;
  },

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise} Success message
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ========== Vendor Management ==========
  
  /**
   * Get all vendors (paginated)
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise} Paginated vendor list
   */
  getAllVendors: async (page = 0, size = 20) => {
    const response = await api.get('/admin/vendors', { params: { page, size } });
    return response.data.data;
  },

  /**
   * Get pending vendor approvals
   * @returns {Promise} List of pending vendors
   */
  getPendingVendors: async () => {
    const response = await api.get('/admin/vendors/pending');
    return response.data.data;
  },

  /**
   * Approve vendor
   * @param {number} vendorId - Vendor ID
   * @returns {Promise} Approved vendor
   */
  approveVendor: async (vendorId) => {
    const response = await api.put(`/admin/vendors/${vendorId}/approve`);
    return response.data.data;
  },

  /**
   * Reject vendor application
   * @param {number} vendorId - Vendor ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Rejected vendor
   */
  rejectVendor: async (vendorId, reason) => {
    const response = await api.put(`/admin/vendors/${vendorId}/reject`, { reason });
    return response.data.data;
  },

  /**
   * Suspend vendor
   * @param {number} vendorId - Vendor ID
   * @param {string} reason - Suspension reason
   * @returns {Promise} Suspended vendor
   */
  suspendVendor: async (vendorId, reason) => {
    const response = await api.put(`/admin/vendors/${vendorId}/suspend`, { reason });
    return response.data.data;
  },

  /**
   * Reactivate vendor
   * @param {number} vendorId - Vendor ID
   * @returns {Promise} Reactivated vendor
   */
  reactivateVendor: async (vendorId) => {
    const response = await api.put(`/admin/vendors/${vendorId}/reactivate`);
    return response.data.data;
  },

  // ========== Service Management ==========
  
  /**
   * Get all services (paginated)
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise} Paginated service list
   */
  getAllServices: async (page = 0, size = 20) => {
    const response = await api.get('/admin/services', { params: { page, size } });
    return response.data.data;
  },

  /**
   * Get pending service approvals
   * @returns {Promise} List of pending services
   */
  getPendingServices: async () => {
    const response = await api.get('/admin/services/pending');
    return response.data.data;
  },

  /**
   * Approve service
   * @param {number} serviceId - Service ID
   * @returns {Promise} Approved service
   */
  approveService: async (serviceId) => {
    const response = await api.put(`/admin/services/${serviceId}/approve`);
    return response.data.data;
  },

  /**
   * Reject service
   * @param {number} serviceId - Service ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Rejected service
   */
  rejectService: async (serviceId, reason) => {
    const response = await api.put(`/admin/services/${serviceId}/reject`, { reason });
    return response.data.data;
  },

  /**
   * Toggle service featured status
   * @param {number} serviceId - Service ID
   * @returns {Promise} Updated service
   */
  toggleServiceFeatured: async (serviceId) => {
    const response = await api.put(`/admin/services/${serviceId}/toggle-featured`);
    return response.data.data;
  },

  /**
   * Delete service
   * @param {number} serviceId - Service ID
   * @returns {Promise} Success message
   */
  deleteService: async (serviceId) => {
    const response = await api.delete(`/admin/services/${serviceId}`);
    return response.data;
  },

  // ========== Booking Management ==========
  
  /**
   * Get all bookings with optional status filter (paginated)
   * @param {string} status - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED) or null for all
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise} Paginated booking list
   */
  getAllBookings: async (status = null, page = 0, size = 20) => {
    const params = { page, size };
    if (status) params.status = status;
    const response = await api.get('/admin/bookings', { params });
    return response.data.data;
  },

  /**
   * Cancel booking (admin override)
   * @param {number} bookingId - Booking ID
   * @param {string} reason - Cancellation reason (optional)
   * @returns {Promise} Updated booking
   */
  cancelBooking: async (bookingId, reason = null) => {
    const response = await api.post(`/admin/bookings/${bookingId}/cancel`, {}, { params: { reason } });
    return response.data.data;
  },

  /**
   * Update booking status (admin override)
   * @param {number} bookingId - Booking ID
   * @param {string} status - New status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
   * @returns {Promise} Updated booking
   */
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/admin/bookings/${bookingId}/status`, null, { params: { status } });
    return response.data.data;
  },

  /**
   * Revert completed booking to previous status (admin override)
   * @param {number} bookingId - Booking ID
   * @param {string} newStatus - Target status (CONFIRMED or PENDING)
   * @param {string} reason - Revert reason (required)
   * @returns {Promise} Updated booking
   */
  revertBooking: async (bookingId, newStatus, reason) => {
    const response = await api.post(`/admin/bookings/${bookingId}/revert`, { newStatus, reason });
    return response.data.data;
  },

  // ========== Coupon Management ==========
  
  /**
   * Get all coupons
   * @returns {Promise} List of all coupons
   */
  getAllCoupons: async () => {
    const response = await api.get('/admin/coupons');
    return response.data.data;
  },

  /**
   * Create new coupon
   * @param {Object} couponData - Coupon details
   * @returns {Promise} Created coupon
   */
  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data.data;
  },

  /**
   * Update existing coupon
   * @param {number} couponId - Coupon ID
   * @param {Object} couponData - Updated coupon details
   * @returns {Promise} Updated coupon
   */
  updateCoupon: async (couponId, couponData) => {
    const response = await api.put(`/admin/coupons/${couponId}`, couponData);
    return response.data.data;
  },

  /**
   * Toggle coupon active status
   * @param {number} couponId - Coupon ID
   * @returns {Promise} Updated coupon
   */
  toggleCouponStatus: async (couponId) => {
    const response = await api.patch(`/admin/coupons/${couponId}/toggle-status`);
    return response.data.data;
  },

  // ========== Audit Log Management ==========
  
  /**
   * Get audit logs with filtering and sorting
   * @param {Object} params - Query parameters { entityType, page, size, sortBy, sortDir }
   * @returns {Promise} Paginated audit logs
   */
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data.data;
  },

  /**
   * Get audit logs for specific entity
   * @param {string} entityType - Entity type (e.g., 'VENDOR', 'SERVICE', 'BOOKING')
   * @param {number} entityId - Entity ID
   * @returns {Promise} List of audit logs for the entity
   */
  getEntityAuditLogs: async (entityType, entityId) => {
    const response = await api.get(`/admin/audit-logs/entity/${entityType}/${entityId}`);
    return response.data.data;
  },

  /**
   * Get audit logs by user
   * @param {number} userId - User ID
   * @returns {Promise} List of audit logs performed by the user
   */
  getUserAuditLogs: async (userId) => {
    const response = await api.get(`/admin/audit-logs/user/${userId}`);
    return response.data.data;
  },

  // ========== Platform Analytics ==========
  
  /**
   * Get comprehensive platform analytics
   * @returns {Promise} Complete platform analytics with 6 major sections:
   *   - userAnalytics: User metrics, growth, segmentation, retention
   *   - vendorAnalytics: Vendor metrics, approval status, top performers
   *   - serviceAnalytics: Service metrics, performance, top services
   *   - bookingAnalytics: Booking trends, status breakdown, cancellations
   *   - revenueAnalytics: Revenue metrics, monthly trends, category breakdown
   *   - customerExperienceAnalytics: Ratings, satisfaction, top rated items
   */
  getPlatformAnalytics: async () => {
    const response = await api.get('/admin/analytics/platform');
    return response.data.data;
  }
};

export default adminAPI;
