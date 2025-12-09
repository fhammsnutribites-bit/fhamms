import { apiClient, createHeaders } from './api.js';

/**
 * Promo Code API Service
 */
export const promoCodeApi = {
  /**
   * Validate promo code (public)
   * @param {Object} validationData - { code, orderAmount, userId?, cartItems? }
   */
  validate: async (validationData) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.post('/api/promo-codes/validate', validationData, { headers });
    return response.data;
  },

  /**
   * Get all promo codes (admin only)
   */
  getAll: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/promo-codes', { headers });
    return response.data;
  },

  /**
   * Get promo code by ID (admin only)
   * @param {string} promoCodeId - Promo code ID
   */
  getById: async (promoCodeId) => {
    const headers = createHeaders(true);
    const response = await apiClient.get(`/api/promo-codes/${promoCodeId}`, { headers });
    return response.data;
  },

  /**
   * Create promo code (admin only)
   * @param {Object} promoCodeData - Promo code data
   */
  create: async (promoCodeData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/promo-codes', promoCodeData, { headers });
    return response.data;
  },

  /**
   * Update promo code (admin only)
   * @param {string} promoCodeId - Promo code ID
   * @param {Object} promoCodeData - Updated promo code data
   */
  update: async (promoCodeId, promoCodeData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/promo-codes/${promoCodeId}`, promoCodeData, { headers });
    return response.data;
  },

  /**
   * Delete promo code (admin only)
   * @param {string} promoCodeId - Promo code ID
   */
  delete: async (promoCodeId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/promo-codes/${promoCodeId}`, { headers });
    return response.data;
  },

  /**
   * Toggle promo code active status (admin only)
   * @param {string} promoCodeId - Promo code ID
   * @param {boolean} isActive - New active status
   */
  toggleActive: async (promoCodeId, isActive) => {
    const headers = createHeaders(true);
    const response = await apiClient.patch(`/api/promo-codes/${promoCodeId}/toggle`, { isActive }, { headers });
    return response.data;
  },
};



