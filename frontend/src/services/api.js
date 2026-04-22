import axios from 'axios';
import { handleSessionExpired } from './navigationService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error handling
    if (!error.response) {
      // Network error - no response from server
      const networkError = new Error('Network error. Please check your internet connection and try again.');
      networkError.isNetworkError = true;
      networkError.retry = () => {
        // Return the original request config for retry
        return api.request(error.config);
      };
      return Promise.reject(networkError);
    }
    
    if (error.response?.status === 401) {
      // Session expired or unauthorized - use navigation service
      handleSessionExpired();
    }
    
    // Add user-friendly error messages
    if (error.response?.status === 500) {
      error.userMessage = 'Server error. Our team has been notified. Please try again later.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'The requested resource was not found.';
    } else if (error.response?.status === 403) {
      error.userMessage = 'You do not have permission to perform this action.';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export const serviceAPI = {
  searchServices: (filters, page, size, sortBy, sortDir) =>
    api.get('/services', {
      params: { 
        category: filters.category || undefined,
        city: filters.city || undefined,
        location: filters.location || undefined,
        keyword: filters.keyword || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minRating: filters.minRating || undefined,
        page, 
        size,
        sortBy: sortBy || 'averageRating',
        sortDir: sortDir || 'desc'
      },
    }),
  getServiceById: (id) => api.get(`/services/${id}`),
  getVendorInfo: (id) => api.get(`/services/${id}/vendor`),
  getCities: () => api.get('/services/cities'),
  getCategories: () => api.get('/services/categories'),
  getTrendingSearches: () => api.get('/services/trending'),
};

export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getUserBookings: (status) => api.get('/bookings', {
    params: { status: status || undefined }
  }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
};

export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  submitReview: (data) => api.post('/reviews', data), // Keep for backward compatibility
  getServiceReviews: (serviceId, rating = null) =>
    api.get(`/reviews/service/${serviceId}`, {
      params: { rating },
    }),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
};

export const addressAPI = {
  getUserAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/addresses/${id}/set-default`),
};

export const favoriteAPI = {
  getFavorites: () => api.get('/favorites'),
  addToFavorites: (serviceId) => api.post(`/favorites/${serviceId}`),
  removeFromFavorites: (serviceId) => api.delete(`/favorites/${serviceId}`),
  checkFavorite: (serviceId) => api.get(`/favorites/${serviceId}/check`),
};

export const cartAPI = {
  getCartItems: () => api.get('/cart'),
  addToCart: (serviceId, quantity = 1) => api.post('/cart/add', { serviceId, quantity }),
  removeFromCart: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  clearCart: () => api.delete('/cart/clear'),
  getCartCount: () => api.get('/cart/count'),
};

export const paymentAPI = {
  processPayment: (paymentData) => api.post('/payments', paymentData),
  getPaymentHistory: () => api.get('/payments/history'),
  getPaymentDetails: (paymentId) => api.get(`/payments/${paymentId}`),
};

export const refundAPI = {
  requestRefund: (bookingId, reason) => api.post('/refunds/request', { bookingId, reason }),
  getUserRefunds: () => api.get('/refunds/user'),
  getRefundByBooking: (bookingId) => api.get(`/refunds/booking/${bookingId}`),
  getAllRefunds: (status = null, page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (status) params.append('status', status);
    return api.get(`/refunds/admin?${params}`);
  },
  approveRefund: (refundId) => api.patch(`/refunds/${refundId}/approve`),
  rejectRefund: (refundId, reason) => api.patch(`/refunds/${refundId}/reject`, null, { params: { reason } }),
};

export const adminAPI = {
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export const searchAPI = {
  autocomplete: (query, limit = 10) => 
    api.get('/services/autocomplete', { params: { q: query, limit } }),
  getTrending: () => api.get('/services/trending'),
};

export const notificationAPI = {
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getRecent: (limit = 10) => api.get('/notifications/recent', { params: { limit } }),
  getAll: (page = 0, size = 20) => api.get('/notifications', { params: { page, size } }),
  getById: (notificationId) => api.get(`/notifications/${notificationId}`),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: () => api.delete('/notifications/clear-all'),
};

export const contentAPI = {
  // Announcements
  getAllAnnouncements: () => api.get('/admin/content/announcements'),
  getActiveAnnouncements: () => api.get('/admin/content/announcements/active'),
  getAnnouncementsByAudience: (audience) => api.get('/admin/content/announcements/audience', { params: { audience } }),
  createAnnouncement: (data) => api.post('/admin/content/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/content/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/content/announcements/${id}`),
  toggleAnnouncementStatus: (id) => api.put(`/admin/content/announcements/${id}/toggle`),
  resendAnnouncementNotifications: (id) => api.post(`/admin/content/announcements/${id}/resend-notifications`),
  
  // FAQs
  getAllFAQs: () => api.get('/admin/content/faqs'),
  getActiveFAQs: (category) => api.get('/admin/content/faqs/active', { params: { category } }),
  getPublicFAQs: (category) => api.get('/faqs', { params: { category } }),
  createFAQ: (data) => api.post('/admin/content/faqs', data),
  updateFAQ: (id, data) => api.put(`/admin/content/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/admin/content/faqs/${id}`),
  toggleFAQStatus: (id) => api.put(`/admin/content/faqs/${id}/toggle`),
  
  // Banners
  getAllBanners: () => api.get('/admin/content/banners'),
  getActiveBanners: () => api.get('/admin/content/banners/active'),
  createBanner: (data) => api.post('/admin/content/banners', data),
  updateBanner: (id, data) => api.put(`/admin/content/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/content/banners/${id}`),
  toggleBannerStatus: (id) => api.put(`/admin/content/banners/${id}/toggle`),
};

export default api;

