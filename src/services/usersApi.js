import { apiClient, createHeaders } from './api.js';

/**
 * Users API Service
 */
export const usersApi = {
  /**
   * Get all users (admin only)
   */
  getAll: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/users', { headers });
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/users/me', { headers });
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data { name?, email?, password? }
   */
  updateProfile: async (userData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put('/api/users/me', userData, { headers });
    return response.data;
  },

  /**
   * Add address
   * @param {Object} addressData - Address data
   */
  addAddress: async (addressData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/users/me/address', addressData, { headers });
    return response.data;
  },

  /**
   * Update address
   * @param {number} index - Address index
   * @param {Object} addressData - Updated address data
   */
  updateAddress: async (index, addressData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/users/me/address/${index}`, addressData, { headers });
    return response.data;
  },

  /**
   * Delete address
   * @param {number} index - Address index
   */
  deleteAddress: async (index) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/users/me/address/${index}`, { headers });
    return response.data;
  },

  /**
   * Add payment method
   * @param {Object} paymentData - Payment method data
   */
  addPaymentMethod: async (paymentData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/users/me/payment', paymentData, { headers });
    return response.data;
  },

  /**
   * Update payment method
   * @param {number} index - Payment method index
   * @param {Object} paymentData - Updated payment method data
   */
  updatePaymentMethod: async (index, paymentData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/users/me/payment/${index}`, paymentData, { headers });
    return response.data;
  },

  /**
   * Delete payment method
   * @param {number} index - Payment method index
   */
  deletePaymentMethod: async (index) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/users/me/payment/${index}`, { headers });
    return response.data;
  },

  /**
   * Delete user (admin only)
   * @param {string} userId - User ID
   */
  delete: async (userId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/users/${userId}`, { headers });
    return response.data;
  },
};



