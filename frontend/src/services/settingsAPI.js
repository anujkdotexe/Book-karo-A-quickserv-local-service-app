import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api/v1';

const settingsAPI = {
  // Get all settings (Admin only)
  getAllSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Get settings by category (Admin only)
  getSettingsByCategory: async (category) => {
    const response = await axios.get(`${API_BASE_URL}/settings/category/${category}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Get public settings (accessible to all)
  getPublicSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/public/settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Create new setting (Admin only)
  createSetting: async (settingData) => {
    const response = await axios.post(`${API_BASE_URL}/settings`, settingData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Update setting (Admin only)
  updateSetting: async (id, settingData) => {
    const response = await axios.put(`${API_BASE_URL}/settings/${id}`, settingData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Bulk update settings (Admin only)
  bulkUpdateSettings: async (updates) => {
    const response = await axios.put(`${API_BASE_URL}/settings/bulk`, updates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Delete setting (Admin only)
  deleteSetting: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/settings/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Initialize default settings (Admin only)
  initializeSettings: async () => {
    const response = await axios.post(`${API_BASE_URL}/settings/initialize`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

export default settingsAPI;
