import { apiClient, createHeaders } from './api.js';

/**
 * Reviews API Service
 */
export const reviewsApi = {
  /**
   * Get reviews for a product
   * @param {string} productId - Product ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Reviews per page (default: 10)
   */
  getProductReviews: async (productId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/api/reviews/product/${productId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get user's review for a specific product and order
   * @param {string} productId - Product ID
   * @param {string} orderId - Order ID
   */
  getUserReview: async (productId, orderId) => {
    const headers = createHeaders(true);
    const response = await apiClient.get(`/api/reviews/user/${productId}/${orderId}`, { headers });
    return response.data;
  },

  /**
   * Create or update a review
   * @param {Object} reviewData - Review data
   * @param {string} reviewData.productId - Product ID
   * @param {string} reviewData.orderId - Order ID
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Review comment
   * @param {Array} reviewData.images - Array of image URLs
   */
  createOrUpdateReview: async (reviewData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/reviews', reviewData, { headers });
    return response.data;
  },

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   */
  deleteReview: async (reviewId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/reviews/${reviewId}`, { headers });
    return response.data;
  },
};

