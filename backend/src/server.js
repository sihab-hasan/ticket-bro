'use strict';

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db.config');
const { verifyConnection } = require('./infrastructure/mail/mailClient');
const { initSocketServer } = require('./infrastructure/websocket/socketServer');
const env = require('./config/env');
const logger = require('./infrastructure/logger/logger');

let server;
let io;

const startServer = async () => {
  try {
    await connectDB();

    verifyConnection().then((ok) => {
      if (!ok) logger.warn('Mail server connection failed — emails may not send');
    });

    // Create HTTP server from Express app
    server = http.createServer(app);

    // Attach Socket.io to the same HTTP server
    io = initSocketServer(server);

    server.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════════════╗
║                  Backend Server Started                  ║
╠══════════════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(41)} ║
║  Port        : ${String(env.PORT).padEnd(41)} ║
║  API Prefix  : ${`${env.API_PREFIX}/${env.API_VERSION}`.padEnd(41)} ║
║  WebSocket   : enabled (Socket.io)                       ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDB();
      logger.info('All connections closed. Exiting process.');
      process.exit(0);
    });

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
