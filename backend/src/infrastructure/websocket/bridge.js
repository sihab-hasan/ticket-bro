"use strict";

// WebSocket bridge to broadcast domain events to connected clients.

// This module subscribes to internal gateways (e.g. messagingGateway) and emits
// corresponding events to connected WebSocket clients via the socketServer.

const messagingGateway = require("../../modules/messaging/messaging.gateway");
const messagingRepository = require("../../modules/messaging/messaging.repository");
const { emitToUser } = require("./socketServer");

// When a new message is created, broadcast it to each recipient's socket room.
messagingGateway.subscribe(
  messagingGateway.EVENTS.MESSAGE_CREATED,
  ({ conversationId, message, recipientIds }) => {
    try {
      if (!Array.isArray(recipientIds)) return;
      recipientIds.forEach((recipientId) => {
        emitToUser(recipientId, "messaging.message.created", {
          conversationId,
          message,
        });
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("WS bridge error (MESSAGE_CREATED):", err);
    }
  },
);

// When a conversation is marked as read, notify the other participants.
messagingGateway.subscribe(
  messagingGateway.EVENTS.CONVERSATION_READ,
  async ({ conversationId, userId }) => {
    try {
      // Fetch conversation participants from repository
      const conv = await messagingRepository.findConversation(conversationId);
      if (!conv || !conv.participants) return;
      const otherIds = conv.participants
        .map((p) => p.toString())
        .filter((id) => id !== String(userId));
      otherIds.forEach((participantId) => {
        emitToUser(participantId, "messaging.conversation.read", {
          conversationId,
          userId,
        });
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("WS bridge error (CONVERSATION_READ):", err);
    }
  },
);