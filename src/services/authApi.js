import { apiClient } from './api.js';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register new user (send OTP)
   * @param {Object} userData - User data { name, email, password, mobile, isAdmin? }
   */
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Verify registration OTP and create account
   * @param {string} tempUserId - Temporary user ID from registration
   * @param {string} otp - OTP code
   */
  verifyRegistration: async (tempUserId, otp) => {
    const response = await apiClient.post('/api/auth/verify-registration', { tempUserId, otp });
    return response.data;
  },

  /**
   * Login user
   * @param {string} mobile - User mobile number
   * @param {string} password - User password
   */
  login: async (mobile, password) => {
    const response = await apiClient.post('/api/auth/login', { mobile, password });
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await apiClient.get('/api/users/me', { headers });
    return response.data;
  },

  /**
   * Send OTP for password reset
   * @param {string} mobile - User mobile number
   */
  sendOtp: async (mobile) => {
    const response = await apiClient.post('/api/auth/send-otp', { mobile });
    return response.data;
  },

  /**
   * Resend OTP for registration
   * @param {string} tempUserId - Temporary user ID from registration
   */
  resendOtp: async (tempUserId) => {
    const response = await apiClient.post('/api/auth/resend-otp', { tempUserId });
    return response.data;
  },

  /**
   * Verify OTP
   * @param {string} mobile - User mobile number
   * @param {string} otp - OTP code
   */
  verifyOtp: async (mobile, otp) => {
    const response = await apiClient.post('/api/auth/verify-otp', { mobile, otp });
    return response.data;
  },

  /**
   * Reset password
   * @param {string} mobile - User mobile number
   * @param {string} newPassword - New password
   */
  resetPassword: async (mobile, newPassword) => {
    const response = await apiClient.post('/api/auth/reset-password', { mobile, newPassword });
    return response.data;
  },
};



