'use strict';

const messagingGateway = require('../../../modules/messaging/messaging.gateway');
const { emitToUser } = require('../socketServer');

const registerChatHandler = (io) => {
  messagingGateway.subscribe(messagingGateway.EVENTS.MESSAGE_CREATED, ({ conversationId, message, recipientIds }) => {
    if (Array.isArray(recipientIds)) {
      recipientIds.forEach((userId) => {
        emitToUser(userId, 'message:new', { conversationId, message });
      });
    }
    const allParticipants = Array.isArray(recipientIds)
      ? [...recipientIds, message?.senderId].filter(Boolean)
      : [];
    allParticipants.forEach((userId) => {
      emitToUser(userId, 'conversation:updated', {
        conversationId,
        lastMessage: message?.body || message?.content || '',
        lastMessageAt: message?.createdAt,
        senderId: message?.senderId,
      });
    });
  });

  messagingGateway.subscribe(messagingGateway.EVENTS.CONVERSATION_READ, ({ conversationId, userId }) => {
    if (io) {
      io.to(`conversation:${conversationId}`).emit('message:read', { conversationId, readBy: userId });
    }
  });
};

const registerSocketChatEvents = (socket) => {
  const userId = socket.user?.id || socket.user?._id;

  socket.on('conversation:join', (conversationId) => {
    if (conversationId) socket.join(`conversation:${conversationId}`);
  });

  socket.on('conversation:leave', (conversationId) => {
    if (conversationId) socket.leave(`conversation:${conversationId}`);
  });

  socket.on('typing:start', ({ conversationId, recipientId }) => {
    if (conversationId && recipientId && userId) {
      emitToUser(recipientId, 'user:typing', { conversationId, userId, isTyping: true });
    }
  });

  socket.on('typing:stop', ({ conversationId, recipientId }) => {
    if (conversationId && recipientId && userId) {
      emitToUser(recipientId, 'user:typing', { conversationId, userId, isTyping: false });
    }
  });
};

module.exports = { registerChatHandler, registerSocketChatEvents };
