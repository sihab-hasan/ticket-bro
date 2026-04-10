// frontend/src/components/shared/Breadcrumb.jsx
//
// Universal breadcrumb — drop-in for every route in ticket-bro.
// Auto-generates crumbs from the current URL via useLocation + useParams.
// Supports optional `items` prop override for fully custom crumbs.
//
// Usage (auto mode — works everywhere):
//   import Breadcrumb from '@/components/shared/Breadcrumb';
//   <Breadcrumb />
//
// Usage (manual override):
//   <Breadcrumb items={[
//     { label: 'Home', to: '/' },
//     { label: 'Cart' },          // no `to` = current page (no link)
//   ]} />
//
// Usage (with extra wrapper classname):
//   <Breadcrumb className="mb-8" />

import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const unslugify = (slug) =>
  slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

const CATEGORY_LABELS = {
  music:          "Music",
  sports:         "Sports",
  "arts-culture": "Arts & Culture",
  "food-drink":   "Food & Drink",
  business:       "Business",
  education:      "Education",
  health:         "Health & Wellness",
  technology:     "Technology",
  "kids-family":  "Kids & Family",
  community:      "Community",
};

/* ═══════════════════════════════════════════════════════════════
   ROUTE → BREADCRUMB BUILDER
═══════════════════════════════════════════════════════════════ */
function buildCrumbs(pathname, params) {
  const crumbs = [{ label: "Home", to: "/" }];

  const {
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    eventSlug,
    bookingId,
    conversationId,
    userId,
    notificationId,
  } = params || {};

  // ── /browse (all events) ──────────────────
  if (pathname === "/browse") {
    crumbs.push({ label: "Browse", to: null });
    return crumbs;
  }

  // ── /:cat, /:cat/:sub, /:cat/:sub/:type, /:cat/:sub/:type/:slug ──
  if (categorySlug) {
    const catLabel = CATEGORY_LABELS[categorySlug] || unslugify(categorySlug);
    crumbs.push({
      label: catLabel,
      to: subCategorySlug ? `/${categorySlug}` : null,
    });

    if (subCategorySlug) {
      crumbs.push({
        label: unslugify(subCategorySlug),
        to: eventTypeSlug ? `/${categorySlug}/${subCategorySlug}` : null,
      });
    }

    if (eventTypeSlug) {
      crumbs.push({
        label: unslugify(eventTypeSlug),
        to: eventSlug ? `/${categorySlug}/${subCategorySlug}/${eventTypeSlug}` : null,
      });
    }

    if (eventSlug) {
      crumbs.push({ label: unslugify(eventSlug), to: null });
    }

    return crumbs;
  }

  // ── /events/:slug (legacy) ─────────────────
  if (pathname.startsWith("/events/")) {
    crumbs.push({ label: "Browse", to: "/browse" });
    crumbs.push({ label: unslugify(eventSlug) || "Event", to: null });
    return crumbs;
  }

  // ── /search ────────────────────────────────
  if (pathname.startsWith("/search")) {
    crumbs.push({ label: "Search", to: null });
    return crumbs;
  }

  // ── /cart ──────────────────────────────────
  if (pathname.startsWith("/cart")) {
    const isCheckout = pathname === "/cart/checkout";
    crumbs.push({ label: "Cart", to: isCheckout ? "/cart" : null });
    if (isCheckout) crumbs.push({ label: "Checkout", to: null });
    return crumbs;
  }

  // ── /tickets ───────────────────────────────
  if (pathname.startsWith("/tickets")) {
    crumbs.push({ label: "Tickets", to: null });
    if (pathname.includes("/select/"))   crumbs.push({ label: "Select Tickets",  to: null });
    if (pathname.includes("/seats/"))    crumbs.push({ label: "Seat Selection",   to: null });
    if (pathname.includes("/book/"))     crumbs.push({ label: "Book Ticket",      to: null });
    if (pathname.includes("/payment/"))  crumbs.push({ label: "Payment",          to: null });
    if (pathname.includes("/confirm/"))  crumbs.push({ label: "Confirmation",     to: null });
    if (pathname.includes("/download/")) crumbs.push({ label: "Download Ticket",  to: null });
    return crumbs;
  }

  // ── /payments ──────────────────────────────
  if (pathname.startsWith("/payments")) {
    if (pathname === "/payments/history") {
      crumbs.push({ label: "Payment History", to: null });
    } else {
      crumbs.push({ label: "Payments", to: "/payments/history" });
      if (pathname.includes("/success/"))     crumbs.push({ label: "Payment Successful", to: null });
      else if (pathname.includes("/failed/")) crumbs.push({ label: "Payment Failed",     to: null });
      else if (pathname.includes("/details/"))crumbs.push({ label: "Payment Details",    to: null });
      else                                    crumbs.push({ label: "Pay",                to: null });
    }
    return crumbs;
  }

  // ── /bookings ──────────────────────────────
  if (pathname.startsWith("/bookings")) {
    crumbs.push({ label: "My Bookings", to: bookingId ? "/bookings" : null });
    if (pathname.includes("/cancel/"))   crumbs.push({ label: "Cancel Booking", to: null });
    else if (pathname.includes("/waitlist/")) crumbs.push({ label: "Waitlist",  to: null });
    else if (bookingId)                  crumbs.push({ label: "Booking Details", to: null });
    return crumbs;
  }

  // ── /profile ───────────────────────────────
  if (pathname.startsWith("/profile")) {
    crumbs.push({ label: "Profile", to: pathname !== "/profile" ? "/profile" : null });
    if (pathname === "/profile/edit")            crumbs.push({ label: "Edit Profile",            to: null });
    if (pathname === "/profile/change-password") crumbs.push({ label: "Change Password",         to: null });
    if (pathname === "/profile/notifications")   crumbs.push({ label: "Notification Settings",   to: null });
    return crumbs;
  }

  // ── /messages ──────────────────────────────
  if (pathname.startsWith("/messages")) {
    crumbs.push({ label: "Messages", to: conversationId || userId ? "/messages" : null });
    if (pathname.includes("/conversation/")) crumbs.push({ label: "Conversation", to: null });
    if (pathname.includes("/chat/"))         crumbs.push({ label: "Chat",         to: null });
    return crumbs;
  }

  // ── /notifications ─────────────────────────
  if (pathname.startsWith("/notifications")) {
    crumbs.push({ label: "Notifications", to: notificationId ? "/notifications" : null });
    if (notificationId) crumbs.push({ label: "Notification", to: null });
    return crumbs;
  }

  // ── /reviews ───────────────────────────────
  if (pathname.startsWith("/reviews")) {
    crumbs.push({ label: "Reviews", to: null });
    if (pathname.includes("/write/")) crumbs.push({ label: "Write a Review", to: null });
    return crumbs;
  }

  // ── /organizer ─────────────────────────────
  if (pathname.startsWith("/organizer")) {
    crumbs.push({ label: "Organizer", to: "/organizer/dashboard" });
    if      (pathname === "/organizer/dashboard")          crumbs.push({ label: "Dashboard",       to: null });
    else if (pathname === "/organizer/events")             crumbs.push({ label: "My Events",        to: null });
    else if (pathname === "/organizer/events/create")    { crumbs.push({ label: "My Events",        to: "/organizer/events" }); crumbs.push({ label: "Create Event",    to: null }); }
    else if (pathname.includes("/events/edit/"))         { crumbs.push({ label: "My Events",        to: "/organizer/events" }); crumbs.push({ label: "Edit Event",      to: null }); }
    else if (pathname.includes("/events/tickets"))       { crumbs.push({ label: "My Events",        to: "/organizer/events" }); crumbs.push({ label: "Manage Tickets",  to: null }); }
    else if (pathname.startsWith("/organizer/bookings"))   crumbs.push({ label: "Bookings",         to: null });
    else if (pathname === "/organizer/revenue")            crumbs.push({ label: "Revenue",          to: null });
    else if (pathname === "/organizer/analytics")          crumbs.push({ label: "Analytics",        to: null });
    else if (pathname === "/organizer/settings")           crumbs.push({ label: "Settings",         to: null });
    return crumbs;
  }

  // ── /admin ─────────────────────────────────
  if (pathname.startsWith("/admin")) {
    crumbs.push({ label: "Admin", to: "/admin/dashboard" });
    if      (pathname === "/admin/dashboard")              crumbs.push({ label: "Dashboard",  to: null });
    else if (pathname.startsWith("/admin/users"))          crumbs.push({ label: "Users",      to: null });
    else if (pathname.startsWith("/admin/events"))         crumbs.push({ label: "Events",     to: null });
    else if (pathname.startsWith("/admin/bookings"))       crumbs.push({ label: "Bookings",   to: null });
    else if (pathname.startsWith("/admin/payments"))       crumbs.push({ label: "Payments",   to: null });
    else if (pathname === "/admin/analytics")              crumbs.push({ label: "Analytics",  to: null });
    else if (pathname === "/admin/reports")                crumbs.push({ label: "Reports",    to: null });
    else if (pathname === "/admin/promotions")             crumbs.push({ label: "Promotions", to: null });
    else if (pathname.startsWith("/admin/system")) {
      crumbs.push({ label: "System", to: null });
      if      (pathname === "/admin/system/settings") crumbs.push({ label: "Settings", to: null });
      else if (pathname === "/admin/system/logs")     crumbs.push({ label: "Logs",     to: null });
      else if (pathname === "/admin/system/security") crumbs.push({ label: "Security", to: null });
      else if (pathname === "/admin/system/health")   crumbs.push({ label: "Health",   to: null });
    }
    return crumbs;
  }

  // ── Static pages ───────────────────────────
  const staticMap = {
    "/about":   "About Us",
    "/contact": "Contact",
    "/faq":     "FAQ",
    "/privacy": "Privacy Policy",
    "/terms":   "Terms of Service",
    "/trending":"Trending",
    "/offers":  "Offers",
  };
  if (staticMap[pathname]) {
    crumbs.push({ label: staticMap[pathname], to: null });
    return crumbs;
  }

  // ── Error pages ────────────────────────────
  const errorMap = {
    "/404":         "Page Not Found",
    "/403":         "Access Denied",
    "/500":         "Server Error",
    "/505":         "HTTP Version Error",
    "/maintenance": "Maintenance",
  };
  if (errorMap[pathname]) {
    crumbs.push({ label: errorMap[pathname], to: null });
    return crumbs;
  }

  // ── Auth pages ─────────────────────────────
  if (pathname.startsWith("/auth")) {
    const authMap = {
    };
    crumbs.push({ label: authMap[pathname] || "Auth", to: null });
    return crumbs;
  }

  // ── Fallback: humanise segments ─────────────
  const segments = pathname.split("/").filter(Boolean);
  let accPath = "";
  segments.forEach((seg, i) => {
    accPath += `/${seg}`;
    const isLast = i === segments.length - 1;
    crumbs.push({ label: unslugify(seg), to: isLast ? null : accPath });
  });

  return crumbs;
}

/* ═══════════════════════════════════════════════════════════════
   BREADCRUMB COMPONENT
═══════════════════════════════════════════════════════════════ */
const Breadcrumb = ({ items, className = "" }) => {
  const { pathname } = useLocation();
  const params = useParams();

  const crumbs = items || buildCrumbs(pathname, params);

  // Don't render on home page or if only one crumb
  if (pathname === "/" || crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 flex-wrap ${className}`}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        const isHome = i === 0;

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight
                size={10}
                className="text-muted-foreground/40 shrink-0"
                aria-hidden="true"
              />
            )}

            {isLast || !crumb.to ? (
              <span
                className={`text-xs truncate max-w-[200px] ${
                  isLast
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
                aria-current={isLast ? "page" : undefined}
              >
                {isHome ? (
                  <span className="flex items-center gap-1">
                    <Home size={11} aria-hidden="true" />
                    <span className="hidden sm:inline">{crumb.label}</span>
                  </span>
                ) : crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 truncate max-w-[140px] whitespace-nowrap"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {isHome ? (
                  <span className="flex items-center gap-1">
                    <Home size={11} aria-hidden="true" />
                    <span className="hidden sm:inline">{crumb.label}</span>
                  </span>
                ) : crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;