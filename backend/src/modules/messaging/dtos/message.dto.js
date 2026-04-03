"use strict";

const getId = (value) => value?._id?.toString?.() || value?.id?.toString?.() || value?.toString?.() || null;

const toParticipantDto = (user) => ({
  _id: getId(user),
  id: getId(user),
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  name: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Unknown",
  avatar: user?.avatar || null,
});

const toMessageDto = (message, currentUserId = null) => {
  if (!message) {
    return null;
  }

  const source = message.toObject ? message.toObject() : message;
  const senderId = getId(source.sender);

  return {
    _id: getId(source),
    id: getId(source),
    conversationId: getId(source.conversation),
    senderId,
    sender: source.sender ? toParticipantDto(source.sender) : null,
    body: source.body || "",
    content: source.body || "",
    attachments: Array.isArray(source.attachments) ? source.attachments : [],
    isRead: Boolean(source.isRead),
    readAt: source.readAt || null,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    pending: false,
    isOwnMessage: currentUserId ? senderId === currentUserId.toString() : false,
  };
};

module.exports = {
  toParticipantDto,
  toMessageDto,
  getId,
};
