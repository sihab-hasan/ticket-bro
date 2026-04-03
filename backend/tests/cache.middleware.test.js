'use strict';

jest.mock('../src/infrastructure/cache/cacheService', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

const express = require('express');
const request = require('supertest');
const cacheService = require('../src/infrastructure/cache/cacheService');
const { cache, parseCacheDuration } = require('../src/common/middleware/cache.middleware');

describe('cache middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue(true);
  });

  test('parses cache durations into seconds', () => {
    expect(parseCacheDuration('30s')).toBe(30);
    expect(parseCacheDuration('5m')).toBe(300);
    expect(parseCacheDuration('2h')).toBe(7200);
  });

  test('caches successful public GET responses', async () => {
    const app = express();
    let hitCount = 0;

    app.get('/items', cache('30s'), (_req, res) => {
      hitCount += 1;
      res.json({ hitCount });
    });

    const first = await request(app).get('/items');
    const second = await request(app).get('/items');

    expect(first.headers['x-cache']).toBe('MISS');
    expect(second.headers['x-cache']).toBe('HIT');
    expect(first.body).toEqual({ hitCount: 1 });
    expect(second.body).toEqual({ hitCount: 1 });
    expect(hitCount).toBe(1);
  });

  test('skips authenticated requests', async () => {
    const app = express();
    let hitCount = 0;

    app.use((req, _res, next) => {
      req.user = { _id: 'user-1' };
      next();
    });

    app.get('/me', cache('30s'), (_req, res) => {
      hitCount += 1;
      res.json({ hitCount });
    });

    const first = await request(app).get('/me');
    const second = await request(app).get('/me');

    expect(first.headers['x-cache']).toBe('SKIP');
    expect(second.headers['x-cache']).toBe('SKIP');
    expect(second.body).toEqual({ hitCount: 2 });
    expect(hitCount).toBe(2);
  });
});
