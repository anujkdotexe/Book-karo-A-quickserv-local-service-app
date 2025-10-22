import axios from 'axios';

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
    if (error.response?.status === 401) {
      // Session expired - show user-friendly message
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Try to show toast notification if available
      try {
        const event = new CustomEvent('session-expired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(event);
      } catch (e) {
        // Fallback: silently redirect
      }
      
      // Redirect to login after a brief delay to show message
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
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
};

export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getUserBookings: (status) => api.get('/bookings', {
    params: { status: status || undefined }
  }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
};

export const reviewAPI = {
  submitReview: (data) => api.post('/reviews', data),
  getServiceReviews: (serviceId, page, size) =>
    api.get(`/reviews/service/${serviceId}`, {
      params: { page, size },
    }),
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

export default api;
