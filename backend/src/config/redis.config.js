'use strict';
// Redis config — returns a client if REDIS_URL is set, otherwise returns null (graceful degradation)
let client = null;

const getRedisClient = () => {
  if (client) return client;
  if (!process.env.REDIS_URL) return null;
  try {
    const { createClient } = require('redis');
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => require('../infrastructure/logger/logger').warn(`Redis error: ${err.message}`));
    client.connect().catch(() => {});
  } catch { client = null; }
  return client;
};

module.exports = { getRedisClient };
