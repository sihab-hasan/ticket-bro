// src/tests/mocks/server.js
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { mockEvents } from './data/events';

export const handlers = [
  // Intercept GET /api/events
  http.get('*/api/events', () => {
    return HttpResponse.json(mockEvents);
  }),

  // Intercept GET /api/events/:slug for your EventDetailsPage
  http.get('*/api/events/:slug', ({ params }) => {
    const { slug } = params;
    const event = mockEvents.find(e => e.eventDetailsSlug === slug);
    return event ? HttpResponse.json(event) : new HttpResponse(null, { status: 404 });
  }),
];

export const server = setupServer(...handlers);