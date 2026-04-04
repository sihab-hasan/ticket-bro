'use strict';
const { Server } = require('socket.io');
const { socketAuth: socketAuthMiddleware } = require('./socketAuth');
const logger = require('../logger/logger');

let io = null;

const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(socketAuthMiddleware);

  // Import chat handler here (after io is created) to avoid circular dep issues
  const { registerChatHandler, registerSocketChatEvents } = require('./handlers/chat.handler');
  registerChatHandler(io);

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    if (userId) socket.join(`user:${userId}`);
    logger.info(`WS connected: ${socket.id} (user: ${userId || 'anon'})`);

    socket.on('join:event', (eventId) => socket.join(`event:${eventId}`));
    socket.on('leave:event', (eventId) => socket.leave(`event:${eventId}`));

    // Register chat-specific per-socket events
    registerSocketChatEvents(socket);

    socket.on('disconnect', () => {
      logger.debug(`WS disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, data) => {
  if (io && userId) io.to(`user:${userId}`).emit(event, data);
};

const emitToEvent = (eventId, event, data) => {
  if (io) io.to(`event:${eventId}`).emit(event, data);
};

module.exports = { initSocketServer, getIO, emitToUser, emitToEvent };
