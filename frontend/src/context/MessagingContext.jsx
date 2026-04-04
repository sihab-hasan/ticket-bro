// frontend/src/context/MessagingContext.jsx
//
// Single source of truth for real-time messaging.
// Owns: socket lifecycle, incoming event routing, typing map.
// Redux owns the actual data (conversations, messages, unread count).

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { messagingService } from '@/api';
import useAuth from '@/context/AuthContext';
import {
  setConversations,
  upsertConversation,
  setMessages,
  appendMessage,
  updateConversationLastMessage,
  setUnreadCount,
  incrementUnread,
  decrementUnread,
} from '@/store/slices/messagingSlice';

const MessagingContext = createContext(null);

export const MessagingProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [typingMap, setTypingMap]           = useState({});
  const [activeConversationId, setActive]   = useState(null);
  const typingTimeouts                       = useRef({});

  // ── Socket lifecycle ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = connectSocket();

    // New message from another user
    socket.on('message:new', ({ conversationId, message }) => {
      dispatch(appendMessage({ conversationId, message }));
      dispatch(updateConversationLastMessage({ conversationId, message }));
      // Only bump unread when not actively viewing that conversation
      if (conversationId !== activeConversationId) {
        dispatch(incrementUnread());
      }
    });

    // Conversation metadata updated (re-sort the list)
    socket.on('conversation:updated', ({ conversationId, lastMessage, lastMessageAt, senderId }) => {
      dispatch(updateConversationLastMessage({
        conversationId,
        message: { body: lastMessage, content: lastMessage, createdAt: lastMessageAt, senderId },
      }));
    });

    // Read receipt — another participant read messages in a conversation
    socket.on('message:read', ({ conversationId, readBy }) => {
      // Could update isRead on messages — skipping for now (sender sees ticks via optimistic)
    });

    // Typing indicators
    socket.on('user:typing', ({ conversationId, isTyping }) => {
      setTypingMap((prev) => ({ ...prev, [conversationId]: isTyping }));
      if (isTyping) {
        clearTimeout(typingTimeouts.current[conversationId]);
        typingTimeouts.current[conversationId] = setTimeout(() => {
          setTypingMap((prev) => ({ ...prev, [conversationId]: false }));
        }, 3500);
      }
    });

    return () => {
      socket.off('message:new');
      socket.off('conversation:updated');
      socket.off('message:read');
      socket.off('user:typing');
      disconnectSocket();
    };
  }, [isAuthenticated, user, activeConversationId, dispatch]);

  // ── Load unread count on auth ────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setUnreadCount(0));
      return;
    }
    messagingService.getUnreadCount()
      .then((res) => dispatch(setUnreadCount(res?.count ?? 0)))
      .catch(() => {});
  }, [isAuthenticated, dispatch]);

  // ── Public actions ───────────────────────────────────────────
  const loadConversations = useCallback(async (params) => {
    const res = await messagingService.getConversations(params);
    dispatch(setConversations(res.conversations || []));
    return res;
  }, [dispatch]);

  const loadMessages = useCallback(async (conversationId, params) => {
    const res = await messagingService.getMessages(conversationId, params);
    dispatch(setMessages({ conversationId, messages: res.messages || [] }));
    return res;
  }, [dispatch]);

  const sendMessage = useCallback(async (conversationId, payload) => {
    return messagingService.sendMessage(conversationId, payload);
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await messagingService.markAsRead(conversationId);
      dispatch(decrementUnread());
    } catch {
      // non-critical — silently fail
    }
  }, [dispatch]);

  const joinConversation = useCallback((conversationId) => {
    const socket = getSocket();
    if (socket) socket.emit('conversation:join', conversationId);
    setActive(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    const socket = getSocket();
    if (socket) socket.emit('conversation:leave', conversationId);
    setActive(null);
  }, []);

  const sendTyping = useCallback((conversationId, recipientId, isTyping) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId, recipientId });
  }, []);

  const value = {
    typingMap,
    activeConversationId,
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    joinConversation,
    leaveConversation,
    sendTyping,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessagingContext = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessagingContext must be used within MessagingProvider');
  return ctx;
};
