import apiClient from './client';

export const categoriesApi = {
  // Get all categories
  getAll: async (params = {}) => {
    return apiClient.get('/categories', { params });
  },

  // Get single category by slug
  getBySlug: async (slug) => {
    return apiClient.get(`/categories/${slug}`);
  },

  // Get category with subcategories and events
  getWithRelations: async (slug) => {
    return apiClient.get(`/categories/${slug}/with-relations`);
  },

  // Get featured categories
  getFeatured: async (limit = 6) => {
    return apiClient.get('/categories/featured', { params: { limit } });
  }
};