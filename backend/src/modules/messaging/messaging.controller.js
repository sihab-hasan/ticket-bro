'use strict';
const asyncHandler       = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const messagingService   = require('./messaging.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class MessagingController {
  startConversation  = asyncHandler(async (req, res) => { sendCreated(res, 'Conversation started.', { conversation: await messagingService.startConversation(getId(req.user), req.body) }); });
  getConversations   = asyncHandler(async (req, res) => { sendSuccess(res, 'Conversations fetched.', await messagingService.getConversations(getId(req.user), req.query)); });
  getConversation    = asyncHandler(async (req, res) => { sendSuccess(res, 'Conversation fetched.', { conversation: await messagingService.getConversation(req.params.id, getId(req.user)) }); });
  deleteConversation = asyncHandler(async (req, res) => { sendSuccess(res, 'Deleted.', await messagingService.deleteConversation(req.params.id, getId(req.user))); });
  getMessages        = asyncHandler(async (req, res) => { sendSuccess(res, 'Messages fetched.', await messagingService.getMessages(req.params.id, getId(req.user), req.query)); });
  sendMessage        = asyncHandler(async (req, res) => { sendCreated(res, 'Message sent.', { message: await messagingService.sendMessage(req.params.id, getId(req.user), req.body) }); });
  markAsRead         = asyncHandler(async (req, res) => { sendSuccess(res, 'Marked as read.', await messagingService.markAsRead(req.params.id, getId(req.user))); });
  getUnreadCount     = asyncHandler(async (req, res) => { sendSuccess(res, 'Unread count.', await messagingService.getUnreadCount(getId(req.user))); });
}
module.exports = new MessagingController();
