'use strict';
const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('./socketAuth');
const logger = require('../logger/logger');

let io = null;

const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','), credentials: true },
    transports: ['websocket','polling'],
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    if (userId) socket.join(`user:${userId}`);
    logger.info(`WS connected: ${socket.id} (user: ${userId || 'anon'})`);

    socket.on('join:event', (eventId) => socket.join(`event:${eventId}`));
    socket.on('leave:event', (eventId) => socket.leave(`event:${eventId}`));

    socket.on('disconnect', () => { logger.debug(`WS disconnected: ${socket.id}`); });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

const emitToEvent = (eventId, event, data) => {
  if (io) io.to(`event:${eventId}`).emit(event, data);
};

module.exports = { initSocketServer, getIO, emitToUser, emitToEvent };
