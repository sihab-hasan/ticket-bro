// store/slices/messagingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const getId = (item) => item?._id || item?.id;
const toTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sortConversations = (conversations = []) =>
  [...conversations].sort(
    (left, right) => toTimestamp(right?.lastMessageAt || right?.updatedAt) - toTimestamp(left?.lastMessageAt || left?.updatedAt),
  );

const mergeMessages = (messages = []) => {
  const byId = new Map();

  messages.forEach((message, index) => {
    const id = getId(message) || `idx-${index}`;
    byId.set(id, message);
  });

  return [...byId.values()].sort(
    (left, right) => toTimestamp(left?.createdAt || left?.updatedAt) - toTimestamp(right?.createdAt || right?.updatedAt),
  );
};

const initialState = {
  conversations: [],           // ConversationDto[]
  messagesByConversation: {},  // { [conversationId]: MessageDto[] }
  unreadCount: 0,
  loading: false,
  messagesLoading: false,
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setConversations(state, { payload }) {
      state.conversations = sortConversations(payload);
    },

    upsertConversation(state, { payload }) {
      const idx = state.conversations.findIndex((c) => getId(c) === getId(payload));
      if (idx >= 0) {
        state.conversations[idx] = { ...state.conversations[idx], ...payload };
      } else {
        state.conversations.unshift(payload);
      }
      state.conversations = sortConversations(state.conversations);
    },

    removeConversation(state, { payload: conversationId }) {
      state.conversations = state.conversations.filter((c) => getId(c) !== conversationId);
      delete state.messagesByConversation[conversationId];
    },

    setMessages(state, { payload: { conversationId, messages, mode = 'replace' } }) {
      const existing = state.messagesByConversation[conversationId] || [];

      if (mode === 'prepend') {
        state.messagesByConversation[conversationId] = mergeMessages([...messages, ...existing]);
        return;
      }

      if (mode === 'append') {
        state.messagesByConversation[conversationId] = mergeMessages([...existing, ...messages]);
        return;
      }

      state.messagesByConversation[conversationId] = mergeMessages(messages);
    },

    appendMessage(state, { payload: { conversationId, message } }) {
      const existing = state.messagesByConversation[conversationId] || [];
      const alreadyExists = existing.some((m) => getId(m) === getId(message));
      if (!alreadyExists) {
        state.messagesByConversation[conversationId] = mergeMessages([...existing, message]);
      }
    },

    replaceOptimisticMessage(state, { payload: { conversationId, tempId, message } }) {
      const msgs = state.messagesByConversation[conversationId] || [];
      state.messagesByConversation[conversationId] = msgs.map((m) =>
        getId(m) === tempId ? message : m
      );
    },

    removeMessage(state, { payload: { conversationId, messageId } }) {
      const msgs = state.messagesByConversation[conversationId] || [];
      state.messagesByConversation[conversationId] = msgs.filter((m) => getId(m) !== messageId);
    },

    incrementConversationUnread(state, { payload: { conversationId } }) {
      const idx = state.conversations.findIndex((c) => getId(c) === conversationId);
      if (idx >= 0) {
        const currentUnread = Number(state.conversations[idx]?.unreadCount || 0);
        state.conversations[idx] = {
          ...state.conversations[idx],
          unreadCount: currentUnread + 1,
        };
      }
    },

    markConversationRead(state, { payload: { conversationId } }) {
      const idx = state.conversations.findIndex((c) => getId(c) === conversationId);
      if (idx >= 0) {
        const unreadCount = Number(state.conversations[idx]?.unreadCount || 0);
        state.unreadCount = Math.max(0, state.unreadCount - unreadCount);
        state.conversations[idx] = {
          ...state.conversations[idx],
          unreadCount: 0,
        };
      }
    },

    updateMessageStatus(state, { payload: { conversationId, messageId, status } }) {
      const msgs = state.messagesByConversation[conversationId] || [];
      const msgIndex = msgs.findIndex((m) => getId(m) === messageId);
      if (msgIndex >= 0) {
        const msg = msgs[msgIndex];
        const currentStatus = msg.status || 'sent';
        const statusOrder = { pending: 0, sent: 1, delivered: 2, read: 3 };
        if ((statusOrder[status] || 0) >= (statusOrder[currentStatus] || 0)) {
          msgs[msgIndex] = { ...msg, status };
        }
      }
    },

    markMessageDelivered(state, { payload: { conversationId, messageId } }) {
      const msgs = state.messagesByConversation[conversationId] || [];
      const msgIndex = msgs.findIndex((m) => getId(m) === messageId);
      if (msgIndex >= 0) {
        const msg = msgs[msgIndex];
        if (msg.status !== 'read' && msg.status !== 'delivered') {
          msgs[msgIndex] = { ...msg, status: 'delivered' };
        }
      }
    },

    markMessageRead(state, { payload: { conversationId, messageId } }) {
      const msgs = state.messagesByConversation[conversationId] || [];
      const msgIndex = msgs.findIndex((m) => getId(m) === messageId);
      if (msgIndex >= 0) {
        msgs[msgIndex] = { ...msgs[msgIndex], status: 'read', isRead: true };
      }
    },

    markAllSentMessagesRead(state, { payload: { conversationId, excludeUserId } }) {
      const msgs = state.messagesByConversation[conversationId] || [];
      msgs.forEach((msg) => {
        if (msg.senderId !== excludeUserId && msg.status !== 'read') {
          msg.status = 'read';
          msg.isRead = true;
        }
      });
    },

    updateConversationLastMessage(state, { payload: { conversationId, message } }) {
      const idx = state.conversations.findIndex((c) => getId(c) === conversationId);
      if (idx >= 0) {
        state.conversations[idx] = {
          ...state.conversations[idx],
          lastMessage: { body: message?.body || message?.content || '', content: message?.body || message?.content || '' },
          lastMessageAt: message?.createdAt || new Date().toISOString(),
        };
        state.conversations = sortConversations(state.conversations);
      }
    },

    setUnreadCount(state, { payload }) {
      state.unreadCount = payload;
    },

    incrementUnread(state) {
      state.unreadCount += 1;
    },

    decrementUnread(state) {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },

    setLoading(state, { payload }) {
      state.loading = payload;
    },

    setMessagesLoading(state, { payload }) {
      state.messagesLoading = payload;
    },
  },
});

export const {
  setConversations, upsertConversation, removeConversation,
  setMessages, appendMessage, replaceOptimisticMessage, removeMessage,
  incrementConversationUnread, markConversationRead,
  updateMessageStatus, markMessageDelivered, markMessageRead, markAllSentMessagesRead,
  updateConversationLastMessage,
  setUnreadCount, incrementUnread, decrementUnread,
  setLoading, setMessagesLoading,
} = messagingSlice.actions;

// Selectors
export const selectConversations = (s) => s.messaging.conversations;
export const selectMessages = (conversationId) => (s) =>
  s.messaging.messagesByConversation[conversationId] || [];
export const selectUnreadCount = (s) => s.messaging.unreadCount;
export const selectMessagingLoading = (s) => s.messaging.loading;
export const selectMessagesLoading = (s) => s.messaging.messagesLoading;

export default messagingSlice.reducer;
