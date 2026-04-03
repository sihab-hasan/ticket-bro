"use strict";

const { EventEmitter } = require("events");

const gateway = new EventEmitter();

const EVENTS = Object.freeze({
  MESSAGE_CREATED: "messaging.message.created",
  CONVERSATION_READ: "messaging.conversation.read",
});

const emitMessageCreated = (payload) => gateway.emit(EVENTS.MESSAGE_CREATED, payload);
const emitConversationRead = (payload) => gateway.emit(EVENTS.CONVERSATION_READ, payload);
const subscribe = (eventName, listener) => gateway.on(eventName, listener);
const unsubscribe = (eventName, listener) => gateway.off(eventName, listener);

module.exports = {
  EVENTS,
  emitMessageCreated,
  emitConversationRead,
  subscribe,
  unsubscribe,
};
