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
    const params = {};
    if (reason) params.reason = reason;
    const response = await api.post(`/admin/bookings/${bookingId}/cancel`, null, { params });
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
  }
};

export default adminAPI;
