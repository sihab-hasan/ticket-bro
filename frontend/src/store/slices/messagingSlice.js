// store/slices/messagingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const getId = (item) => item?._id || item?.id;

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
      state.conversations = payload;
    },

    upsertConversation(state, { payload }) {
      const idx = state.conversations.findIndex((c) => getId(c) === getId(payload));
      if (idx >= 0) {
        state.conversations[idx] = { ...state.conversations[idx], ...payload };
      } else {
        state.conversations.unshift(payload);
      }
    },

    removeConversation(state, { payload: conversationId }) {
      state.conversations = state.conversations.filter((c) => getId(c) !== conversationId);
      delete state.messagesByConversation[conversationId];
    },

    setMessages(state, { payload: { conversationId, messages } }) {
      state.messagesByConversation[conversationId] = messages;
    },

    appendMessage(state, { payload: { conversationId, message } }) {
      const existing = state.messagesByConversation[conversationId] || [];
      const alreadyExists = existing.some((m) => getId(m) === getId(message));
      if (!alreadyExists) {
        state.messagesByConversation[conversationId] = [...existing, message];
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

    updateConversationLastMessage(state, { payload: { conversationId, message } }) {
      const idx = state.conversations.findIndex((c) => getId(c) === conversationId);
      if (idx >= 0) {
        state.conversations[idx] = {
          ...state.conversations[idx],
          lastMessage: { body: message?.body || message?.content || '', content: message?.body || message?.content || '' },
          lastMessageAt: message?.createdAt || new Date().toISOString(),
        };
        // Re-sort: most recent first
        const updated = [...state.conversations];
        const [conv] = updated.splice(idx, 1);
        state.conversations = [conv, ...updated];
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
