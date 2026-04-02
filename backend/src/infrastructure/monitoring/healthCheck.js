'use strict';
const mongoose = require('mongoose');
const { getRedisClient } = require('../../config/redis.config');

const getHealth = async () => {
  const dbStatus  = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  const redis     = getRedisClient();
  let redisStatus = 'not_configured';
  if (redis) {
    try { await redis.ping(); redisStatus = 'healthy'; } catch { redisStatus = 'unhealthy'; }
  }
  return {
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: { database: dbStatus, redis: redisStatus },
    memory: process.memoryUsage(),
  };
};

module.exports = { getHealth };
