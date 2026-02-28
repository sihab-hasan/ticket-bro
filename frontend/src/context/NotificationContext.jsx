// frontend/src/contexts/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import useAuth from "./AuthContext";

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

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: "notif_1",
    userId: "3",
    type: NotificationType.BOOKING,
    title: "Booking Confirmed!",
    message:
      "Your tickets for Taylor Swift: The Eras Tour have been confirmed.",
    data: { bookingId: "booking_1", eventId: "event_1" },
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
    actions: [
      { label: "View Booking", url: "/bookings/booking_1", primary: true },
      { label: "Download Tickets", action: "download_tickets" },
    ],
  },
  {
    id: "notif_2",
    userId: "3",
    type: NotificationType.PAYMENT,
    title: "Payment Successful",
    message: "Your payment of $399.98 has been processed successfully.",
    data: { paymentId: "pay_123456", amount: 399.98 },
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    actions: [{ label: "View Receipt", url: "/payments/details/pay_123456" }],
  },
  {
    id: "notif_3",
    userId: "3",
    type: NotificationType.REMINDER,
    title: "Event Tomorrow: NBA Finals",
    message: "Don't forget! NBA Finals Game 7 is tomorrow at 8:00 PM.",
    data: { eventId: "event_2", venue: "Madison Square Garden" },
    priority: NotificationPriority.HIGH,
    channels: [
      NotificationChannel.IN_APP,
      NotificationChannel.PUSH,
      NotificationChannel.SMS,
    ],
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day
    actions: [
      { label: "View Event", url: "/events/event_2" },
      { label: "Get Directions", action: "get_directions" },
    ],
  },
  {
    id: "notif_4",
    userId: "3",
    type: NotificationType.PROMO,
    title: "Early Bird Special!",
    message: "Get 20% off on all summer concerts. Use code: SUMMER20",
    data: { promoCode: "SUMMER20", discount: 20 },
    priority: NotificationPriority.LOW,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
    actions: [
      { label: "Browse Events", url: "/search?promo=SUMMER20", primary: true },
    ],
  },
  {
    id: "notif_5",
    userId: "3",
    type: NotificationType.EVENT,
    title: "New Event in Your Area",
    message: "Drake is coming to your city! Tickets on sale Friday.",
    data: { artistId: "artist_2", city: "New York" },
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    isRead: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days
    actions: [
      { label: "Set Reminder", action: "set_reminder" },
      { label: "View Artist", url: "/artists/artist_2" },
    ],
  },
  {
    id: "notif_6",
    userId: "3",
    type: NotificationType.SYSTEM,
    title: "App Update Available",
    message: "Version 2.5.0 is now available with new features.",
    data: { version: "2.5.0", releaseNotes: "/release-notes" },
    priority: NotificationPriority.LOW,
    channels: [NotificationChannel.IN_APP],
    isRead: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days
    actions: [
      { label: "Update Now", action: "update_app", primary: true },
      { label: "Release Notes", url: "/release-notes" },
    ],
  },
];

