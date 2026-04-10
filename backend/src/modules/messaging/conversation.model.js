'use strict';
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  event:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  lastMessage:  { type: String, trim: true },
  lastMessageAt:{ type: Date },
  lastSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  unreadCount:  { type: Map, of: Number, default: {} },
  isBlocked:    { type: Boolean, default: false },
  deletedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

conversationSchema.index({ participants: 1, event: 1 }, { unique: true, partialFilterExpression: { event: { $exists: true } } });
conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
