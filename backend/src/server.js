'use strict';

const app = require('./app');
const { connectDB } = require('./config/db.config');
const { verifyConnection } = require('./infrastructure/mail/mailClient');
const env = require('./config/env');
const logger = require('./infrastructure/logger/logger');

let server;

const startServer = async () => {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Verify mail server (non-blocking)
    verifyConnection().then((ok) => {
      if (!ok) logger.warn('Mail server connection failed — emails may not send');
    });

    // 3. Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════════════╗
║              🚀 Auth Backend Server Started              ║
╠══════════════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(41)}║
║  Port        : ${String(env.PORT).padEnd(41)}║
║  API Prefix  : ${`${env.API_PREFIX}/${env.API_VERSION}`.padEnd(41)}║
║  Auth API    : ${`${env.BACKEND_URL}${env.API_PREFIX}/${env.API_VERSION}/auth`.padEnd(41)}║
╚══════════════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      const { disconnectDB } = require('./src/config/db.config');
      await disconnectDB();
      logger.info('All connections closed. Exiting process.');
      process.exit(0);
    });

    // Force shutdown after 30s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
