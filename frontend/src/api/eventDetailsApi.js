import apiClient from './client';

export const eventDetailsApi = {
  // Get event detail by ID
  getById: async (id) => {
    return apiClient.get(`/event-details/${id}`);
  },

  // Get event details for an event
  getByEvent: async (eventSlug, params = {}) => {
    return apiClient.get(`/events/${eventSlug}/details`, { params });
  },

  // Check availability
  checkAvailability: async (eventDetailId, date) => {
    return apiClient.get(`/event-details/${eventDetailId}/availability`, {
      params: { date }
    });
  },

  // Book tickets for an event detail
  bookTickets: async (eventDetailId, data) => {
    return apiClient.post(`/event-details/${eventDetailId}/book`, data);
  }
};