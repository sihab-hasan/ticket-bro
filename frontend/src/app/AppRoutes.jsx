// frontend/src/app/AppRoutes.jsx
//
// App route tree
// - Public browsing flows use MainLayout
// - Auth fallbacks use AuthLayout
// - Signed-in user pages use UserLayout
// - Control-panel roles use dedicated panel layouts

import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { PageLoader } from "@/components/shared/Loader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// ── Layouts ───────────────────────────────────────────────────────────────────
import MainLayout from "@/components/layout/MainLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import UserLayout from "@/components/layout/UserLayout";
import OrganizerLayout from "@/components/layout/OrganizerLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ModeratorLayout from "@/components/layout/ModeratorLayout";
import SuperAdminLayout from "@/components/layout/SuperAdminLayout";
import MessagingLayout from "@/components/layout/MessagingLayout";
import { ROUTES } from "@/config/routes.config";

// ── Critical path — eager ─────────────────────────────────────────────────────
import BrowsePage from "@/pages/browse/BrowseAllPage";
import CategoryPage from "@/pages/browse/Category/CategoryPage";
import SubCategoryPage from "@/pages/browse/SubCategory/SubCategoryPage";
import EventTypePage from "@/pages/browse/EventType/EventTypePage";
import EventDetailsPage from "@/pages/browse/EventDetails/EventDetailsPage";
import MaintenancePage from "@/pages/error/MaintenancePage";
import SystemSecurityPage from "@/pages/admin/SystemSecurityPage";
import SystemHealthPage from "@/pages/admin/SystemHealthPage";
import TrandingsPage from "@/pages/browse/Highlighted/TrandingsPage";
import OffersPage from "@/pages/browse/Highlighted/OffersPage";

// Standalone auth-adjacent pages — eager (email links must land instantly)

