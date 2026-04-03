'use strict';

jest.mock('../src/common/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'admin' };
    next();
  },
  authorize: () => (_req, _res, next) => next(),
  optionalAuth: (_req, _res, next) => next(),
}));

jest.mock('../src/common/middleware/cache.middleware', () => ({
  cache: () => (_req, _res, next) => next(),
}));

const mockPaymentController = {
  createIntent: jest.fn((req, res) => res.status(201).json({ body: req.body })),
  verifyPayment: jest.fn((_req, res) => res.json({ ok: true })),
  getMyPayments: jest.fn((_req, res) => res.json({ ok: true })),
  getPaymentMethods: jest.fn((_req, res) => res.json({ ok: true })),
  removePaymentMethod: jest.fn((_req, res) => res.json({ ok: true })),
  getPaymentById: jest.fn((_req, res) => res.json({ ok: true })),
  requestRefund: jest.fn((_req, res) => res.json({ ok: true })),
  getRefundStatus: jest.fn((_req, res) => res.json({ ok: true })),
};

const mockEventController = {
  createEvent: jest.fn((req, res) => res.status(201).json({ body: req.body })),
};

const mockOrganizerController = {
  updateProfile: jest.fn((req, res) => res.json({ body: req.body })),
};

const mockCategoryController = {
  create: jest.fn((req, res) => res.status(201).json({ body: req.body })),
};

const mockSubcategoryController = {
  create: jest.fn((req, res) => res.status(201).json({ body: req.body })),
};

jest.mock('../src/modules/payments/payment.controller', () => mockPaymentController);
jest.mock('../src/modules/events/event.controller', () => mockEventController);
jest.mock('../src/modules/organizers/organizer.controller', () => mockOrganizerController);
jest.mock('../src/modules/categories/category.controller', () => mockCategoryController);
jest.mock('../src/modules/subcategories/subcategory.controller', () => mockSubcategoryController);

const express = require('express');
const request = require('supertest');
const { errorHandler } = require('../src/common/middleware/errorHandler.middleware');

const paymentRoutes = require('../src/modules/payments/payment.routes');
const eventRoutes = require('../src/modules/events/event.routes');
const organizerRoutes = require('../src/modules/organizers/organizer.routes');
const categoryRoutes = require('../src/modules/categories/category.routes');
const subcategoryRoutes = require('../src/modules/subcategories/subcategory.routes');

const createApp = (mountPath, router) => {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  app.use(errorHandler);
  return app;
};

describe('route validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects invalid payment intent payloads before reaching the controller', async () => {
    const app = createApp('/payments', paymentRoutes);

    const response = await request(app).post('/payments/intent').send({});

    expect(response.status).toBe(400);
    expect(mockPaymentController.createIntent).not.toHaveBeenCalled();
  });

  test('sanitizes and normalizes valid payment intent payloads', async () => {
    const app = createApp('/payments', paymentRoutes);

    const response = await request(app)
      .post('/payments/intent')
      .send({ bookingRef: 'BK-1001', currency: 'usd', ignored: true });

    expect(response.status).toBe(201);
    expect(response.body.body).toEqual({
      bookingRef: 'BK-1001',
      currency: 'USD',
    });
  });

  test('rejects events whose endDate is before startDate', async () => {
    const app = createApp('/events', eventRoutes);

    const response = await request(app)
      .post('/events')
      .send({
        title: 'Launch Night',
        description: 'Backend validation check',
        startDate: '2026-05-10T18:00:00.000Z',
        endDate: '2026-05-10T17:00:00.000Z',
      });

    expect(response.status).toBe(400);
    expect(mockEventController.createEvent).not.toHaveBeenCalled();
  });

  test('rejects empty organizer profile updates', async () => {
    const app = createApp('/organizer', organizerRoutes);

    const response = await request(app).put('/organizer/profile').send({});

    expect(response.status).toBe(400);
    expect(mockOrganizerController.updateProfile).not.toHaveBeenCalled();
  });

  test('rejects invalid category payloads', async () => {
    const app = createApp('/categories', categoryRoutes);

    const response = await request(app).post('/categories').send({ name: 'A' });

    expect(response.status).toBe(400);
    expect(mockCategoryController.create).not.toHaveBeenCalled();
  });

  test('rejects subcategory creation without a category id', async () => {
    const app = createApp('/subcategories', subcategoryRoutes);

    const response = await request(app).post('/subcategories').send({ name: 'Concerts' });

    expect(response.status).toBe(400);
    expect(mockSubcategoryController.create).not.toHaveBeenCalled();
  });
});
