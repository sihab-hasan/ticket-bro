"use strict";

const Joi = require("joi");

const objectId = Joi.string().trim().hex().length(24);

const messageText = Joi.string().trim().max(5000).allow("", null);

const attachmentSchema = Joi.object({
  url: Joi.string().trim().uri().required(),
  type: Joi.string().trim().max(100).allow("", null).default(""),
  name: Joi.string().trim().max(255).allow("", null).default(""),
});

const conversationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const conversationParamsSchema = Joi.object({
  id: objectId.required(),
});

const startConversationSchema = Joi.object({
  participantId: objectId.required(),
  eventId: objectId.allow("", null).optional(),
  message: messageText.optional(),
  body: messageText.optional(),
  content: messageText.optional(),
}).custom((value, helpers) => {
  const message = value.message || value.body || value.content;
  if (message && !String(message).trim()) {
    return helpers.error("any.invalid");
  }

  return value;
}, "start conversation message validation");

const sendMessageSchema = Joi.object({
  body: messageText.optional(),
  content: messageText.optional(),
  attachments: Joi.array().items(attachmentSchema).max(5).default([]),
}).custom((value, helpers) => {
  const text = value.body || value.content || "";
  const hasText = Boolean(String(text).trim());
  const hasAttachments = Array.isArray(value.attachments) && value.attachments.length > 0;

  if (!hasText && !hasAttachments) {
    return helpers.message("Message body or at least one attachment is required.");
  }

  return value;
}, "send message validation");

module.exports = {
  conversationsQuerySchema,
  conversationParamsSchema,
  startConversationSchema,
  sendMessageSchema,
};
