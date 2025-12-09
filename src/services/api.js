import axios from 'axios';
import { API_URL } from '../config/api.js';

/**
 * Base API client with default configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get authorization token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get session ID from localStorage
 */
const getSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cartSessionId', sessionId);
  }
  return sessionId;
};

/**
 * Create request headers with auth token and/or session ID
 * @param {boolean} includeAuth - Include Authorization header
 * @param {boolean} includeSession - Include x-session-id header
 * @param {string} sessionId - Optional: Override session ID (for merging)
 */
const createHeaders = (includeAuth = false, includeSession = false, sessionId = null) => {
  const headers = {};
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  if (includeSession) {
    const sid = sessionId || getSessionId();
    if (sid) {
      headers['x-session-id'] = sid;
    }
  }
  
  return headers;
};

export { apiClient, getAuthToken, getSessionId, createHeaders };

