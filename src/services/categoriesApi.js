import { apiClient, createHeaders } from './api.js';

const categoriesApi = {
  getAll: async () => {
    const headers = createHeaders(true);
    const response = await apiClient.get('/api/categories', { headers });
    return response.data;
  },
  create: async (categoryData) => {
    const headers = createHeaders(true);
    // If image is a simple URL string, send JSON body (admin will paste URL)
    if (typeof categoryData.image === 'string' || typeof categoryData.image === 'undefined') {
      const response = await apiClient.post('/api/categories', categoryData, { headers });
      return response.data;
    }

    // Otherwise, if a file/blob is provided, convert to FormData (rare)
    const formData = new FormData();
    formData.append('name', categoryData.name);
    if (categoryData.image instanceof Blob) {
      formData.append('image', categoryData.image, categoryData.image.name || 'category-image');
    }
    const response = await apiClient.post('/api/categories', formData, { headers: { ...headers } });
    return response.data;
  },
  update: async (categoryId, categoryData) => {
    const headers = createHeaders(true);
    if (typeof categoryData.image === 'string' || typeof categoryData.image === 'undefined') {
      const response = await apiClient.put(`/api/categories/${categoryId}`, categoryData, { headers });
      return response.data;
    }

    const formData = new FormData();
    formData.append('name', categoryData.name);
    if (categoryData.image instanceof Blob) {
      formData.append('image', categoryData.image, categoryData.image.name || 'category-image');
    }
    const response = await apiClient.put(`/api/categories/${categoryId}`, formData, { headers: { ...headers } });
    return response.data;
  },
  delete: async (categoryId) => {
    const headers = createHeaders(true);
    const response = await apiClient.delete(`/api/categories/${categoryId}`, { headers });
    return response.data;
  },
};

export { categoriesApi };
