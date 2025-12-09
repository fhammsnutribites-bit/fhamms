import { apiClient, createHeaders, getSessionId } from './api.js';

/**
 * Cart API Service
 */
export const cartApi = {
  /**
   * Get cart (works for both authenticated and guest users)
   */
  getCart: async () => {
    const sessionId = getSessionId();
    const headers = createHeaders(true, true, sessionId);
    const response = await apiClient.get('/api/cart', { headers });
    return response.data;
  },

  /**
   * Add item to cart
   * @param {Object} itemData - Item data { productId, qty, price?, weight? }
   */
addItem: async (itemData) => {
  const sessionId = getSessionId();
  const headers = createHeaders(true, true, sessionId);
  // Ensure productId is included and correctly formatted
  const payload = {
    productId: itemData.productId || itemData._id, // Handle both cases
    qty: itemData.qty || 1,
    ...(itemData.weight && { weight: itemData.weight }),
    ...(itemData.price && { price: itemData.price }),
  };
  console.log('Adding to cart:', payload); // Debug log
  const response = await apiClient.post('/api/cart/items', payload, { headers });
  return response.data;
},

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} qty - New quantity
   */
  updateItem: async (itemId, qty) => {
    const sessionId = getSessionId();
    const headers = createHeaders(true, true, sessionId);
    const response = await apiClient.put(`/api/cart/items/${itemId}`, { qty }, { headers });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   */
  removeItem: async (itemId) => {
    const sessionId = getSessionId();
    const headers = createHeaders(true, true, sessionId);
    const response = await apiClient.delete(`/api/cart/items/${itemId}`, { headers });
    return response.data;
  },

  /**
   * Clear cart
   */
  clearCart: async () => {
    const sessionId = getSessionId();
    const headers = createHeaders(true, true, sessionId);
    const response = await apiClient.delete('/api/cart', { headers });
    return response.data;
  },

  /**
   * Merge guest cart with user cart (called on login)
   * @param {string} sessionId - Guest session ID
   */
  mergeCart: async (sessionId) => {
    const headers = createHeaders(true, false, sessionId);
    const response = await apiClient.post('/api/cart/merge', { sessionId }, { headers });
    return response.data;
  },
};

