'use strict';
const messagingRepository = require('./messaging.repository');
const { NotFoundError, ForbiddenError } = require('../../common/errors/AppError');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class MessagingService {
  async startConversation(userId, { participantId, eventId, message }) {
    const conv = await messagingRepository.findOrCreateConversation([userId, participantId], eventId);
    if (message) await messagingRepository.createMessage({ conversation: conv._id, sender: userId, body: message });
    return conv;
  }
  async getConversations(userId, query={}) { return messagingRepository.findConversationsByUser(userId, query.page, query.limit); }
  async getConversation(id, userId) {
    const conv = await messagingRepository.findConversation(id);
    if (!conv) throw new NotFoundError('Conversation not found.');
    const ids = conv.participants.map(p => p._id?.toString() || p.toString());
    if (!ids.includes(userId.toString())) throw new ForbiddenError('Access denied.');
    return conv;
  }
  async deleteConversation(id, userId) { await messagingRepository.deleteConversation(id, userId); return { message: 'Conversation deleted.' }; }
  async getMessages(conversationId, userId, query={}) {
    await this.getConversation(conversationId, userId);
    return messagingRepository.findMessages(conversationId, query.page, query.limit);
  }
  async sendMessage(conversationId, userId, { body, attachments=[] }) {
    await this.getConversation(conversationId, userId);
    return messagingRepository.createMessage({ conversation: conversationId, sender: userId, body, attachments });
  }
  async markAsRead(conversationId, userId) { await messagingRepository.markRead(conversationId, userId); return { message: 'Marked as read.' }; }
  async getUnreadCount(userId) { return { count: await messagingRepository.countUnread(userId) }; }
}
module.exports = new MessagingService();
