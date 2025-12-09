import { apiClient } from './api.js';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register new user
   * @param {Object} userData - User data { name, email, password, isAdmin? }
   */
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
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
};