// Notification preferences
const DEFAULT_PREFERENCES = {
  [NotificationType.BOOKING]: {
    inApp: true,
    email: true,
    push: true,
    sms: false,
    whatsapp: false,
  },
  [NotificationType.PAYMENT]: {
    inApp: true,
    email: true,
    push: true,
    sms: true,
    whatsapp: false,
  },
  [NotificationType.EVENT]: {
    inApp: true,
    email: true,
    push: true,
    sms: false,
    whatsapp: false,
  },
  [NotificationType.PROMO]: {
    inApp: true,
    email: true,
    push: false,
    sms: false,
    whatsapp: false,
  },
  [NotificationType.REMINDER]: {
    inApp: true,
    email: true,
    push: true,
    sms: true,
    whatsapp: false,
  },
  [NotificationType.SYSTEM]: {
    inApp: true,
    email: true,
    push: true,
    sms: false,
    whatsapp: false,
  },
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [pushSubscription, setPushSubscription] = useState(null);
  const [filters, setFilters] = useState({
    type: null,
    priority: null,
    isRead: null,
    dateFrom: null,
    dateTo: null,
  });

  const wsRef = useRef(null);
  const notificationSound = useRef(null);
  const pollingInterval = useRef(null);

  // Load notifications for authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadPreferences();
      initializeWebSocket();
      initializePushNotifications();

      // Start polling for real-time updates
      startPolling();
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isAuthenticated, user]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // API call to fetch notifications
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter mock notifications for current user
      const userNotifications = MOCK_NOTIFICATIONS.filter(
        (n) => n.userId === user?.id,
      );
      setNotifications(userNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      const savedPrefs = localStorage.getItem(`notification_prefs_${user?.id}`);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    }
  };

  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    // In production, connect to your WebSocket server
    // wsRef.current = new WebSocket(`wss://api.Ticket Bro.com/ws/notifications?userId=${user?.id}`);

    // Mock WebSocket for development
    wsRef.current = {
      send: (data) => console.log("WebSocket send:", data),
      close: () => console.log("WebSocket closed"),
    };
  };

  // Initialize push notifications
  const initializePushNotifications = async () => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      const permission = await Notification.requestPermission();
      setIsPushEnabled(permission === "granted");
    }
  };

  // Start polling for real-time updates
  const startPolling = () => {
    pollingInterval.current = setInterval(() => {
      checkForNewNotifications();
    }, 30000); // Poll every 30 seconds
  };

  // Check for new notifications
  const checkForNewNotifications = async () => {
    try {
      // API call to check for new notifications
      // This would return only notifications newer than the latest in state
    } catch (err) {
      console.error("Failed to check for new notifications:", err);
    }
  };

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (notificationSound.current && preferences.soundEnabled) {
      notificationSound.current.play().catch(() => {});
    }
  }, [preferences.soundEnabled]);

  // Show browser notification
  const showBrowserNotification = useCallback(
    (title, options = {}) => {
      if (isPushEnabled && Notification.permission === "granted") {
        new Notification(title, {
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          vibrate: [200, 100, 200],
          ...options,
        });
      }
    },
    [isPushEnabled],
  );

  // Add new notification
  const addNotification = useCallback(
    (notification) => {
      setNotifications((prev) => [notification, ...prev]);

      // Play sound and show browser notification for high priority
      if (
        notification.priority === NotificationPriority.HIGH ||
        notification.priority === NotificationPriority.URGENT
      ) {
        playNotificationSound();
        showBrowserNotification(notification.title, {
          body: notification.message,
          data: notification.data,
          tag: notification.id,
          renotify: true,
        });
      }
    },
    [playNotificationSound, showBrowserNotification],
  );

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, isRead: true, readAt: new Date().toISOString() }
          : notif,
      ),
    );

    try {
      // API call to mark as read
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error("Failed to mark as read:", err);
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
      // API call to mark all as read
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, isArchived: true, archivedAt: new Date().toISOString() }
          : notif,
      ),
    );

    try {
      // API call to archive
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error("Failed to archive:", err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );

    try {
      // API call to delete
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);

    try {
      // API call to clear all
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      console.error("Failed to clear all:", err);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (type, channel, enabled) => {
      setPreferences((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [channel]: enabled,
        },
      }));

      try {
        // Save to localStorage
        localStorage.setItem(
          `notification_prefs_${user?.id}`,
          JSON.stringify({
            ...preferences,
            [type]: {
              ...preferences[type],
              [channel]: enabled,
            },
          }),
        );

        // API call to update preferences
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error("Failed to update preferences:", err);
      }
    },
    [preferences, user],
  );

  // Toggle sound
  const toggleSound = useCallback((enabled) => {
    setPreferences((prev) => ({ ...prev, soundEnabled: enabled }));
  }, []);

  // Toggle do not disturb
  const toggleDoNotDisturb = useCallback((enabled, startTime, endTime) => {
    setPreferences((prev) => ({
      ...prev,
      doNotDisturb: { enabled, startTime, endTime },
    }));
  }, []);

  // Get filtered notifications
  const filteredNotifications = useCallback(() => {
    return notifications.filter((notif) => {
      if (filters.type && notif.type !== filters.type) return false;
      if (filters.priority && notif.priority !== filters.priority) return false;
      if (filters.isRead !== null && notif.isRead !== filters.isRead)
        return false;
      if (
        filters.dateFrom &&
        new Date(notif.createdAt) < new Date(filters.dateFrom)
      )
        return false;
      if (
        filters.dateTo &&
        new Date(notif.createdAt) > new Date(filters.dateTo)
      )
        return false;
      return !notif.isArchived;
    });
  }, [notifications, filters]);

  // Get notifications by type
  const getByType = useCallback(
    (type) => {
      return notifications.filter((n) => n.type === type && !n.isArchived);
    },
    [notifications],
  );

  // Get unread notifications by type
  const getUnreadByType = useCallback(
    (type) => {
      return notifications.filter(
        (n) => n.type === type && !n.isRead && !n.isArchived,
      );
    },
    [notifications],
  );

  // Get notifications by priority
  const getByPriority = useCallback(
    (priority) => {
      return notifications.filter(
        (n) => n.priority === priority && !n.isArchived,
      );
    },
    [notifications],
  );

  // Get expired notifications
  const getExpired = useCallback(() => {
    const now = new Date();
    return notifications.filter((n) => new Date(n.expiresAt) < now);
  }, [notifications]);

  // Clean up expired notifications
  const cleanupExpired = useCallback(() => {
    const now = new Date();
    setNotifications((prev) => prev.filter((n) => new Date(n.expiresAt) > now));
  }, []);

  // Schedule notification
  const scheduleNotification = useCallback(
    async (notification, scheduleTime) => {
      try {
        // API call to schedule notification
        await new Promise((resolve) => setTimeout(resolve, 200));

        // In production, this would be handled by a background job
        const timeUntilSchedule = new Date(scheduleTime) - new Date();
        if (timeUntilSchedule > 0) {
          setTimeout(() => {
            addNotification({
              ...notification,
              id: `scheduled_${Date.now()}`,
              scheduled: true,
            });
          }, timeUntilSchedule);
        }

        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    [addNotification],
  );

  // Send test notification
  const sendTestNotification = useCallback(
    async (channel = NotificationChannel.IN_APP) => {
      const testNotification = {
        id: `test_${Date.now()}`,
        userId: user?.id,
        type: NotificationType.SYSTEM,
        title: "Test Notification",
        message: "This is a test notification to verify your settings.",
        priority: NotificationPriority.LOW,
        channels: [channel],
        isRead: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      };

      addNotification(testNotification);

      if (channel === NotificationChannel.PUSH) {
        showBrowserNotification(testNotification.title, {
          body: testNotification.message,
          tag: testNotification.id,
        });
      }
    },
    [user, addNotification, showBrowserNotification],
  );

  const value = {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    isPushEnabled,
    filters,

    // Filtered views
    filteredNotifications: filteredNotifications(),
    unreadNotifications: notifications.filter(
      (n) => !n.isRead && !n.isArchived,
    ),
    archivedNotifications: notifications.filter((n) => n.isArchived),

    // Core methods
    addNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,

    // Filtering
    setFilters,
    getByType,
    getUnreadByType,
    getByPriority,

    // Preferences
    updatePreferences,
    toggleSound,
    toggleDoNotDisturb,

    // Push notifications
    initializePushNotifications,

    // Scheduling
    scheduleNotification,
    sendTestNotification,

    // Maintenance
    cleanupExpired,
    getExpired,

    // Constants
    NotificationType,
    NotificationPriority,
    NotificationChannel,

    // Utilities
    hasUnread: unreadCount > 0,
    totalCount: notifications.length,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Audio element for notification sounds */}
      <audio ref={notificationSound} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>
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
