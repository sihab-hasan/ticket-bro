import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Star,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/shared/common/Breadcrumb";
import eventsService from "@/api/events.api";
import {
  normalizeEvent,
  normalizeBrowseReview,
  normalizeTicketType,
} from "@/utils/browse.utils";
import { ROUTES } from "@/app/AppRoutes";
import {
  EventAboutSection,
  EventAgendaSection,
  EventFAQSection,
  EventHeroSection,
  EventLineupSection,
  EventOrganizerSection,
  EventRelatedSection,
  EventReviewsSection,
  EventSponsorsSection,
  EventStickyBar,
  EventTicketsSection,
  EventVenueSection,
} from "@/components/browse/event";

const SAVED_EVENTS_STORAGE_KEY = "ticket-bro:saved-events";
const STAFF_ROLES = new Set(["moderator", "admin", "super_admin"]);

const EventLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
      <p
        className="text-sm text-muted-foreground"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Loading event...
      </p>
    </div>
  </div>
);

const EventNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <AlertCircle size={24} className="text-muted-foreground" />
        </div>
        <div>
          <h2
            className="mb-1 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Event not found
          </h2>
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            This event may have been removed or the link is incorrect.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <ChevronLeft size={14} /> Go Back
          </button>
          <Link
            to="/browse"
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

const EventLoadError = ({ onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border p-8 text-center shadow-sm">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <AlertCircle size={24} className="text-muted-foreground" />
        </div>
        <div>
          <h2
            className="mb-1 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            We couldn't load this event
          </h2>
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Please refresh and try again. If the problem continues, the event
            may still be updating.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <RefreshCcw size={14} /> Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-accent"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <ChevronLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

const Divider = () => <div className="border-t border-border" />;

const getSavedEvents = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SAVED_EVENTS_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistSavedEvents = (items) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_EVENTS_STORAGE_KEY, JSON.stringify(items));
};

const getOrganizerId = (event) =>
  event?.organizer?._id ||
  event?.organizer?.id ||
  event?.organizerProfile?.user ||
  event?.organizerProfile?.owner ||
  null;

const getPreviewBanner = (event, user) => {
  if (!event) {
    return null;
  }

  const userId = user?._id || user?.id || null;
  const organizerId = getOrganizerId(event);
  const isOwner = Boolean(
    userId && organizerId && String(userId) === String(organizerId),
  );
  const isStaff = STAFF_ROLES.has(user?.role);
  const canManage = isOwner || isStaff;

  const sharedCta = canManage
    ? user?.role === "moderator"
      ? {
          label: "Open moderation queue",
          href: ROUTES.MODERATOR.EVENTS,
        }
      : {
          label: isStaff ? "Open admin manager" : "Continue editing",
          href:
            isStaff && event.id
              ? ROUTES.ADMIN.EVENT(event.id)
              : ROUTES.ORGANIZER.EDIT_EVENT(event.slug || event.id),
        }
    : null;

  switch (event.status) {
    case "draft":
      return {
        tone: "muted",
        title: "Draft preview",
        description:
          "This event is still a draft. Attendees cannot see or book it until it is submitted and approved.",
        cta: sharedCta,
      };
    case "pending":
      return {
        tone: "warning",
        title: "Pending review",
        description:
          "This event has been submitted for review. Ticket sales stay disabled until it is approved and published.",
        cta: sharedCta,
      };
    case "rejected":
      return {
        tone: "danger",
        title: "Needs changes",
        description:
          event.rejectionReason
            ? `Review note: ${event.rejectionReason}`
            : "This event was sent back for changes before it can go live.",
        cta: sharedCta,
      };
    case "cancelled":
      return {
        tone: "danger",
        title: "Event cancelled",
        description:
          "This event has been cancelled. New bookings are unavailable.",
        cta: sharedCta,
      };
    case "postponed":
      return {
        tone: "warning",
        title: "Event postponed",
        description:
          "This event has been postponed. Check back for updated date and venue details.",
        cta: sharedCta,
      };
    case "completed":
      return {
        tone: "muted",
        title: "Event completed",
        description:
          "This event has already finished. Ticket purchases are closed.",
        cta: sharedCta,
      };
    default:
      return null;
  }
};

const bannerToneClass = {
  muted: "border-border bg-secondary/70 text-foreground",
  warning: "border-amber-500/25 bg-amber-500/10 text-foreground",
  danger: "border-red-500/25 bg-red-500/10 text-foreground",
};

