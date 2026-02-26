const express = require("express");
const router = express.Router();

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
const {
  authenticate,
  authorize,
} = require("./common/middleware/auth.middleware");
const { rateLimiter } = require("./common/middleware/rateLimiter.middleware");
const { cache } = require("./common/middleware/cache.middleware");
const { validate } = require("./common/middleware/validation.middleware");

// ─── ROUTERS ─────────────────────────────────────────────────────────────────
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const subcategoryRoutes = require("./modules/subcategories/subcategory.routes");
const eventTypeRoutes = require("./modules/eventTypes/eventType.routes");
const eventRoutes = require("./modules/events/event.routes");
const ticketRoutes = require("./modules/tickets/ticket.routes");
const bookingRoutes = require("./modules/bookings/booking.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const webhookRoutes = require("./modules/payments/payment.webhook");
const reviewRoutes = require("./modules/reviews/review.routes");
const searchRoutes = require("./modules/search/search.routes");
const messagingRoutes = require("./modules/messaging/messaging.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const organizerRoutes = require("./modules/organizers/organizer.routes");
const promotionRoutes = require("./modules/promotions/promotion.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const adminRoutes = require("./modules/admins/admin.routes");
const auditRoutes = require("./modules/auditLogs/audit.routes");

// ─── ROLES ───────────────────────────────────────────────────────────────────
const ROLES = require("./common/constants/roles");
// ROLES.USER, ROLES.ORGANIZER, ROLES.ADMIN

// ════════════════════════════════════════════════════════════════════════════
//   AUTH
//   Public — no authentication required
// ════════════════════════════════════════════════════════════════════════════
router.use("/auth", rateLimiter("auth"), authRoutes);

// POST   /auth/register
// POST   /auth/login
// POST   /auth/logout
// POST   /auth/refresh-token
// POST   /auth/forgot-password
// POST   /auth/reset-password
// POST   /auth/verify-email
// POST   /auth/send-otp
// POST   /auth/verify-otp
// GET    /auth/me
// GET    /auth/google
// GET    /auth/google/callback
// GET    /auth/facebook
// GET    /auth/facebook/callback

// ════════════════════════════════════════════════════════════════════════════
//   WEBHOOKS
//   Must be before any body parsing — raw body required for signature verify
// ════════════════════════════════════════════════════════════════════════════
router.use("/webhooks", webhookRoutes);

// POST   /webhooks/stripe
// POST   /webhooks/razorpay
// POST   /webhooks/paypal

// ════════════════════════════════════════════════════════════════════════════
//   CATEGORIES
//   Public reads — Admin writes
// ════════════════════════════════════════════════════════════════════════════
router.use("/categories", categoryRoutes);

// GET    /categories                              public + cached
// GET    /categories/:slug                        public + cached
// GET    /categories/:slug/subcategories          public + cached
// GET    /categories/:slug/subcategories/:sub     public + cached
// POST   /categories                              admin only
// PUT    /categories/:slug                        admin only
// DELETE /categories/:slug                        admin only

// ════════════════════════════════════════════════════════════════════════════
//   SUBCATEGORIES
//   Public reads — Admin writes
// ════════════════════════════════════════════════════════════════════════════
router.use("/subcategories", subcategoryRoutes);

// GET    /subcategories                           public + cached
// GET    /subcategories/:slug                     public + cached
// POST   /subcategories                           admin only
// PUT    /subcategories/:slug                     admin only
// DELETE /subcategories/:slug                     admin only

// ════════════════════════════════════════════════════════════════════════════
//   EVENT TYPES
//   Public reads — Admin writes
// ════════════════════════════════════════════════════════════════════════════
router.use("/event-types", eventTypeRoutes);

// GET    /event-types                             public + cached
// GET    /event-types/:slug                       public + cached
// POST   /event-types                             admin only
// PUT    /event-types/:slug                       admin only
// DELETE /event-types/:slug                       admin only

// ════════════════════════════════════════════════════════════════════════════
//   EVENTS
//   Public reads — Organizer writes — Admin management
// ════════════════════════════════════════════════════════════════════════════
router.use("/events", eventRoutes);

// ─── PUBLIC ─────────────────────────────────────────────────────────────────
// GET    /events                                  public + cached 2min
// GET    /events/featured                         public + cached 5min
// GET    /events/trending                         public + cached 5min
// GET    /events/upcoming                         public + cached 5min
// GET    /events/:slug                            public + cached 2min
// GET    /events/:slug/details                    public + cached 1min
// GET    /events/:slug/tickets                    public + cached 1min
// GET    /events/:slug/reviews                    public
// GET    /events/:slug/related                    public + cached 5min

// ─── ORGANIZER ──────────────────────────────────────────────────────────────
// POST   /events                                  organizer only
// PUT    /events/:slug                            organizer only
// DELETE /events/:slug                            organizer only
// POST   /events/:slug/publish                    organizer only
// POST   /events/:slug/cancel                     organizer only

// ─── TICKET TYPES (nested under event) ──────────────────────────────────────
// POST   /events/:slug/ticket-types               organizer only
// GET    /events/:slug/ticket-types               public
// PUT    /events/:slug/ticket-types/:id           organizer only
// DELETE /events/:slug/ticket-types/:id           organizer only

// ─── SEAT SECTIONS (nested under event) ─────────────────────────────────────
// POST   /events/:slug/seat-sections              organizer only
// GET    /events/:slug/seat-sections              public
// PUT    /events/:slug/seat-sections/:id          organizer only
// GET    /events/:slug/seat-map                   public + cached 30s

// ─── ADMIN ──────────────────────────────────────────────────────────────────
// GET    /events/admin/all                        admin only
// PUT    /events/:slug/approve                    admin only
// PUT    /events/:slug/reject                     admin only

// ════════════════════════════════════════════════════════════════════════════
//   TICKETS
//   User reads own tickets — System issues — Organizer validates
// ════════════════════════════════════════════════════════════════════════════
router.use("/tickets", authenticate, ticketRoutes);

// GET    /tickets                                 user — my tickets
// GET    /tickets/:code                           user — single ticket
// GET    /tickets/:code/download                  user — PDF download
// POST   /tickets/:code/validate                  organizer — gate validation
// POST   /tickets/:code/transfer                  user — transfer ticket
// POST   /tickets/:code/cancel                    user — cancel ticket

// ════════════════════════════════════════════════════════════════════════════
//   CART
//   Authenticated users only
// ════════════════════════════════════════════════════════════════════════════
router.use("/cart", authenticate, cartRoutes);

// GET    /cart                                    user
// POST   /cart/items                              user
// PUT    /cart/items/:itemId                      user
// DELETE /cart/items/:itemId                      user
// DELETE /cart                                    user
// POST   /cart/apply-promo                        user
// DELETE /cart/promo                              user
// POST   /cart/checkout                           user

// ════════════════════════════════════════════════════════════════════════════
//   BOOKINGS
//   Authenticated users — Organizer management — Admin override
// ════════════════════════════════════════════════════════════════════════════
router.use("/bookings", authenticate, bookingRoutes);

// ─── USER ────────────────────────────────────────────────────────────────────
// POST   /bookings                                user
// GET    /bookings                                user — my bookings
// GET    /bookings/:ref                           user — single booking
// POST   /bookings/:ref/cancel                    user
// POST   /bookings/:ref/refund                    user
// GET    /bookings/:ref/tickets                   user
// GET    /bookings/:ref/invoice                   user

// ─── ORGANIZER ──────────────────────────────────────────────────────────────
// GET    /organizer/bookings                      organizer
// GET    /organizer/bookings/:ref                 organizer
// POST   /organizer/bookings/:ref/checkin         organizer

// ─── ADMIN ──────────────────────────────────────────────────────────────────
// GET    /admin/bookings                          admin
// PUT    /admin/bookings/:ref/cancel              admin
// PUT    /admin/bookings/:ref/refund              admin

// ════════════════════════════════════════════════════════════════════════════
//   PAYMENTS
//   Authenticated users — Admin oversight
// ════════════════════════════════════════════════════════════════════════════
router.use("/payments", authenticate, paymentRoutes);

// POST   /payments/intent                         user
// POST   /payments/verify                         user
// GET    /payments                                user — my payments
// GET    /payments/:id                            user
// POST   /payments/:id/refund                     user
// GET    /payments/:id/refund                     user
// GET    /payments/methods                        user
// DELETE /payments/methods/:id                    user
// GET    /admin/payments                          admin
// GET    /admin/payments/:id                      admin
// POST   /admin/payments/:id/refund               admin

// ════════════════════════════════════════════════════════════════════════════
//   REVIEWS
//   Public reads — Authenticated writes
// ════════════════════════════════════════════════════════════════════════════
router.use("/reviews", reviewRoutes);

// GET    /events/:slug/reviews                    public
// GET    /events/:slug/reviews/summary            public + cached 5min
// POST   /reviews                                 user (authenticated)
// PUT    /reviews/:id                             user (owner)
// DELETE /reviews/:id                             user (owner)
// GET    /reviews/my                              user (authenticated)
// GET    /admin/reviews                           admin
// DELETE /admin/reviews/:id                       admin
// PUT    /admin/reviews/:id/flag                  admin

// ════════════════════════════════════════════════════════════════════════════
//   SEARCH
//   Fully public
// ════════════════════════════════════════════════════════════════════════════
router.use("/search", cache("30s"), searchRoutes);

// GET    /search                                  public
// GET    /search/autocomplete                     public
// GET    /search/trending                         public + cached 5min
// GET    /search/nearby                           public
// GET    /search/facets                           public + cached 2min
// POST   /search/reindex                          admin only
// POST   /search/reindex/:eventId                 admin only
// DELETE /search/index/:eventId                   admin only

// ════════════════════════════════════════════════════════════════════════════
//   MESSAGING
//   Authenticated users only
// ════════════════════════════════════════════════════════════════════════════
router.use("/messaging", authenticate, messagingRoutes);

// POST   /messaging/conversations                 user
// GET    /messaging/conversations                 user/organizer
// GET    /messaging/conversations/:id             user/organizer
// DELETE /messaging/conversations/:id             user/organizer
// GET    /messaging/conversations/:id/messages    user/organizer
// POST   /messaging/conversations/:id/messages    user/organizer
// PUT    /messaging/conversations/:id/read        user/organizer
// GET    /messaging/unread-count                  user/organizer

// ════════════════════════════════════════════════════════════════════════════
//   NOTIFICATIONS
//   Authenticated users only
// ════════════════════════════════════════════════════════════════════════════
router.use("/notifications", authenticate, notificationRoutes);

// GET    /notifications                           user
// GET    /notifications/unread-count              user
// PUT    /notifications/:id/read                  user
// PUT    /notifications/read-all                  user
// DELETE /notifications/:id                       user
// DELETE /notifications                           user
// GET    /notifications/preferences               user
// PUT    /notifications/preferences               user
// POST   /notifications/push/subscribe            user
// DELETE /notifications/push/unsubscribe          user

// ════════════════════════════════════════════════════════════════════════════
//   ORGANIZERS
//   Public profile — Organizer private — Admin management
// ════════════════════════════════════════════════════════════════════════════
router.use("/organizers", organizerRoutes);
router.use(
  "/organizer",
  authenticate,
  authorize(ROLES.ORGANIZER),
  organizerRoutes,
);

// ─── PUBLIC ─────────────────────────────────────────────────────────────────
// GET    /organizers/:slug                        public + cached 5min
// GET    /organizers/:slug/events                 public

// ─── ORGANIZER (own) ────────────────────────────────────────────────────────
// GET    /organizer/profile                       organizer
// PUT    /organizer/profile                       organizer
// POST   /organizer/verification                  organizer
// GET    /organizer/verification                  organizer
// GET    /organizer/dashboard                     organizer
// GET    /organizer/events                        organizer
// GET    /organizer/bookings                      organizer
// GET    /organizer/revenue                       organizer
// GET    /organizer/payouts                       organizer

// ─── ADMIN ──────────────────────────────────────────────────────────────────
// GET    /admin/organizers                        admin
// GET    /admin/organizers/:id                    admin
// PUT    /admin/organizers/:id/verify             admin
// PUT    /admin/organizers/:id/reject             admin
// PUT    /admin/organizers/:id/suspend            admin

// ════════════════════════════════════════════════════════════════════════════
//   PROMOTIONS
//   Public apply — Organizer/Admin manage
// ════════════════════════════════════════════════════════════════════════════
router.use("/promotions", promotionRoutes);

// POST   /promotions/validate                     user — check promo code
// POST   /organizer/promotions                    organizer — create promo
// GET    /organizer/promotions                    organizer — list promos
// PUT    /organizer/promotions/:id                organizer — update promo
// DELETE /organizer/promotions/:id                organizer — delete promo
// GET    /admin/promotions                        admin — all promos
// PUT    /admin/promotions/:id/disable            admin — disable promo

// ════════════════════════════════════════════════════════════════════════════
//   ANALYTICS
//   Organizer + Admin only
// ════════════════════════════════════════════════════════════════════════════
router.use("/analytics", authenticate, analyticsRoutes);

// GET    /analytics/overview                      organizer
// GET    /analytics/revenue                       organizer
// GET    /analytics/tickets                       organizer
// GET    /analytics/events                        organizer
// GET    /analytics/events/:id                    organizer
// GET    /analytics/audience                      organizer
// GET    /admin/analytics/overview                admin
// GET    /admin/analytics/revenue                 admin
// GET    /admin/analytics/users                   admin
// GET    /admin/analytics/events                  admin
// GET    /admin/analytics/organizers              admin

// ════════════════════════════════════════════════════════════════════════════
//   USERS
//   Authenticated — Admin management
// ════════════════════════════════════════════════════════════════════════════
router.use("/users", authenticate, userRoutes);

// GET    /users/profile                           user
// PUT    /users/profile                           user
// PUT    /users/password                          user
// DELETE /users/account                           user
// GET    /users/saved-events                      user
// POST   /users/saved-events/:eventId             user
// DELETE /users/saved-events/:eventId             user
// GET    /admin/users                             admin
// GET    /admin/users/:id                         admin
// PUT    /admin/users/:id/ban                     admin
// PUT    /admin/users/:id/unban                   admin

// ════════════════════════════════════════════════════════════════════════════
//   ADMIN
//   Admin only — system management
// ════════════════════════════════════════════════════════════════════════════
router.use("/admin", authenticate, authorize(ROLES.ADMIN), adminRoutes);

// GET    /admin/dashboard                         admin
// GET    /admin/system/health                     admin
// GET    /admin/system/metrics                    admin
// PUT    /admin/feature-flags                     admin
// GET    /admin/feature-flags                     admin

// ════════════════════════════════════════════════════════════════════════════
//   AUDIT LOGS
//   Admin only — read only
// ════════════════════════════════════════════════════════════════════════════
router.use("/audit", authenticate, authorize(ROLES.ADMIN), auditRoutes);

// GET    /audit                                   admin — all logs
// GET    /audit/:id                               admin — single log
// GET    /audit/user/:userId                      admin — logs by user

module.exports = router;
