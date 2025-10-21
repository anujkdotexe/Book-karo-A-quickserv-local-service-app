import api from './api';

/**
 * Vendor API Service
 * Handles all vendor-related API calls
 */
export const vendorAPI = {
  /**
   * Get vendor dashboard statistics
   * @returns {Promise} Dashboard stats with bookings, revenue, services, ratings
   */
  getDashboard: async () => {
    const response = await api.get('/vendor/dashboard');
    return response.data.data;
  },

  /**
   * Get vendor bookings
   * @param {string} status - Optional filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
   * @returns {Promise} List of bookings
   */
  getBookings: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/vendor/bookings', { params });
    return response.data.data;
  },

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {string} status - New status (CONFIRMED, COMPLETED, CANCELLED)
   * @returns {Promise} Updated booking
   */
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.put(`/vendor/bookings/${bookingId}/status`, { status });
    return response.data.data;
  },

  /**
   * Get vendor services
   * @returns {Promise} List of services
   */
  getServices: async () => {
    const response = await api.get('/vendor/services');
    return response.data.data;
  },

  /**
   * Create new service
   * @param {Object} serviceData - Service details
   * @returns {Promise} Created service
   */
  createService: async (serviceData) => {
    const response = await api.post('/vendor/services', serviceData);
    return response.data.data;
  },

  /**
   * Update service
   * @param {number} serviceId - Service ID
   * @param {Object} serviceData - Updated service details
   * @returns {Promise} Updated service
   */
  updateService: async (serviceId, serviceData) => {
    const response = await api.put(`/vendor/services/${serviceId}`, serviceData);
    return response.data.data;
  },

  /**
   * Delete service
   * @param {number} serviceId - Service ID
   * @returns {Promise} Success message
   */
  deleteService: async (serviceId) => {
    const response = await api.delete(`/vendor/services/${serviceId}`);
    return response.data;
  },

  /**
   * Toggle service availability
   * @param {number} serviceId - Service ID
   * @returns {Promise} Updated service
   */
  toggleServiceAvailability: async (serviceId) => {
    const response = await api.put(`/vendor/services/${serviceId}/toggle`);
    return response.data.data;
  }
};

export default vendorAPI;
