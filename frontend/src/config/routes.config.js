export const ROUTES = {
  HOME: '/',

  AUTH_MODAL: {
    LOGIN: '/?auth=login',
    REGISTER: '/?auth=register',
    FORGOT: '/?auth=forgot',
    RESET: '/?auth=reset',
    OTP: '/?auth=otp',
    VERIFY_NOTICE: '/?auth=verify-notice',
  },

  AUTH: {
    ROOT: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_EMAIL: '/auth/verify-email',
    OAUTH_SUCCESS: '/auth/oauth-success',
  },

  BROWSE: {
    ROOT: '/browse',
    CATEGORY: (categorySlug) => `/${categorySlug}`,
    SUBCATEGORY: (categorySlug, subCategorySlug) => `/${categorySlug}/${subCategorySlug}`,
    EVENT_TYPE: (categorySlug, subCategorySlug, eventTypeSlug) =>
      `/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`,
    EVENT: (categorySlug, subCategorySlug, eventTypeSlug, eventSlug) =>
      `/${categorySlug}/${subCategorySlug}/${eventTypeSlug}/${eventSlug}`,
  },

  EVENT: (eventSlug) => `/events/${eventSlug}`,

  SEARCH: {
    ROOT: '/search',
    RESULTS: '/search/results',
  },

  CART: {
    ROOT: '/cart',
    CHECKOUT: '/cart/checkout',
  },

  PROFILE: {
    ROOT: '/profile',
    EDIT: '/profile/edit',
    CHANGE_PASSWORD: '/profile/change-password',
    NOTIFICATIONS: '/profile/notifications',
  },

  BOOKINGS: {
    ROOT: '/bookings',
    DETAIL: (bookingId) => `/bookings/${bookingId}`,
    CANCEL: (bookingId) => `/bookings/cancel/${bookingId}`,
    WAITLIST: (eventId) => `/bookings/waitlist/${eventId}`,
  },

  TICKETS: {
    SELECT: (eventId) => `/tickets/select/${eventId}`,
    SEATS: (eventId) => `/tickets/seats/${eventId}`,
    BOOK: (ticketId) => `/tickets/book/${ticketId}`,
    PAYMENT: (bookingId) => `/tickets/payment/${bookingId}`,
    CONFIRM: (bookingId) => `/tickets/confirm/${bookingId}`,
    DOWNLOAD: (ticketId) => `/tickets/download/${ticketId}`,
  },

  PAYMENTS: {
    ROOT: (bookingId) => `/payments/${bookingId}`,
    SUCCESS: (paymentId) => `/payments/success/${paymentId}`,
    FAILED: (paymentId) => `/payments/failed/${paymentId}`,
    HISTORY: '/payments/history',
    DETAILS: (paymentId) => `/payments/details/${paymentId}`,
  },

  MESSAGES: {
    ROOT: '/messages',
    CONVERSATION: (conversationId) => `/messages/conversation/${conversationId}`,
    CHAT: (userId) => `/messages/chat/${userId}`,
  },

  NOTIFICATIONS: {
    ROOT: '/notifications',
    DETAIL: (notificationId) => `/notifications/${notificationId}`,
  },

  REVIEWS: {
    ROOT: '/reviews',
    EVENT: (eventId) => `/reviews/event/${eventId}`,
    WRITE: (eventId) => (eventId ? `/reviews/write/${eventId}` : '/reviews/write'),
  },

  ORGANIZER: {
    ROOT: '/organizer',
    DASHBOARD: '/organizer/dashboard',
    EVENTS: '/organizer/events',
    CREATE_EVENT: '/organizer/events/create',
    EDIT_EVENT: (eventId) => `/organizer/events/edit/${eventId}`,
    TICKET_MGMT: (eventId = '') =>
      eventId ? `/organizer/events/tickets/${eventId}` : '/organizer/events/tickets',
    BOOKINGS: '/organizer/bookings',
    BOOKING: (bookingId) => `/organizer/bookings/${bookingId}`,
    REVENUE: '/organizer/revenue',
    ANALYTICS: '/organizer/analytics',
    SETTINGS: '/organizer/settings',
  },

  MODERATOR: {
    ROOT: '/moderator',
    DASHBOARD: '/moderator/dashboard',
    REPORTS: '/moderator/reports',
    EVENTS: '/moderator/events',
    USERS: '/moderator/users',
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER: (userId) => `/admin/users/${userId}`,
    EVENTS: '/admin/events',
    EVENT: (eventId) => `/admin/events/${eventId}`,
    BOOKINGS: '/admin/bookings',
    BOOKING: (bookingId) => `/admin/bookings/${bookingId}`,
    PAYMENTS: '/admin/payments',
    PAYMENT: (paymentId) => `/admin/payments/${paymentId}`,
    ANALYTICS: '/admin/analytics',
    REPORTS: '/admin/reports',
    PROMOTIONS: '/admin/promotions',
    SYSTEM_SETTINGS: '/admin/system/settings',
    SYSTEM_SECURITY: '/admin/system/security',
    SYSTEM_HEALTH: '/admin/system/health',
    SYSTEM_LOGS: '/admin/system/logs',
  },

  SUPER_ADMIN: {
    ROOT: '/super-admin',
    DASHBOARD: '/super-admin/dashboard',
    ROLES: '/super-admin/roles',
    AUDIT: '/super-admin/audit',
    PLATFORM: '/super-admin/platform',
  },

  STATIC: {
    ABOUT: '/about',
    CONTACT: '/contact',
    FAQ: '/faq',
    PRIVACY: '/privacy',
    TERMS: '/terms',
  },

  ERROR: {
    NOT_FOUND: '/404',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500',
    HTTP_505: '/505',
    MAINTENANCE: '/maintenance',
  },
};

export const PUBLIC_ROUTE_GROUPS = {
  landing: [ROUTES.HOME, ROUTES.BROWSE.ROOT, ROUTES.SEARCH.ROOT],
  static: [ROUTES.STATIC.ABOUT, ROUTES.STATIC.CONTACT, ROUTES.STATIC.FAQ, ROUTES.STATIC.PRIVACY, ROUTES.STATIC.TERMS],
  auth: Object.values(ROUTES.AUTH),
};

export default ROUTES;
