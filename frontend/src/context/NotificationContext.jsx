// frontend/src/contexts/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import notificationsService from "@/api/notifications.api";
import useAuth from "./AuthContext";
import { connectSocket } from "@/lib/socket";
import { playAppSound } from "@/lib/appSound";
import notificationSoundFile from "@/assets/audio/notification.mp3";

const NotificationContext = createContext(null);

// Notification types
export const NotificationType = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  BOOKING: "booking",
  PAYMENT: "payment",
  EVENT: "event",
  PROMO: "promo",
  REMINDER: "reminder",
  SYSTEM: "system",
};

// Notification priorities
export const NotificationPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Notification channels
export const NotificationChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
  WHATSAPP: "whatsapp",
};

// Default preferences
const DEFAULT_PREFERENCES = {
  soundEnabled: true,
  doNotDisturb: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
};

const mergePreferences = (incoming = {}) => ({
  ...DEFAULT_PREFERENCES,
  ...incoming,
  soundEnabled: incoming?.soundEnabled ?? DEFAULT_PREFERENCES.soundEnabled,
  doNotDisturb: {
    ...DEFAULT_PREFERENCES.doNotDisturb,
    ...(incoming?.doNotDisturb || {}),
  },
});
const getNotificationId = (notification) => notification?.id || notification?._id;

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    priority: null,
    isRead: null,
    dateFrom: null,
    dateTo: null,
  });

  const pollingInterval = useRef(null);
  const isInitialized = useRef(false);
  const notificationsRef = useRef([]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Play notification sound function
  const playNotificationSound = useCallback(() => {
    playAppSound(notificationSoundFile, {
      volume: 0.5,
      soundEnabled: preferences.soundEnabled,
      doNotDisturb: preferences.doNotDisturb,
    });
  }, [preferences.soundEnabled, preferences.doNotDisturb]);

  // Show browser notification
  const showBrowserNotification = useCallback(
    (title, options = {}) => {
      if (isPushEnabled && Notification.permission === "granted") {
        new Notification(title, {
          icon: "/favicon.ico",
          vibrate: [200, 100, 200],
          ...options,
        });
      }
    },
    [isPushEnabled],
  );

  const upsertNotification = useCallback(
    (notification, { playAlert = false } = {}) => {
      if (!notification) {
        return false;
      }

      const notificationId = getNotificationId(notification);
      const alreadyExists = notificationId
        ? notificationsRef.current.some(
            (currentNotification) => getNotificationId(currentNotification) === notificationId,
          )
        : false;

      setNotifications((prev) => {
        if (!notificationId) {
          return [notification, ...prev];
        }

        const existingNotification = prev.find(
          (currentNotification) => getNotificationId(currentNotification) === notificationId,
        );
        const remainingNotifications = prev.filter(
          (currentNotification) => getNotificationId(currentNotification) !== notificationId,
        );

        return [
          existingNotification
            ? { ...existingNotification, ...notification }
            : notification,
          ...remainingNotifications,
        ];
      });

      if (!alreadyExists && playAlert) {
        playNotificationSound();
        showBrowserNotification(notification.title, {
          body: notification.message,
          data: notification.data,
          tag: notificationId,
          renotify: true,
        });
      }

      return !alreadyExists;
    },
    [playNotificationSound, showBrowserNotification],
  );

  // Add new notification
  const addNotification = useCallback(
    (notification) => {
      upsertNotification(notification, { playAlert: true });
    },
    [upsertNotification],
  );

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId || notif._id === notificationId
          ? { ...notif, isRead: true, readAt: new Date().toISOString() }
          : notif,
      ),
    );

    try {
      await notificationsService.markRead(notificationId).catch(() => {});
    } catch {
      // Silent fail
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        isRead: true,
        readAt: new Date().toISOString(),
      })),
    );

    try {
      await notificationsService.markAllRead().catch(() => {});
    } catch {
      // Silent fail
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId && notif._id !== notificationId),
    );

    try {
      await notificationsService.deleteOne(notificationId).catch(() => {});
    } catch {
      // Silent fail
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);

    try {
      await notificationsService.clearAll().catch(() => {});
    } catch {
      // Silent fail
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPrefs) => {
      const nextPreferences = mergePreferences(newPrefs);
      setPreferences(nextPreferences);

      try {
        const savedPreferences = await notificationsService
          .updatePreferences(nextPreferences)
          .catch(() => null);

        if (savedPreferences) {
          const mergedPreferences = mergePreferences(savedPreferences);
          setPreferences(mergedPreferences);
          return mergedPreferences;
        }
      } catch {
        // Silent fail
      }

      return nextPreferences;
    },
    [],
  );

  // Toggle sound
  const toggleSound = useCallback((enabled) => {
    setPreferences((prev) => {
      const nextPreferences = mergePreferences({ ...prev, soundEnabled: enabled });
      notificationsService.updatePreferences(nextPreferences).catch(() => null);
      return nextPreferences;
    });
  }, []);

  // Toggle do not disturb
  const toggleDoNotDisturb = useCallback((enabled, startTime, endTime) => {
    setPreferences((prev) => {
      const nextPreferences = mergePreferences({
        ...prev,
        doNotDisturb: { enabled, startTime, endTime },
      });
      notificationsService.updatePreferences(nextPreferences).catch(() => null);
      return nextPreferences;
    });
  }, []);

  // Get filtered notifications
  const filteredNotifications = useCallback(() => {
    return notifications.filter((notif) => {
      if (filters.type && notif.type !== filters.type) return false;
      if (filters.priority && notif.priority !== filters.priority) return false;
      if (filters.isRead !== null && notif.isRead !== filters.isRead)
        return false;
      return !notif.isArchived;
    });
  }, [notifications, filters]);

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationsService.getAll({ limit: 20 });
      setNotifications(result?.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      const serverPrefs = await notificationsService.getPreferences().catch(() => null);
      setPreferences(mergePreferences(serverPrefs || {}));
    } catch {
      setPreferences(mergePreferences());
    }
  };

  // Initialize push notifications
  const initializePushNotifications = async () => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      const permission = await Notification.requestPermission();
      setIsPushEnabled(permission === "granted");
    }
  };

  // Check for new notifications
  const checkForNewNotifications = async () => {
    try {
      const result = await notificationsService.getAll({ limit: 1 });
      const latestNotif = result?.notifications?.[0];
      if (latestNotif && notificationsRef.current.length > 0) {
        const newest = notificationsRef.current[0];
        if (getNotificationId(latestNotif) !== getNotificationId(newest)) {
          upsertNotification(latestNotif, { playAlert: true });
        }
      }
    } catch {
      // Silent fail
    }
  };

  // Start polling for real-time updates
  const startPolling = () => {
    pollingInterval.current = setInterval(() => {
      checkForNewNotifications();
    }, 30000);
  };

  // Load notifications for authenticated user
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized.current) {
      isInitialized.current = true;
      loadNotifications();
      loadPreferences();
      initializePushNotifications();
      startPolling();
    } else if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }

    return () => {
      isInitialized.current = false;
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isAuthenticated, user]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = connectSocket();

    const handleNotificationCreated = (data) => {
      const { notification } = data;
      if (notification && (notification.user === user._id || notification.user === user.id)) {
        upsertNotification(notification, { playAlert: true });
      }
    };

    socket.on("notification.created", handleNotificationCreated);

    return () => {
      socket.off("notification.created", handleNotificationCreated);
    };
  }, [isAuthenticated, upsertNotification, user]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    isPushEnabled,
    filters,
    filteredNotifications: filteredNotifications(),
    unreadNotifications: notifications.filter((n) => !n.isRead && !n.isArchived),
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    setFilters,
    updatePreferences,
    toggleSound,
    toggleDoNotDisturb,
    initializePushNotifications,
    cleanupExpired: () => {},
    NotificationType,
    NotificationPriority,
    NotificationChannel,
    hasUnread: unreadCount > 0,
    totalCount: notifications.length,
    playNotificationSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