// ── Lazy loaded ───────────────────────────────────────────────────────────────
const HomePage = lazy(() => import("@/pages/home/HomePage"));
const SearchPage = lazy(() => import("@/pages/search/SearchPage"));
const SearchResultsPage = lazy(() => import("@/pages/search/SearchResultsPage"));
const CartPage = lazy(() => import("@/pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/cart/CheckoutPage"));
const PaymentPage = lazy(() => import("@/pages/payments/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/payments/PaymentSuccessPage"));
const PaymentFailedPage = lazy(() => import("@/pages/payments/PaymentFailedPage"));
const PaymentHistoryPage = lazy(() => import("@/pages/payments/PaymentHistoryPage"));
const PaymentDetailsPage = lazy(() => import("@/pages/payments/PaymentDetailsPage"));
const TicketSelectionPage = lazy(() => import("@/pages/tickets/TicketSelectionPage"));
const SeatSelectionPage = lazy(() => import("@/pages/tickets/SeatSelectionPage"));
const TicketBookingPage = lazy(() => import("@/pages/tickets/TicketBookingPage"));
const TicketPaymentPage = lazy(() => import("@/pages/tickets/TicketPaymentPage"));
const TicketConfirmationPage = lazy(() => import("@/pages/tickets/TicketConfirmationPage"));
const TicketDownloadPage = lazy(() => import("@/pages/tickets/TicketDownloadPage"));
const BookingHistoryPage = lazy(() => import("@/pages/bookings/BookingHistoryPage"));
const BookingDetailsPage = lazy(() => import("@/pages/bookings/BookingDetailsPage"));
const CancelBookingPage = lazy(() => import("@/pages/bookings/CancelBookingPage"));
const WaitlistPage = lazy(() => import("@/pages/bookings/WaitlistPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/profile/EditProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/profile/ChangePasswordPage"));
const NotificationSettingsPage = lazy(() => import("@/pages/profile/NotificationSettingsPage"));
const InboxPage = lazy(() => import("@/pages/messaging/InboxPage"));
const ConversationPage = lazy(() => import("@/pages/messaging/ConversationPage"));
const ChatPage = lazy(() => import("@/pages/messaging/ChatPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"));
const NotificationDetailPage = lazy(() => import("@/pages/notifications/NotificationDetailPage"));
const ReviewsPage = lazy(() => import("@/pages/reviews/ReviewsPage"));
const WriteReviewPage = lazy(() => import("@/pages/reviews/WriteReviewPage"));
const OrganizerDashboard = lazy(() => import("@/pages/organizer/OrganizerDashboard"));
const CreateEventPage = lazy(() => import("@/pages/organizer/CreateEventPage"));
const EditEventPage = lazy(() => import("@/pages/organizer/EditEventPage"));
const OrgEventManagementPage = lazy(() => import("@/pages/organizer/EventManagementPage"));
const OrgTicketManagementPage = lazy(() => import("@/pages/organizer/TicketManagementPage"));
const OrgBookingManagementPage = lazy(() => import("@/pages/organizer/BookingManagementPage"));
const OrgRevenuePage = lazy(() => import("@/pages/organizer/RevenuePage"));
const OrgAnalyticsPage = lazy(() => import("@/pages/organizer/AnalyticsPage"));
const OrganizerSettingsPage = lazy(() => import("@/pages/organizer/SettingsPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUserManagementPage = lazy(() => import("@/pages/admin/UserManagementPage"));
const AdminEventManagementPage = lazy(() => import("@/pages/admin/EventManagementPage"));
const AdminBookingManagementPage = lazy(() => import("@/pages/admin/BookingManagementPage"));
const AdminPaymentManagementPage = lazy(() => import("@/pages/admin/PaymentManagementPage"));
const AdminAnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));
const AdminReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const AdminPromotionsPage = lazy(() => import("@/pages/admin/PromotionsPage"));
const AdminSystemSettingsPage = lazy(() => import("@/pages/admin/SystemSettingsPage"));
const AdminLogsPage = lazy(() => import("@/pages/admin/LogsPage"));
const ModeratorDashboard = lazy(() => import("@/pages/moderator/ModeratorDashboard"));
const ReportsQueuePage = lazy(() => import("@/pages/moderator/ReportsQueuePage"));
const EventModerationPage = lazy(() => import("@/pages/moderator/EventModerationPage"));
const UserModerationPage = lazy(() => import("@/pages/moderator/UserModerationPage"));
const SuperAdminDashboard = lazy(() => import("@/pages/super-admin/SuperAdminDashboard"));
const RoleManagementPage = lazy(() => import("@/pages/super-admin/RoleManagementPage"));
const AuditCenterPage = lazy(() => import("@/pages/super-admin/AuditCenterPage"));
const PlatformControlPage = lazy(() => import("@/pages/super-admin/PlatformControlPage"));
const AboutPage = lazy(() => import("@/pages/static/AboutPage"));
const ContactPage = lazy(() => import("@/pages/static/ContactPage"));
const FAQPage = lazy(() => import("@/pages/static/FAQPage"));
const PrivacyPage = lazy(() => import("@/pages/static/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/static/TermsPage"));
const NotFoundPage = lazy(() => import("@/pages/error/NotFoundPage"));
const ForbiddenPage = lazy(() => import("@/pages/error/ForbiddenPage"));
const ServerErrorPage = lazy(() => import("@/pages/error/ServerErrorPage"));
const HttpVersionNotSupportedPage = lazy(() => import("@/pages/error/HttpVersionNotSupportedPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const OTPVerificationPage = lazy(() => import("@/pages/auth/OTPVerificationPage"));
const OAuthSuccessPage = lazy(() => import("@/pages/auth/OAuthSuccessPage"));

// ── App routes ────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ══════════════════════════════════════════════════════════
          PUBLIC — MainLayout
      ══════════════════════════════════════════════════════════ */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/browse" element={<BrowsePage />} />

        <Route path="/:categorySlug" element={<CategoryPage />} />
        <Route path="/:categorySlug/:subCategorySlug" element={<SubCategoryPage />} />
        <Route path="/:categorySlug/:subCategorySlug/:eventTypeSlug" element={<EventTypePage />} />
        <Route path="/:categorySlug/:subCategorySlug/:eventTypeSlug/:eventSlug" element={<EventDetailsPage />} />

        {/* Legacy /events/:slug */}
        <Route path="/events/:eventSlug" element={<EventDetailsPage />} />

        <Route path="/search">
          <Route index element={<SearchPage />} />
          <Route path="results" element={<SearchResultsPage />} />
        </Route>

        <Route path="/cart">
          <Route index element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/trending" element={<TrandingsPage />} />
        <Route path="/favorites" element={<Navigate to="/profile" replace />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="/calendar" element={<Navigate to="/bookings" replace />} />
      </Route>

      {/* ══════════════════════════════════════════════════════════
          AUTH — Full page fallbacks
      ══════════════════════════════════════════════════════════ */}
      <Route path="/auth">
        <Route path="login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
        <Route path="reset-password" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
        <Route path="verify-email" element={<AuthLayout public><VerifyEmailPage /></AuthLayout>} />
        <Route path="verify-otp" element={<AuthLayout><OTPVerificationPage /></AuthLayout>} />
        <Route path="oauth-success" element={<AuthLayout public><OAuthSuccessPage /></AuthLayout>} />
      </Route>

      {/* ══════════════════════════════════════════════════════════
          PROTECTED — Messaging (full-height, no footer)
      ══════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MessagingLayout />}>
          <Route path="/messages" element={<InboxPage />}>
            <Route path="conversation/:conversationId" element={<ConversationPage />} />
          </Route>
          <Route path="/messages/chat/:userId" element={<ChatPage />} />
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════
          PROTECTED — Any authenticated user + UserLayout
      ══════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/profile">
            <Route index element={<ProfilePage />} />
            <Route path="edit" element={<EditProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="notifications" element={<NotificationSettingsPage />} />
          </Route>

          <Route path="/bookings">
            <Route index element={<BookingHistoryPage />} />
            <Route path=":bookingId" element={<BookingDetailsPage />} />
            <Route path="cancel/:bookingId" element={<CancelBookingPage />} />
            <Route path="waitlist/:eventId" element={<WaitlistPage />} />
          </Route>

          <Route path="/tickets">
            <Route path="select/:eventId" element={<TicketSelectionPage />} />
            <Route path="seats/:eventId" element={<SeatSelectionPage />} />
            <Route path="book/:ticketId" element={<TicketBookingPage />} />
            <Route path="payment/:bookingId" element={<TicketPaymentPage />} />
            <Route path="confirm/:bookingId" element={<TicketConfirmationPage />} />
            <Route path="download/:ticketId" element={<TicketDownloadPage />} />
          </Route>

          <Route path="/payments">
            <Route path=":bookingId" element={<PaymentPage />} />
            <Route path="success/:paymentId" element={<PaymentSuccessPage />} />
            <Route path="failed/:paymentId" element={<PaymentFailedPage />} />
            <Route path="history" element={<PaymentHistoryPage />} />
            <Route path="details/:paymentId" element={<PaymentDetailsPage />} />
          </Route>

          <Route path="/notifications">
            <Route index element={<NotificationsPage />} />
            <Route path=":notificationId" element={<NotificationDetailPage />} />
          </Route>

          <Route path="/reviews">
            <Route path="event/:eventId" element={<ReviewsPage />} />
            <Route path="write" element={<WriteReviewPage />} />
            <Route path="write/:eventId" element={<WriteReviewPage />} />
          </Route>
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════
          PROTECTED — Organizer
      ══════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute requiredPanel="organizer" />}>
        <Route element={<OrganizerLayout />}>
          <Route path="/organizer">
            <Route index element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="events">
              <Route index element={<OrgEventManagementPage />} />
              <Route path="create" element={<CreateEventPage />} />
              <Route path="edit/:eventId" element={<EditEventPage />} />
              <Route path="tickets" element={<OrgTicketManagementPage />} />
              <Route path="tickets/:eventId" element={<OrgTicketManagementPage />} />
            </Route>
            <Route path="bookings">
              <Route index element={<OrgBookingManagementPage />} />
              <Route path=":bookingId" element={<BookingDetailsPage />} />
            </Route>
            <Route path="revenue" element={<OrgRevenuePage />} />
            <Route path="analytics" element={<OrgAnalyticsPage />} />
            <Route path="settings" element={<OrganizerSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════
          PROTECTED — Admin
      ══════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute requiredPanel="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin">
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users">
              <Route index element={<AdminUserManagementPage />} />
              <Route path=":userId" element={<AdminUserManagementPage />} />
            </Route>
            <Route path="events">
              <Route index element={<AdminEventManagementPage />} />
              <Route path=":eventId" element={<AdminEventManagementPage />} />
            </Route>
            <Route path="bookings">
              <Route index element={<AdminBookingManagementPage />} />
              <Route path=":bookingId" element={<AdminBookingManagementPage />} />
            </Route>
            <Route path="payments">
              <Route index element={<AdminPaymentManagementPage />} />
              <Route path=":paymentId" element={<AdminPaymentManagementPage />} />
            </Route>
            <Route path="analytics" element={<AdminAnalyticsDashboard />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="promotions" element={<AdminPromotionsPage />} />
            <Route path="system">
              <Route path="settings" element={<AdminSystemSettingsPage />} />
              <Route path="security" element={<SystemSecurityPage />} />
              <Route path="health" element={<SystemHealthPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════
          PROTECTED — Moderator
      ══════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute requiredPanel="moderator" />}>
        <Route element={<ModeratorLayout />}>
          <Route path="/moderator">
            <Route index element={<Navigate to="/moderator/dashboard" replace />} />
            <Route path="dashboard" element={<ModeratorDashboard />} />
            <Route path="reports" element={<ReportsQueuePage />} />
            <Route path="events" element={<EventModerationPage />} />
            <Route path="users" element={<UserModerationPage />} />
          </Route>
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════
          PROTECTED — Super Admin
      ══════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute requiredPanel="super_admin" />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin">
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="roles" element={<RoleManagementPage />} />
            <Route path="audit" element={<AuditCenterPage />} />
            <Route path="platform" element={<PlatformControlPage />} />
          </Route>
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════
          ERROR & UTILITY
      ══════════════════════════════════════════════════════════ */}
      <Route element={<MainLayout />}>
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/505" element={<HttpVersionNotSupportedPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
