// frontend/src/lib/socket.js
//
// Socket.IO client with access-token auth.
// The access token is read from in-memory storageUtils (NOT from localStorage or cookies).

import { io } from 'socket.io-client';
import { storageUtils } from '@/utils/storageUtils';
import authConfig from '@/config/auth.config';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || authConfig.apiBaseUrl.replace('/api/v1', '');

let socket = null;
let consumerCount = 0;

/**
 * Create and connect a socket, attaching the current access token.
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = () => {
  const token = storageUtils.getAccessToken();
  if (!token) {
    return null;
  }

  consumerCount += 1;

  if (socket) {
    socket.auth = {
      ...(socket.auth || {}),
      token,
    };

    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    // FIX: access token goes in auth object, NOT httpOnly cookie.
    // The httpOnly cookie is browser-only and inaccessible to the WS client.
    auth: {
      token,
    },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.debug('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.debug('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
};

/**
 * Disconnect and destroy the socket instance.
 */
export const disconnectSocket = () => {
  if (!socket) {
    consumerCount = 0;
    return;
  }

  consumerCount = Math.max(consumerCount - 1, 0);

  if (consumerCount > 0) {
    return;
  }

  socket.disconnect();
  socket = null;
};

/**
 * Reconnect with a refreshed access token.
 * Call this after a silent token refresh so the socket re-authenticates.
 */
export const reconnectSocket = () => {
  consumerCount = 0;
  disconnectSocket();
  return connectSocket();
};

/**
 * Get the current socket instance (or null if not connected).
 */
export const getSocket = () => socket;

export default { connectSocket, disconnectSocket, reconnectSocket, getSocket };
