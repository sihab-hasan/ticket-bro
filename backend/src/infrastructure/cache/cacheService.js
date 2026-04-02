'use strict';
const { getRedisClient } = require('../../config/redis.config');
const DEFAULT_TTL = 300; // 5 min

class CacheService {
  async get(key) {
    const client = getRedisClient();
    if (!client) return null;
    try { return JSON.parse(await client.get(key)); } catch { return null; }
  }
  async set(key, value, ttl = DEFAULT_TTL) {
    const client = getRedisClient();
    if (!client) return false;
    try { await client.set(key, JSON.stringify(value), { EX: ttl }); return true; } catch { return false; }
  }
  async del(key) {
    const client = getRedisClient();
    if (!client) return false;
    try { await client.del(key); return true; } catch { return false; }
  }
  async flush(pattern) {
    const client = getRedisClient();
    if (!client) return false;
    try { const keys = await client.keys(pattern); if (keys.length) await client.del(keys); return true; } catch { return false; }
  }
}
module.exports = new CacheService();
