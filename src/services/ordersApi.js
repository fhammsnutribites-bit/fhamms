import { apiClient, createHeaders } from './api.js';

/**
 * Orders API Service
 */
export const ordersApi = {
  /**
   * Create new order
   * @param {Object} orderData - Order data
   */
  create: async (orderData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/orders', orderData, { headers });
    return response.data;
  },

  /**
   * Get all orders (admin only)
   */
  getAll: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/orders', { headers });
    return response.data;
  },

  /**
   * Get user's orders
   */
  getMyOrders: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/orders/my', { headers });
    return response.data;
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   */
  getById: async (orderId) => {
    const headers = createHeaders(true);
    const response = await apiClient.get(`/api/orders/${orderId}`, { headers });
    return response.data;
  },

  /**
   * Update order delivery status (admin only)
   * @param {string} orderId - Order ID
   * @param {string} deliveryStatus - New delivery status
   */
  updateDeliveryStatus: async (orderId, deliveryStatus) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/orders/${orderId}/delivery-status`, { deliveryStatus }, { headers });
    return response.data;
  },

  /**
   * Update order tracking ID (admin only)
   * @param {string} orderId - Order ID
   * @param {string} trackingId - Tracking ID
   */
  updateTrackingId: async (orderId, trackingId) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/orders/${orderId}/tracking`, { trackingId }, { headers });
    return response.data;
  },

  /**
   * Mark order as delivered (admin only) - backward compatibility
   * @param {string} orderId - Order ID
   */
  markAsDelivered: async (orderId) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/orders/${orderId}/deliver`, {}, { headers });
    return response.data;
  },

  /**
   * Delete order (admin only)
   * @param {string} orderId - Order ID
   */
  delete: async (orderId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/orders/${orderId}`, { headers });
    return response.data;
  },
};



