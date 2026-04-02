'use strict';
module.exports = {
  name:        process.env.APP_NAME     || 'TicketBro',
  apiVersion:  process.env.API_VERSION  || 'v1',
  port:        Number(process.env.PORT) || 5000,
  nodeEnv:     process.env.NODE_ENV     || 'development',
  isDev:       (process.env.NODE_ENV || 'development') === 'development',
  isProd:      process.env.NODE_ENV === 'production',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024, // 5MB
};
