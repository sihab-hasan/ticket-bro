'use strict';

// DNS override must come after 'use strict'
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db.config');
const { verifyConnection } = require('./infrastructure/mail/mailClient');
const env = require('./config/env');
const logger = require('./infrastructure/logger/logger');

let server;
// WebSocket server instance
let io;

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
║                  Backend Server Started                  ║
╠══════════════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(41)} ║
║  Port        : ${String(env.PORT).padEnd(41)} ║
║  API Prefix  : ${`${env.API_PREFIX}/${env.API_VERSION}`.padEnd(41)} ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    // 4. Optionally initialize WebSocket server
    try {
      const { initSocketServer } = require('./infrastructure/websocket/socketServer');
      // Initialize WebSocket server only if not already running and environment allows it
      io = initSocketServer(server);
      // Register bridge to forward domain events to sockets
      require('./infrastructure/websocket/bridge');
      logger.info('WebSocket server initialized');
    } catch (wsErr) {
      logger.warn(`WebSocket initialization failed: ${wsErr.message}`);
    }

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
      // FIX: was require('./src/config/db.config') — wrong nested path
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
