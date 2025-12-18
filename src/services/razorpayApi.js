import { apiClient, createHeaders } from './api.js';

/**
 * Razorpay API Service
 */
export const razorpayApi = {
  /**
   * Create Razorpay order
   * @param {string} orderId - Order ID to create payment for
   */
  createOrder: async (orderId) => {
    console.log('Creating Razorpay order for order:', orderId);
    const headers = createHeaders(true);
    console.log('Request headers:', headers);
    console.log('Request payload:', { orderId });

    try {
      const response = await apiClient.post('/api/razorpay/create-order', { orderId }, { headers });
      console.log('Razorpay API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Razorpay API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Verify payment after completion
   * @param {object} paymentData - Payment verification data
   */
  verifyPayment: async (paymentData) => {
    const headers = createHeaders(false);
    const response = await apiClient.post('/api/razorpay/verify-payment', paymentData, { headers });
    return response.data;
  },

  /**
   * Check payment status
   * @param {string} paymentId - Razorpay payment ID
   */
  checkStatus: async (paymentId) => {
    const headers = createHeaders(true);
    const response = await apiClient.get(`/api/razorpay/payment-status/${paymentId}`, { headers });
    return response.data;
  },

  /**
   * Handle payment success callback
   * @param {object} paymentData - Payment success data
   */
  paymentSuccess: async (paymentData) => {
    const headers = createHeaders(false);
    const response = await apiClient.post('/api/razorpay/payment-success', paymentData, { headers });
    return response.data;
  }
};

export default razorpayApi;
