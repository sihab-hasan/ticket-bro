// api/messaging.api.js
import { ENDPOINTS } from '@/config/api.config';
import { del, get, post, put, pickEntity, pickPaginated } from '@/api/client';

const pickConversations = (payload) => {
  const result = pickPaginated('conversations')(payload);
  return {
    conversations: result.items,
    pagination:    result.pagination,
    total:         result.total,
  };
};

const pickMessages = (payload) => {
  const result = pickPaginated('messages')(payload);
  return {
    messages:   result.items,
    pagination: result.pagination,
    total:      result.total,
  };
};

// getUnreadCount: backend returns { count: N }
// unwrapApiResponse extracts response.data.data -> payload = { count: N }
const pickUnreadCount = (payload) => ({
  count: Number(payload?.count ?? 0),
});

const messagingService = {
  startConversation: (data) =>
    post(ENDPOINTS.MESSAGING.CONVERSATIONS, data, {
      select: pickEntity('conversation'),
    }),

  getConversations: (params) =>
    get(ENDPOINTS.MESSAGING.CONVERSATIONS, {
      params,
      select: pickConversations,
    }),

  getConversation: (id) =>
    get(ENDPOINTS.MESSAGING.CONVERSATION(id), {
      select: pickEntity('conversation'),
    }),

  deleteConversation: (id) => del(ENDPOINTS.MESSAGING.CONVERSATION(id)),

  getMessages: (id, params) =>
    get(ENDPOINTS.MESSAGING.MESSAGES(id), {
      params,
      select: pickMessages,
    }),

  sendMessage: (id, data) =>
    post(ENDPOINTS.MESSAGING.MESSAGES(id), data, {
      select: pickEntity('message'),
    }),

  markAsRead: (id) => put(ENDPOINTS.MESSAGING.MARK_READ(id), {}),

  getUnreadCount: () =>
    get(ENDPOINTS.MESSAGING.UNREAD, {
      select: pickUnreadCount,
    }),
};

export default messagingService;
