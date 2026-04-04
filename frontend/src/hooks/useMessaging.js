// hooks/useMessaging.js
// Unified hook — combines Redux state selectors + MessagingContext actions.
import { useSelector } from 'react-redux';
import { useMessagingContext } from '@/context/MessagingContext';
import {
  selectConversations,
  selectMessages,
  selectUnreadCount,
  selectMessagingLoading,
  selectMessagesLoading,
} from '@/store/slices/messagingSlice';

const useMessaging = (activeConversationId = null) => {
  const ctx = useMessagingContext();

  const conversations = useSelector(selectConversations);
  const messages = useSelector(selectMessages(activeConversationId));
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectMessagingLoading);
  const messagesLoading = useSelector(selectMessagesLoading);
  const isTyping = activeConversationId ? (ctx.typingMap[activeConversationId] ?? false) : false;

  return {
    // State
    conversations,
    messages,
    unreadCount,
    loading,
    messagesLoading,
    isTyping,
    // Actions from context
    loadConversations: ctx.loadConversations,
    loadMessages: ctx.loadMessages,
    sendMessage: ctx.sendMessage,
    markAsRead: ctx.markAsRead,
    joinConversation: ctx.joinConversation,
    leaveConversation: ctx.leaveConversation,
    sendTyping: ctx.sendTyping,
  };
};

export default useMessaging;
