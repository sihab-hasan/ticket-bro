'use strict';
const Conversation = require('./conversation.model');
const Message      = require('./message.model');

class MessagingRepository {
  async findOrCreateConversation(participantIds, eventId=null) {
    const sorted = [...participantIds].sort();
    let conv = await Conversation.findOne({ participants: { $all: sorted, $size: sorted.length } }).exec();
    if (!conv) conv = await new Conversation({ participants: sorted, event: eventId }).save();
    return conv;
  }
  async findConversation(id) { return Conversation.findById(id).populate('participants','firstName lastName avatar').exec(); }
  async findConversationsByUser(userId, page=1, limit=20) {
    const filter = { participants: userId, isBlocked: false };
    const skip = (Number(page)-1)*Number(limit);
    const [conversations, total] = await Promise.all([
      Conversation.find(filter).populate('participants','firstName lastName avatar').sort('-lastMessageAt').skip(skip).limit(Number(limit)).lean(),
      Conversation.countDocuments(filter),
    ]);
    return { conversations, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async createMessage(data) {
    const msg = await new Message(data).save();
    await Conversation.findByIdAndUpdate(data.conversation, {
      lastMessage: data.body?.slice(0,100), lastMessageAt: new Date(), lastSenderId: data.sender,
    });
    return msg;
  }
  async findMessages(conversationId, page=1, limit=50) {
    const filter = { conversation: conversationId, deletedAt: null };
    const skip = (Number(page)-1)*Number(limit);
    const [messages, total] = await Promise.all([
      Message.find(filter).populate('sender','firstName lastName avatar').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Message.countDocuments(filter),
    ]);
    return { messages: messages.reverse(), pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async markRead(conversationId, userId) {
    return Message.updateMany({ conversation: conversationId, sender: { $ne: userId }, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  }
  async countUnread(userId) {
    return Message.countDocuments({ isRead: false, sender: { $ne: userId }, deletedAt: null });
  }
  async deleteConversation(id, userId) {
    return Conversation.findByIdAndUpdate(id, { $addToSet: { deletedBy: userId } }).exec();
  }
}
module.exports = new MessagingRepository();
