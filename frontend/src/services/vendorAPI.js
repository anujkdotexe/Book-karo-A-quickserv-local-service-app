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
  },

  // ========== Availability Management ==========

  /**
   * Get vendor availabilities
   * @returns {Promise} List of availability slots
   */
  getAvailabilities: async () => {
    const response = await api.get('/vendor/availabilities');
    return response.data.data;
  },

  /**
   * Create new availability slot
   * @param {Object} availabilityData - Availability details (dayOfWeek, startTime, endTime, isAvailable, specialNote)
   * @returns {Promise} Created availability
   */
  createAvailability: async (availabilityData) => {
    const response = await api.post('/vendor/availabilities', availabilityData);
    return response.data.data;
  },

  /**
   * Update availability slot
   * @param {number} availabilityId - Availability ID
   * @param {Object} availabilityData - Updated availability details
   * @returns {Promise} Updated availability
   */
  updateAvailability: async (availabilityId, availabilityData) => {
    const response = await api.put(`/vendor/availabilities/${availabilityId}`, availabilityData);
    return response.data.data;
  },

  /**
   * Delete availability slot
   * @param {number} availabilityId - Availability ID
   * @returns {Promise} Success message
   */
  deleteAvailability: async (availabilityId) => {
    const response = await api.delete(`/vendor/availabilities/${availabilityId}`);
    return response.data;
  },

  /**
   * Get vendor reviews
   * @returns {Promise} List of customer reviews for vendor's services
   */
  getReviews: async () => {
    const response = await api.get('/vendor/reviews');
    return response.data.data;
  }
};

export default vendorAPI;
