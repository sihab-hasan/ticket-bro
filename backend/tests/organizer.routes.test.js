'use strict';

jest.mock('../src/common/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { _id: 'organizer-1', role: 'organizer' };
    next();
  },
  authorize: () => (_req, _res, next) => next(),
}));

jest.mock('../src/common/middleware/cache.middleware', () => ({
  cache: () => (_req, _res, next) => next(),
}));

const mockController = {
  getPublicProfile: jest.fn((req, res) => res.json({ route: 'public-profile', slug: req.params.slug })),
  getPublicEvents: jest.fn((req, res) => res.json({ route: 'public-events', slug: req.params.slug })),
  getOwnProfile: jest.fn((_req, res) => res.json({ route: 'own-profile' })),
  updateProfile: jest.fn((_req, res) => res.json({ route: 'update-profile' })),
  submitVerification: jest.fn((_req, res) => res.json({ route: 'submit-verification' })),
  getVerificationStatus: jest.fn((_req, res) => res.json({ route: 'verification-status' })),
  getDashboard: jest.fn((_req, res) => res.json({ route: 'dashboard' })),
  getMyEvents: jest.fn((_req, res) => res.json({ route: 'my-events' })),
  getMyBookings: jest.fn((_req, res) => res.json({ route: 'my-bookings' })),
  getRevenue: jest.fn((_req, res) => res.json({ route: 'revenue' })),
  getPayouts: jest.fn((_req, res) => res.json({ route: 'payouts' })),
};

jest.mock('../src/modules/organizers/organizer.controller', () => mockController);

const express = require('express');
const request = require('supertest');
const organizerRoutes = require('../src/modules/organizers/organizer.routes');

describe('organizer routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('routes /organizer/profile to the private profile handler instead of the public slug handler', async () => {
    const app = express();
    app.use('/organizer', organizerRoutes);
    app.use('/organizers', organizerRoutes);

    const response = await request(app).get('/organizer/profile');

    expect(response.body).toEqual({ route: 'own-profile' });
    expect(mockController.getOwnProfile).toHaveBeenCalled();
    expect(mockController.getPublicProfile).not.toHaveBeenCalled();
  });

  test('routes /organizers/:slug to the public profile handler', async () => {
    const app = express();
    app.use('/organizer', organizerRoutes);
    app.use('/organizers', organizerRoutes);

    const response = await request(app).get('/organizers/acme-live');

    expect(response.body).toEqual({ route: 'public-profile', slug: 'acme-live' });
    expect(mockController.getPublicProfile).toHaveBeenCalled();
  });
});
