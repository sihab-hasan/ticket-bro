import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/shared/common/Breadcrumb";
import eventsService from "@/api/events.api";
import {
  normalizeBrowseReview,
  normalizeEvent,
  normalizeTicketType,
} from "@/utils/browse.utils";
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

const Divider = () => <div className="border-t border-border" />;

const EventDetailsPage = () => {
  const { eventSlug } = useParams();
  const ticketsRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [state, setState] = useState({
    event: null,
    relatedEvents: [],
    reviews: [],
    isLoading: true,
    notFound: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [eventSlug]);

  useEffect(() => {
    let cancelled = false;

    const loadEvent = async () => {
      setState({
        event: null,
        relatedEvents: [],
        reviews: [],
        isLoading: true,
        notFound: false,
      });

      const [eventResult, ticketsResult, relatedResult, reviewsResult] =
        await Promise.allSettled([
          eventsService.getEventDetails(eventSlug),
          eventsService.getTicketTypes(eventSlug),
          eventsService.getRelatedEvents(eventSlug),
          eventsService.getEventReviews(eventSlug, {
            page: 1,
            limit: 6,
            sort: "-createdAt",
          }),
        ]);

      if (cancelled) {
        return;
      }

      if (eventResult.status !== "fulfilled" || !eventResult.value) {
        setState({
          event: null,
          relatedEvents: [],
          reviews: [],
          isLoading: false,
          notFound: true,
        });
        return;
      }

      const event = normalizeEvent(eventResult.value);
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
          ? (reviewsResult.value?.reviews || reviewsResult.value || []).map((review) =>
              normalizeBrowseReview(review, hydratedEvent),
            )
          : [];

      setState({
        event: hydratedEvent,
        relatedEvents,
        reviews,
        isLoading: false,
        notFound: false,
      });

      eventsService.trackEventView(eventSlug).catch(() => null);
    };

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [eventSlug]);

  const { event, relatedEvents, reviews, isLoading, notFound } = state;

  const handleSave = () => setSaved((current) => !current);

  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({ title: event?.title, url }).catch(() => {});
      return;
    }

    navigator.clipboard?.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  const scrollToTickets = () => {
    ticketsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) return <EventLoading />;
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

      <EventHeroSection
        event={event}
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onBook={scrollToTickets}
      />

      <Container>
        <div className="grid grid-cols-1 gap-8 py-8 xl:grid-cols-[1fr_400px] xl:gap-12 xl:py-12">
          <div className="flex min-w-0 flex-col gap-10">
            <EventAboutSection event={event} />
            <Divider />

            {event.lineup?.length > 0 && (
              <>
                <EventLineupSection event={event} />
                <Divider />
              </>
            )}

            {(event.agenda?.length > 0 || event.schedule?.length > 0) && (
              <>
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

      {shared && (
        <div
          className="fixed bottom-24 right-4 rounded-lg border border-border px-3 py-2 text-xs text-foreground shadow-lg"
          style={{ background: "var(--card)", fontFamily: "var(--font-sans)" }}
        >
          Link copied to clipboard
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
