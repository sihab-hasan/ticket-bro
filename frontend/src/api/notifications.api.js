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
  const source = payload || {};
  const email = source.email || {};
  const push = source.push || {};
  const sms = source.sms || {};
  const dnd = source.doNotDisturb || {};

  return {
    'email.bookingConfirmed': email.bookingConfirmed ?? true,
    'email.bookingCancelled': email.bookingCancelled ?? true,
    'email.paymentSuccess': email.paymentSuccess ?? true,
    'email.refundProcessed': email.refundProcessed ?? true,
    'email.eventUpdated': email.eventUpdated ?? true,
    'email.promotions': email.promotions ?? false,
    'email.newsletter': email.newsletter ?? false,
    'push.bookingReminder': push.bookingReminder ?? true,
    'push.newEvents': push.newEvents ?? false,
    'smsNotify': sms.bookingConfirmed ?? false,
    soundEnabled: source.soundEnabled ?? true,
    doNotDisturb: {
      enabled: dnd.enabled ?? false,
      startTime: dnd.startTime || "22:00",
      endTime: dnd.endTime || "08:00",
    },
  };
};

const toBackendPreferences = (prefs) => {
  return {
    email: {
      bookingConfirmed: prefs['email.bookingConfirmed'],
      bookingCancelled: prefs['email.bookingCancelled'],
      paymentSuccess: prefs['email.paymentSuccess'],
      refundProcessed: prefs['email.refundProcessed'],
      eventUpdated: prefs['email.eventUpdated'],
      promotions: prefs['email.promotions'],
      newsletter: prefs['email.newsletter'],
    },
    push: {
      bookingReminder: prefs['push.bookingReminder'],
      newEvents: prefs['push.newEvents'],
    },
    sms: {
      bookingConfirmed: prefs['smsNotify'],
      eventReminder: prefs['smsNotify'],
    },
    soundEnabled: prefs.soundEnabled,
    doNotDisturb: prefs.doNotDisturb,
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
    put(ENDPOINTS.NOTIFICATIONS.PREFERENCES, toBackendPreferences(data), {
      select: normalizePreferences,
    }),
  subscribePush: (subscription) =>
    post(ENDPOINTS.NOTIFICATIONS.PUSH_SUBSCRIBE, subscription),
  unsubscribePush: (endpoint) =>
    del(ENDPOINTS.NOTIFICATIONS.PUSH_UNSUBSCRIBE, { params: endpoint ? { endpoint } : {} }),
  getVapidKey: () =>
    get(ENDPOINTS.NOTIFICATIONS.VAPID_KEY, {
      select: (payload) => payload?.publicKey || '',
    }),
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
      const vapidPublicKey = await notificationsService.getVapidKey();
      if (vapidPublicKey) {
        localStorage.setItem('vapidPublicKey', vapidPublicKey);
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey ? urlBase64ToUint8Array(vapidPublicKey) : undefined,
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
        await notificationsService.unsubscribePush(subscription.endpoint);
      }
    } catch (err) {
      // Silent fail
    }
  },
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default notificationsService;