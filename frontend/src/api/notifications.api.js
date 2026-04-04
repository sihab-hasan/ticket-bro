import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  post,
  put,
  pickEntity,
  pickPaginated,
} from "@/api/client";

const normalizeNotification = (notification = {}) => ({
  ...notification,
  id: notification?._id || notification?.id,
  metadata: notification?.metadata || notification?.data || {},
  actionUrl: notification?.actionUrl || notification?.link || "",
});

const pickNotifications = (payload) => {
  const result = pickPaginated("notifications")(payload);
  return {
    notifications: (result.items || []).map(normalizeNotification),
    pagination: result.pagination,
    total: result.total,
  };
};

const normalizePreferences = (payload = {}) => {
  const source = payload?.preferences || payload || {};
  return {
    ...source,
    soundEnabled: source?.soundEnabled ?? true,
    doNotDisturb: source?.doNotDisturb || {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
    },
  };
};

const notificationsService = {
  getAll: (params) =>
    get(ENDPOINTS.NOTIFICATIONS.LIST, {
      params,
      select: pickNotifications,
    }),
  getById: (id) =>
    get(ENDPOINTS.NOTIFICATIONS.DETAIL(id), {
      select: (payload) => normalizeNotification(pickEntity("notification")(payload)),
    }),
  getUnreadCount: () =>
    get(ENDPOINTS.NOTIFICATIONS.UNREAD, {
      select: (payload) => payload?.count ?? 0,
    }),
  markRead: (id) => put(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {}),
  markAllRead: () => put(ENDPOINTS.NOTIFICATIONS.MARK_ALL, {}),
  deleteOne: (id) => del(ENDPOINTS.NOTIFICATIONS.DELETE(id)),
  clearAll: () => del(ENDPOINTS.NOTIFICATIONS.CLEAR),
  getPreferences: () =>
    get(ENDPOINTS.NOTIFICATIONS.PREFERENCES, {
      select: normalizePreferences,
    }),
  updatePreferences: (data) =>
    put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, data, {
      select: normalizePreferences,
    }),
  subscribePush: (subscription) =>
    post(ENDPOINTS.NOTIFICATIONS.PUSH_SUBSCRIBE, subscription),
  unsubscribePush: () => del(ENDPOINTS.NOTIFICATIONS.PUSH_UNSUBSCRIBE),
};

export const pushNotificationService = {
  isSupported: () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator,
  requestPermission: async () => {
    if (!pushNotificationService.isSupported()) {
      return "unsupported";
    }

    return Notification.requestPermission();
  },
  subscribe: async () => {
    const permission = await pushNotificationService.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "",
      });

      await notificationsService.subscribePush(subscription.toJSON());
      return subscription;
    } catch {
      return null;
    }
  },
  unsubscribe: async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await notificationsService.unsubscribePush();
      }
    } catch {}
  },
};

export default notificationsService;
