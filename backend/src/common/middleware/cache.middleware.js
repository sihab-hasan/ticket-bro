'use strict';

const cacheService = require('../../infrastructure/cache/cacheService');

const memoryStore = new Map();

const DURATION_UNITS = {
  s: 1,
  sec: 1,
  secs: 1,
  second: 1,
  seconds: 1,
  m: 60,
  min: 60,
  mins: 60,
  minute: 60,
  minutes: 60,
  h: 3600,
  hr: 3600,
  hrs: 3600,
  hour: 3600,
  hours: 3600,
  d: 86400,
  day: 86400,
  days: 86400,
};

const parseCacheDuration = (duration) => {
  if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
    return Math.floor(duration);
  }

  const value = String(duration || '').trim().toLowerCase();
  if (!value) return 300;

  const match = value.match(/^(\d+)\s*([a-z]+)?$/);
  if (!match) return 300;

  const amount = Number(match[1]);
  const unit = match[2] || 's';

  return amount * (DURATION_UNITS[unit] || 1);
};

const pruneExpiredEntries = () => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
};

const getMemoryEntry = (key) => {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return entry.value;
};

const setMemoryEntry = (key, value, ttlSeconds) => {
  pruneExpiredEntries();
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

const buildCacheKey = (req) => `http-cache:${req.method}:${req.originalUrl}`;

const shouldBypassCache = (req) => {
  if (req.method !== 'GET') return true;
  if (req.user) return true;
  if (req.headers.authorization) return true;
  if ((req.headers['cache-control'] || '').includes('no-cache')) return true;
  return false;
};

const readCache = async (key) => {
  const redisValue = await cacheService.get(key);
  if (redisValue) return redisValue;
  return getMemoryEntry(key);
};

const writeCache = async (key, value, ttlSeconds) => {
  setMemoryEntry(key, value, ttlSeconds);
  await cacheService.set(key, value, ttlSeconds);
};

const cache = (duration = '5m') => {
  const ttlSeconds = parseCacheDuration(duration);

  return async (req, res, next) => {
    if (shouldBypassCache(req)) {
      res.setHeader('X-Cache', 'SKIP');
      return next();
    }

    const key = buildCacheKey(req);
    const cached = await readCache(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
      return res.status(cached.statusCode).json(cached.body);
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void writeCache(
          key,
          {
            statusCode: res.statusCode,
            body,
          },
          ttlSeconds,
        );
        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
      }

      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    return next();
  };
};

module.exports = {
  cache,
  parseCacheDuration,
};
