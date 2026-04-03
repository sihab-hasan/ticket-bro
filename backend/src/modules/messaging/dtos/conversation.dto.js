"use strict";

const { toParticipantDto, getId } = require("./message.dto");

const pickUnreadCount = (unreadCount, userId) => {
  if (!userId || !unreadCount) {
    return 0;
  }

  if (unreadCount instanceof Map) {
    return Number(unreadCount.get(userId.toString()) || 0);
  }

  return Number(unreadCount[userId.toString()] || 0);
};

const toConversationDto = (conversation, currentUserId = null) => {
  if (!conversation) {
    return null;
  }

  const source = conversation.toObject ? conversation.toObject() : conversation;
  const participants = Array.isArray(source.participants)
    ? source.participants.map((participant) => toParticipantDto(participant))
    : [];
  const currentId = currentUserId?.toString?.() || currentUserId || null;
  const otherParticipant =
    participants.find((participant) => participant._id !== currentId) || participants[0] || null;

  return {
    _id: getId(source),
    id: getId(source),
    participants,
    otherParticipant,
    event: source.event
      ? {
          _id: getId(source.event),
          id: getId(source.event),
          title: source.event.title || "",
          slug: source.event.slug || "",
          coverImage: source.event.coverImage || null,
        }
      : null,
    subject:
      source.event?.title ||
      otherParticipant?.name ||
      "Conversation",
    lastMessage: source.lastMessage
      ? {
          content: source.lastMessage,
          body: source.lastMessage,
          senderId: getId(source.lastSenderId),
          createdAt: source.lastMessageAt || source.updatedAt,
        }
      : null,
    lastMessageAt: source.lastMessageAt || source.updatedAt,
    unreadCount: pickUnreadCount(source.unreadCount, currentId),
    isBlocked: Boolean(source.isBlocked),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

module.exports = {
  toConversationDto,
};
