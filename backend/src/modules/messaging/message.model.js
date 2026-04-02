'use strict';
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:         { type: String, trim: true, maxlength: 5000 },
  attachments:  [{ url: String, type: String, name: String }],
  isRead:       { type: Boolean, default: false },
  readAt:       { type: Date },
  deletedAt:    { type: Date, default: null },
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
