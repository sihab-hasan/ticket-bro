"use strict";

const Conversation = require("./conversation.model");
const Message = require("./message.model");

const getId = (value) => value?._id?.toString?.() || value?.id?.toString?.() || value?.toString?.();

class MessagingRepository {
  async findOrCreateConversation(participantIds, eventId = null) {
    const uniqueParticipants = [...new Set(participantIds.map((id) => id.toString()))].sort();
    const filter = {
      participants: { $all: uniqueParticipants, $size: uniqueParticipants.length },
      ...(eventId
        ? { event: eventId }
        : { $or: [{ event: null }, { event: { $exists: false } }] }),
    };

    let conversation = await Conversation.findOne(filter).exec();

    if (!conversation) {
      try {
        conversation = await new Conversation({
          participants: uniqueParticipants,
          event: eventId || null,
          unreadCount: Object.fromEntries(uniqueParticipants.map((participantId) => [participantId, 0])),
        }).save();
      } catch (err) {
        if (err.code === 11000) {
          conversation = await Conversation.findOne(filter).exec();
        } else {
          throw err;
        }
      }
    }

    return conversation;
  }

  async findConversation(id) {
    return Conversation.findById(id)
      .populate("participants", "firstName lastName avatar")
      .populate("event", "title slug coverImage")
      .exec();
  }

  async findConversationParticipantIds(id) {
    const conversation = await Conversation.findById(id).select("participants").lean();
    return Array.isArray(conversation?.participants)
      ? conversation.participants.map((participantId) => participantId.toString())
      : [];
  }

  async findConversationsByUser(userId, page = 1, limit = 20) {
    const filter = {
      participants: userId,
      isBlocked: false,
      deletedBy: { $ne: userId },
    };
    const skip = (Number(page) - 1) * Number(limit);

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .populate("participants", "firstName lastName avatar")
        .populate("event", "title slug coverImage")
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      Conversation.countDocuments(filter),
    ]);

    return {
      conversations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async createMessage(data) {
    const message = await new Message({
      conversation: data.conversation,
      sender: data.sender,
      body: data.body || "",
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
    }).save();

    await message.populate("sender", "firstName lastName avatar");

    const conversation = await Conversation.findById(data.conversation).exec();

    if (conversation) {
      const senderId = getId(data.sender);
      const unreadCount = new Map(
        Object.entries(
          conversation.unreadCount instanceof Map
            ? Object.fromEntries(conversation.unreadCount)
            : conversation.unreadCount || {},
        ),
      );

      conversation.participants.forEach((participantId) => {
        const key = participantId.toString();
        if (key === senderId) {
          unreadCount.set(key, 0);
        } else {
          unreadCount.set(key, Number(unreadCount.get(key) || 0) + 1);
        }
      });

      conversation.unreadCount = Object.fromEntries(unreadCount);
      conversation.lastMessage = data.body || (data.attachments?.length ? "Sent an attachment" : "New message");
      conversation.lastMessageAt = message.createdAt;
      conversation.lastSenderId = data.sender;
      conversation.deletedBy = [];
      await conversation.save();
    }

    return message;
  }

  async findMessages(conversationId, page = 1, limit = 50) {
    const filter = { conversation: conversationId, deletedAt: null };
    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate("sender", "firstName lastName avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Message.countDocuments(filter),
    ]);

    return {
      messages: messages.reverse(),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async markRead(conversationId, userId) {
    const result = await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false, deletedAt: null },
      { $set: { isRead: true, readAt: new Date() } },
    );

    const conversation = await Conversation.findById(conversationId).exec();
    if (conversation) {
      const unreadCount = new Map(
        Object.entries(
          conversation.unreadCount instanceof Map
            ? Object.fromEntries(conversation.unreadCount)
            : conversation.unreadCount || {},
        ),
      );
      unreadCount.set(userId.toString(), 0);
      conversation.unreadCount = Object.fromEntries(unreadCount);
      await conversation.save();
    }

    return result;
  }

  async countUnread(userId) {
    const conversations = await Conversation.find({
      participants: userId,
      deletedBy: { $ne: userId },
      isBlocked: false,
    })
      .select("unreadCount")
      .lean();

    return conversations.reduce((sum, conversation) => {
      return sum + Number(conversation.unreadCount?.[userId.toString()] || 0);
    }, 0);
  }

  async restoreConversationForUser(id, userId) {
    return Conversation.findOneAndUpdate(
      { _id: id, participants: userId },
      { $pull: { deletedBy: userId } },
      { returnDocument: 'after' },
    ).exec();
  }

  async deleteConversation(id, userId) {
    return Conversation.findOneAndUpdate(
      { _id: id, participants: userId },
      { $addToSet: { deletedBy: userId } },
      { returnDocument: 'after' },
    ).exec();
  }
}

module.exports = new MessagingRepository();
