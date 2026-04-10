import { useEffect, useRef, useCallback, useState } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { SOCKET_EVENTS, PANEL_EVENT_GROUPS } from '@/config/socket-events.config';

export const useSocket = (events = [], options = {}) => {
  const { 
    autoConnect = true, 
    onEvent, 
    replayEvents = true 
  } = options;
  
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const handlersRef = useRef({});
  const socketRef = useRef(null);

  const handleEvent = useCallback((event, data) => {
    setLastEvent({ event, data, timestamp: Date.now() });
    if (onEvent) {
      onEvent(event, data);
    }
  }, [onEvent]);

  const registerHandlers = useCallback((socket, eventList) => {
    eventList.forEach((eventName) => {
      if (!handlersRef.current[eventName]) {
        handlersRef.current[eventName] = (data) => handleEvent(eventName, data);
        socket.on(eventName, handlersRef.current[eventName]);
      }
    });
  }, [handleEvent]);

  const unregisterHandlers = useCallback((socket, eventList) => {
    eventList.forEach((eventName) => {
      if (handlersRef.current[eventName]) {
        socket.off(eventName, handlersRef.current[eventName]);
        delete handlersRef.current[eventName];
      }
    });
  }, []);

  useEffect(() => {
    if (!autoConnect || events.length === 0) return;

    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      registerHandlers(socket, events);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      unregisterHandlers(socket, events);
    };
  }, [autoConnect, events, registerHandlers, unregisterHandlers]);

  const emit = useCallback((event, data) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((room) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(`join:${room}`);
    }
  }, []);

  const leaveRoom = useCallback((room) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(`leave:${room}`);
    }
  }, []);

  return {
    connected,
    lastEvent,
    emit,
    joinRoom,
    leaveRoom,
  };
};

export const usePanelSocket = (panelType, callbacks = {}) => {
  const events = PANEL_EVENT_GROUPS[panelType] || [];
  
  const handleEvent = useCallback((event, data) => {
    const handler = callbacks[event];
    if (handler) {
      handler(data);
    }
  }, [callbacks]);

  return useSocket(events, { 
    autoConnect: true, 
    onEvent: handleEvent 
  });
};

export default useSocket;