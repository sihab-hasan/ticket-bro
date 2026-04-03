'use strict';

const messagingRepository = require('./messaging.repository');
const messagingGateway = require('./messaging.gateway');
const notificationService = require('../notifications/notification.service');
const { toConversationDto } = require('./dtos/conversation.dto');
const { toMessageDto, getId } = require('./dtos/message.dto');
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require('../../common/errors/AppError');

class MessagingService {
  _normalizeMessageText(payload = {}) {
    return String(payload.body || payload.content || payload.message || '').trim();
  }

  async startConversation(userId, payload = {}) {
    const currentUserId = getId(userId);
    const participantId = getId(payload.participantId);

    if (!participantId) {
      throw new BadRequestError('Participant is required.');
    }

    if (participantId === currentUserId) {
      throw new BadRequestError('You cannot start a conversation with yourself.');
    }

    const conversation = await messagingRepository.findOrCreateConversation(
      [currentUserId, participantId],
      payload.eventId || null,
    );

    const initialMessage = this._normalizeMessageText(payload);
    if (initialMessage) {
      await messagingRepository.createMessage({
        conversation: conversation._id,
        sender: currentUserId,
        body: initialMessage,
        attachments: [],
      });
    }

    const populatedConversation = await messagingRepository.findConversation(conversation._id);
    return toConversationDto(populatedConversation, currentUserId);
  }

  async getConversations(userId, query = {}) {
    const result = await messagingRepository.findConversationsByUser(
      getId(userId),
      query.page,
      query.limit,
    );

    return {
      conversations: result.conversations.map((conversation) =>
        toConversationDto(conversation, getId(userId)),
      ),
      pagination: result.pagination,
    };
  }

  async getConversation(id, userId) {
    const conversation = await messagingRepository.findConversation(id);

    if (!conversation) {
      throw new NotFoundError('Conversation not found.');
    }

    const currentUserId = getId(userId);
    const participantIds = conversation.participants.map((participant) => getId(participant));
    if (!participantIds.includes(currentUserId)) {
      throw new ForbiddenError('Access denied.');
    }

    const deletedBy = conversation.deletedBy?.map((entry) => getId(entry)) || [];
    if (deletedBy.includes(currentUserId)) {
      throw new NotFoundError('Conversation not found.');
    }

    return toConversationDto(conversation, currentUserId);
  }

  async deleteConversation(id, userId) {
    await this.getConversation(id, userId);
    await messagingRepository.deleteConversation(id, getId(userId));
    return { message: 'Conversation deleted.' };
  }

  async getMessages(conversationId, userId, query = {}) {
    await this.getConversation(conversationId, userId);

    const result = await messagingRepository.findMessages(
      conversationId,
      query.page,
      query.limit,
    );

    return {
      messages: result.messages.map((message) => toMessageDto(message, getId(userId))),
      pagination: result.pagination,
    };
  }

  async sendMessage(conversationId, userId, payload = {}) {
    const conversation = await this.getConversation(conversationId, userId);
    const body = this._normalizeMessageText(payload);
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

    if (!body && attachments.length === 0) {
      throw new BadRequestError('Message body or at least one attachment is required.');
    }

    const message = await messagingRepository.createMessage({
      conversation: conversationId,
      sender: getId(userId),
      body,
      attachments,
    });

    const messageDto = toMessageDto(message, getId(userId));
    const recipientIds = (conversation.participants || [])
      .map((participant) => getId(participant))
      .filter((participantId) => participantId && participantId !== getId(userId));

    await Promise.all(
      recipientIds.map((recipientId) =>
        notificationService.notify(recipientId, {
          type: 'new_message',
          title: 'New message',
          message: `${messageDto.sender?.name || 'Someone'} sent you a message.`,
          data: { conversationId },
          link: `/messages/conversation/${conversationId}`,
        }),
      ),
    );

    messagingGateway.emitMessageCreated({
      conversationId,
      message: messageDto,
      recipientIds,
    });

    return messageDto;
  }

  async markAsRead(conversationId, userId) {
    await this.getConversation(conversationId, userId);
    await messagingRepository.markRead(conversationId, getId(userId));

    messagingGateway.emitConversationRead({
      conversationId,
      userId: getId(userId),
    });

    return { message: 'Marked as read.' };
  }

  async getUnreadCount(userId) {
    return { count: await messagingRepository.countUnread(getId(userId)) };
  }
}

module.exports = new MessagingService();