const EventDetailsPage = () => {
  const { eventSlug } = useParams();
  const ticketsRef = useRef(null);
  const shareTimerRef = useRef(null);
  const user = useSelector((state) => state.auth?.user);

  const [savedEvents, setSavedEvents] = useState(() => getSavedEvents());
  const [flashMessage, setFlashMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({
    event: null,
    relatedEvents: [],
    reviews: [],
    isLoading: true,
    notFound: false,
    loadError: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [eventSlug]);

  const saved = savedEvents.includes(eventSlug);

  useEffect(() => {
    let cancelled = false;

    const loadEvent = async () => {
      setState({
        event: null,
        relatedEvents: [],
        reviews: [],
        isLoading: true,
        notFound: false,
        loadError: false,
      });

      let rawEvent = null;

      try {
        rawEvent = await eventsService.getEventDetails(eventSlug);
      } catch {
        try {
          rawEvent = await eventsService.getEventBySlug(eventSlug);
        } catch (error) {
          if (cancelled) {
            return;
          }

          const status = error?.response?.status;
          setState({
            event: null,
            relatedEvents: [],
            reviews: [],
            isLoading: false,
            notFound: status === 404,
            loadError: status !== 404,
          });
          return;
        }
      }

      if (cancelled) {
        return;
      }

      const event = normalizeEvent(rawEvent);

      const [ticketsResult, relatedResult, reviewsResult] = await Promise.allSettled([
        eventsService.getTicketTypes(eventSlug),
        eventsService.getRelatedEvents(eventSlug),
        eventsService.getEventReviews(eventSlug, {
          page: 1,
          limit: 12,
          sort: "-createdAt",
        }),
      ]);

      if (cancelled) {
        return;
      }

      const tickets =
        ticketsResult.status === "fulfilled"
          ? (ticketsResult.value || []).map((ticket) =>
              normalizeTicketType(ticket, event.currency),
            )
          : [];

      const hydratedEvent = {
        ...event,
        tickets,
      };

      const relatedEvents =
        relatedResult.status === "fulfilled"
          ? (relatedResult.value || []).map(normalizeEvent)
          : [];
      const reviews =
        reviewsResult.status === "fulfilled"
          ? (reviewsResult.value?.items || []).map((review) =>
              normalizeBrowseReview(review, hydratedEvent),
            )
          : [];

      setState({
        event: hydratedEvent,
        relatedEvents,
        reviews,
        isLoading: false,
        notFound: false,
        loadError: false,
      });

      if (hydratedEvent.status === "published") {
        eventsService.trackEventView(eventSlug).catch(() => null);
      }
    };

    loadEvent();

    return () => {
      cancelled = true;
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
    };
  }, [eventSlug, reloadToken]);

  const { event, relatedEvents, reviews, isLoading, notFound, loadError } = state;

  const previewBanner = useMemo(
    () => getPreviewBanner(event, user),
    [event, user],
  );

  const setTimedFlash = (message) => {
    setFlashMessage(message);
    if (shareTimerRef.current) {
      window.clearTimeout(shareTimerRef.current);
    }
    shareTimerRef.current = window.setTimeout(() => setFlashMessage(""), 2200);
  };

  const handleSave = () => {
    if (saved) {
      const next = savedEvents.filter((value) => value !== eventSlug);
      persistSavedEvents(next);
      setSavedEvents(next);
      setTimedFlash("Removed from saved events");
      return;
    }

    const next = Array.from(new Set([...savedEvents, eventSlug]));
    persistSavedEvents(next);
    setSavedEvents(next);
    setTimedFlash("Saved for later");
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, url });
        setTimedFlash("Share sheet opened");
        return;
      } catch {
        // Fall back to clipboard below.
      }
    }

    try {
      await navigator.clipboard?.writeText(url);
      setTimedFlash("Link copied to clipboard");
    } catch {
      setTimedFlash("Copy the page URL from your address bar");
    }
  };

  const scrollToTickets = () => {
    ticketsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) return <EventLoading />;
  if (loadError) {
    return <EventLoadError onRetry={() => setReloadToken((current) => current + 1)} />;
  }
  if (notFound || !event) return <EventNotFound />;

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 80 }}>
      <div
        className="border-b border-border"
        style={{ background: "var(--background)" }}
      >
        <Container>
          <div className="py-3">
            <Breadcrumb />
          </div>
        </Container>
      </div>

      {previewBanner && (
        <Container>
          <div
            className={`mt-4 flex flex-col gap-3 rounded-2xl border px-4 py-4 shadow-sm ${bannerToneClass[previewBanner.tone]}`}
          >
            <div>
              <p
                className="text-sm font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {previewBanner.title}
              </p>
              <p
                className="mt-1 text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {previewBanner.description}
              </p>
            </div>
            {previewBanner.cta && (
              <div>
                <Link
                  to={previewBanner.cta.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-background"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {previewBanner.cta.label} <ExternalLink size={12} />
                </Link>
              </div>
            )}
          </div>
        </Container>
      )}

      <EventHeroSection
        event={event}
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onBook={scrollToTickets}
      />

      <Container>
        <div className="grid grid-cols-1 gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12 xl:py-12">
          <div className="flex min-w-0 flex-col gap-10">
            <EventAboutSection event={event} />
            <Divider />

            {event.lineup?.length > 0 && (
              <>
                <EventLineupSection event={event} />
                <Divider />
              </>
            )}

            {event.agenda?.length > 0 && (
              <>
                {/*
                 * Only show the agenda section when the event has at least one agenda item.
                 * The backend schema does not include an `event.schedule` field; older
                 * mocks referenced `schedule` but it is not part of the production model.
                 */}
                <EventAgendaSection event={event} />
                <Divider />
              </>
            )}

            <EventVenueSection event={event} />
            <Divider />

            <EventOrganizerSection event={event} />
            <Divider />

            {event.sponsors?.length > 0 && (
              <>
                <EventSponsorsSection event={event} />
                <Divider />
              </>
            )}

            <EventReviewsSection event={event} reviews={reviews} />
            <Divider />

            <div
              className="rounded-2xl border border-border p-6"
              style={{ background: "var(--card)" }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border"
                    style={{ background: "var(--secondary)" }}
                  >
                    <MessageSquare size={20} className="text-foreground" />
                  </div>
                  <div>
                    <p
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Attended this event?
                    </p>
                    <p
                      className="mt-2 text-sm leading-relaxed text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Read attendee feedback, or leave your own review to help
                      future buyers understand what this event is like.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:min-w-[220px]">
                  <Link
                    to={event.slug ? ROUTES.REVIEWS.EVENT(event.slug) : ROUTES.REVIEWS.ROOT}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-background"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <MessageSquare size={14} /> View All Event Reviews
                  </Link>
                  <Link
                    to={ROUTES.REVIEWS.WRITE(event.id || event.slug)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                      background: "var(--foreground)",
                      color: "var(--background)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <Star size={14} />
                    {user ? "Write a Review" : "Sign In to Review"}
                  </Link>
                </div>
              </div>
            </div>

            {event.faqs?.length > 0 && (
              <>
                <Divider />
                <EventFAQSection event={event} />
              </>
            )}

            <div className="xl:hidden" ref={ticketsRef}>
              <Divider />
              <div
                className="mt-10 rounded-2xl border border-border p-5"
                style={{ background: "var(--card)" }}
              >
                <EventTicketsSection event={event} />
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <div ref={ticketsRef} className="sticky top-24">
              <div
                className="rounded-2xl border border-border p-6"
                style={{ background: "var(--card)" }}
              >
                <EventTicketsSection event={event} />
              </div>

              <div
                className="mt-4 flex flex-col gap-2 rounded-xl border border-border p-4"
                style={{ background: "var(--secondary)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Quick Info
                </p>
                {[
                  { label: "Category", value: event.category?.name || "-" },
                  {
                    label: "Subcategory",
                    value: event.subcategory?.name || "-",
                  },
                  { label: "Event Type", value: event.eventType?.name || "-" },
                  { label: "Timezone", value: event.timezone || "Asia/Dhaka" },
                  { label: "Currency", value: event.currency || "BDT" },
                  {
                    label: "Visibility",
                    value:
                      event.visibility?.charAt(0)?.toUpperCase() +
                        event.visibility?.slice(1) ||
                      "Public",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-2"
                  >
                    <span
                      className="text-[11px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-right text-[11px] font-medium text-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <EventRelatedSection event={event} events={relatedEvents} />
      <EventStickyBar event={event} onBook={scrollToTickets} />

      {flashMessage && (
        <div
          className="fixed bottom-24 right-4 rounded-lg border border-border px-3 py-2 text-xs text-foreground shadow-lg"
          style={{ background: "var(--card)", fontFamily: "var(--font-sans)" }}
        >
          {flashMessage}
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
