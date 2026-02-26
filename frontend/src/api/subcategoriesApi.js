import apiClient from './client';

export const subcategoriesApi = {
  // Get all subcategories for a category
  getByCategory: async (categorySlug, params = {}) => {
    return apiClient.get(`/categories/${categorySlug}/subcategories`, { params });
  },

  // Get single subcategory by slug
  getBySlug: async (slug) => {
    return apiClient.get(`/subcategories/${slug}`);
  },

  // Get subcategory with events
  getWithEvents: async (slug) => {
    return apiClient.get(`/subcategories/${slug}/with-events`);
  }
};