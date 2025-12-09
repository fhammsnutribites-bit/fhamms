import { apiClient, createHeaders } from './api.js';

/**
 * Products API Service
 */
export const productsApi = {
  /**
   * Get all products
   */
  getAll: async () => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   */
  getById: async (productId) => {
    const response = await apiClient.get(`/api/products/${productId}`);
    return response.data;
  },

  /**
   * Create product (admin only)
   * @param {Object} productData - Product data
   */
  create: async (productData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/products', productData, { headers });
    return response.data;
  },

  /**
   * Update product (admin only)
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   */
  update: async (productId, productData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/products/${productId}`, productData, { headers });
    return response.data;
  },

  /**
   * Delete product (admin only)
   * @param {string} productId - Product ID
   */
  delete: async (productId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/products/${productId}`, { headers });
    return response.data;
  },
};



