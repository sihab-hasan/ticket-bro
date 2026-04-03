'use strict';
const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../common/middleware/validation.middleware');
const {
  conversationsQuerySchema,
  conversationParamsSchema,
  startConversationSchema,
  sendMessageSchema,
} = require('./messaging.validation');
let _c; const c = () => { if (!_c) _c = require('./messaging.controller'); return _c; };

// authenticate applied in routes.js
router.post('/conversations',                         validateRequest(startConversationSchema), (req,res,next) => c().startConversation(req,res,next));
router.get('/conversations',                          validateRequest(conversationsQuerySchema, 'query'), (req,res,next) => c().getConversations(req,res,next));
router.get('/conversations/:id',                      validateRequest(conversationParamsSchema, 'params'), (req,res,next) => c().getConversation(req,res,next));
router.delete('/conversations/:id',                   validateRequest(conversationParamsSchema, 'params'), (req,res,next) => c().deleteConversation(req,res,next));
router.get('/conversations/:id/messages',             validateRequest(conversationParamsSchema, 'params'), validateRequest(conversationsQuerySchema, 'query'), (req,res,next) => c().getMessages(req,res,next));
router.post('/conversations/:id/messages',            validateRequest(conversationParamsSchema, 'params'), validateRequest(sendMessageSchema), (req,res,next) => c().sendMessage(req,res,next));
router.put('/conversations/:id/read',                 validateRequest(conversationParamsSchema, 'params'), (req,res,next) => c().markAsRead(req,res,next));
router.get('/unread-count',                           (req,res,next) => c().getUnreadCount(req,res,next));
module.exports = router;
