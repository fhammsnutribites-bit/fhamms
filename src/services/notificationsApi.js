import { apiClient, createHeaders } from './api.js';

const notificationsApi = {
  getActive: async () => {
    const response = await apiClient.get('/api/notifications/active');
    return response.data;
  },

  getAll: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/notifications', { headers });
    return response.data;
  },

  create: async (notificationData) => {
    const headers = createHeaders(true);
    const response = await apiClient.post('/api/notifications', notificationData, { headers });
    return response.data;
  },

  update: async (notificationId, notificationData) => {
    const headers = createHeaders(true);
    const response = await apiClient.put(`/api/notifications/${notificationId}`, notificationData, { headers });
    return response.data;
  },

  delete: async (notificationId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/notifications/${notificationId}`, { headers });
    return response.data;
  },

  toggleActive: async (notificationId) => {
    const headers = createHeaders(true);
    const response = await apiClient.patch(`/api/notifications/${notificationId}/toggle`, {}, { headers });
    return response.data;
  },
};

export { notificationsApi };
