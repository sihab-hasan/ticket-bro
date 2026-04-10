// frontend/src/context/MessagingContext.jsx
//
// Single source of truth for real-time messaging.
// Owns: socket lifecycle, incoming event routing, typing map.
// Redux owns the actual data (conversations, messages, unread count).

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { messagingService } from '@/api';
import useAuth from '@/context/AuthContext';
import messageSoundFile from '@/assets/audio/message.mp3';
import {
  selectConversations,
  setConversations,
  upsertConversation,
  setMessages,
  appendMessage,
  updateConversationLastMessage,
  setUnreadCount,
  incrementUnread,
  incrementConversationUnread,
  markConversationRead,
  markMessageDelivered,
  markAllSentMessagesRead,
} from '@/store/slices/messagingSlice';

const MessagingContext = createContext(null);
const getId = (item) => item?._id || item?.id;

// Play message sound
const playMessageSound = () => {
  try {
    const audio = new Audio(messageSoundFile);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {
    // Silent fail
  }
};

export const MessagingProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const conversations = useSelector(selectConversations);
  const [typingMap, setTypingMap]           = useState({});
  const [activeConversationId, setActive]   = useState(null);
  const typingTimeouts                       = useRef({});
  const conversationsRef                     = useRef(conversations);
  const activeConversationIdRef              = useRef(activeConversationId);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const ensureConversationLoaded = useCallback(async (conversationId) => {
    if (!conversationId) return null;

    const existingConversation = conversationsRef.current.find(
      (conversation) => getId(conversation) === conversationId,
    );

    if (existingConversation) {
      return existingConversation;
    }

    try {
      const conversation = await messagingService.getConversation(conversationId);
      dispatch(upsertConversation(conversation));
      return conversation;
    } catch {
      return null;
    }
  }, [dispatch]);

  // ── Socket lifecycle ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = connectSocket();
    const handleMessageNew = ({ conversationId, message }) => {
      dispatch(appendMessage({ conversationId, message }));
      dispatch(updateConversationLastMessage({ conversationId, message }));

      if (!conversationsRef.current.some((conversation) => getId(conversation) === conversationId)) {
        ensureConversationLoaded(conversationId);
      }

      if (conversationId === activeConversationIdRef.current) {
        messagingService
          .markAsRead(conversationId)
          .then(() => dispatch(markConversationRead({ conversationId })))
          .catch(() => {});
      } else {
        dispatch(incrementUnread());
        dispatch(incrementConversationUnread({ conversationId }));
        playMessageSound();
      }

      socket.emit('message:delivered', {
        conversationId,
        messageId: message?._id || message?.id,
        senderId: message?.senderId || message?.sender?._id || message?.sender?.id,
      });
    };

    const handleConversationUpdated = ({ conversationId, lastMessage, lastMessageAt, senderId }) => {
      dispatch(updateConversationLastMessage({
        conversationId,
        message: { body: lastMessage, content: lastMessage, createdAt: lastMessageAt, senderId },
      }));

      if (!conversationsRef.current.some((conversation) => getId(conversation) === conversationId)) {
        ensureConversationLoaded(conversationId);
      }
    };

    const handleMessageRead = ({ conversationId, readBy }) => {
      dispatch(markAllSentMessagesRead({ conversationId, excludeUserId: readBy }));
    };

    const handleMessageDelivered = ({ conversationId, messageId }) => {
      dispatch(markMessageDelivered({ conversationId, messageId }));
    };

    const handleUserTyping = ({ conversationId, isTyping }) => {
      setTypingMap((prev) => ({ ...prev, [conversationId]: isTyping }));
      if (isTyping) {
        clearTimeout(typingTimeouts.current[conversationId]);
        typingTimeouts.current[conversationId] = setTimeout(() => {
          setTypingMap((prev) => ({ ...prev, [conversationId]: false }));
        }, 3500);
      }
    };

    // New message from another user
    socket.on('message:new', handleMessageNew);

    // Conversation metadata updated (re-sort the list)
    socket.on('conversation:updated', handleConversationUpdated);

    // Read receipt — another participant read messages in a conversation
    socket.on('message:read', handleMessageRead);

    // Message delivered — recipient received the message
    socket.on('message:delivered', handleMessageDelivered);

    // Typing indicators
    socket.on('user:typing', handleUserTyping);

    return () => {
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      typingTimeouts.current = {};
      socket.off('message:new', handleMessageNew);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('message:read', handleMessageRead);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('user:typing', handleUserTyping);
      disconnectSocket();
    };
  }, [dispatch, ensureConversationLoaded, isAuthenticated, user]);

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
    dispatch(setMessages({
      conversationId,
      messages: res.messages || [],
      mode: Number(params?.page || 1) > 1 ? 'prepend' : 'replace',
    }));
    return res;
  }, [dispatch]);

  const sendMessage = useCallback(async (conversationId, payload) => {
    return messagingService.sendMessage(conversationId, payload);
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await messagingService.markAsRead(conversationId);
      dispatch(markConversationRead({ conversationId }));
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
