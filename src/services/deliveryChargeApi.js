import { apiClient, createHeaders } from './api.js';

/**
 * Delivery Charge API Service
 */
export const deliveryChargeApi = {
  /**
   * Calculate delivery charge for an order amount (public)
   * @param {number} orderAmount - Order amount
   */
  calculate: async (orderAmount) => {
    const response = await apiClient.post('/api/delivery-charges/calculate', { orderAmount });
    return response.data;
  },

  /**
   * Get all delivery charges (admin only)
   */
  getAll: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/delivery-charges', { headers });
    return response.data;
  },

  /**
   * Get delivery charge by ID (admin only)
   * @param {string} chargeId - Delivery charge ID
   */
  getById: async (chargeId) => {
    const headers = createHeaders(true);
    const response = await apiClient.get(`/api/delivery-charges/${chargeId}`, { headers });
    return response.data;
  },

  /**
   * Create delivery charge (admin only)
   * @param {Object} chargeData - Delivery charge data
   */
  create: async (chargeData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/delivery-charges', chargeData, { headers });
    return response.data;
  },

  /**
   * Update delivery charge (admin only)
   * @param {string} chargeId - Delivery charge ID
   * @param {Object} chargeData - Updated delivery charge data
   */
  update: async (chargeId, chargeData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/delivery-charges/${chargeId}`, chargeData, { headers });
    return response.data;
  },

  /**
   * Delete delivery charge (admin only)
   * @param {string} chargeId - Delivery charge ID
   */
  delete: async (chargeId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/delivery-charges/${chargeId}`, { headers });
    return response.data;
  },

  /**
   * Toggle delivery charge active status (admin only)
   * @param {string} chargeId - Delivery charge ID
   */
  toggleActive: async (chargeId) => {
    const headers = createHeaders(true);
    const response = await apiClient.patch(`/api/delivery-charges/${chargeId}/toggle`, {}, { headers });
    return response.data;
  },
};



