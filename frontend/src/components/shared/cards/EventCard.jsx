/**
 * BrowseEventCard.jsx
 * Resilient card renderer for both normalized browse events and fresh organizer-created events.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Star,
  Ticket,
  Users,
  Video,
} from "lucide-react";
import { spotsPercent, formatAttendees } from "@/hooks";
import {
  getEventIdentity,
  getEventImage,
  getEventLocationLabel,
  getEventPriceLabel,
  getEventSpotsLeft,
  getEventTags,
  getEventUrl,
  isEventSoldOut,
} from "@/utils/event-card";

const fmtDate = (iso) => {
  if (!iso) return "Date TBA";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString("en-BD", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const fmtTime = (iso) => {
  if (!iso) return "Time TBA";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Time TBA";
  return date.toLocaleTimeString("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getOrganizerName = (event = {}) =>
  event?.organizer?.name ||
  event?.organizerProfile?.displayName ||
  event?.organizerName ||
  "Organizer";

const getFormatMeta = (event = {}) => {
  const type = event?.location?.type || (event?.isOnline ? "online" : "physical");

  if (type === "online") {
    return {
      label: "Online",
      icon: Video,
    };
  }

  if (type === "hybrid") {
    return {
      label: "Hybrid",
      icon: Video,
    };
  }

  return {
    label: "In Person",
    icon: MapPin,
  };
};

const getDemandCopy = (event = {}) => {
  if (isEventSoldOut(event)) {
    return "Sold out";
  }

  const spotsLeft = getEventSpotsLeft(event);
  if (typeof spotsLeft === "number") {
    if (spotsLeft <= 15) return `${spotsLeft} tickets left`;
    if (spotsLeft <= 75) return `${spotsLeft} spots remaining`;
    return `${spotsLeft} spots open`;
  }

  const sold = Number(event?.totalSold || event?.attendees || 0);
  if (sold > 0) {
    return `${formatAttendees(sold)} going`;
  }

  return "On sale now";
};

const getRecommendationReason = (event = {}) => {
  if (event?.isTrending) return "Trending with buyers";
  if (event?.isFeatured) return "Featured by the team";
  if (Number(event?.averageRating || event?.rating || 0) >= 4.5) return "Loved by attendees";
  if (event?.isFree) return "Free to attend";
  if (Number(event?.totalSold || event?.attendees || 0) >= 100) return "Popular right now";
  return "Worth a look";
};

const OfferCallout = ({ event, inverse = false }) => {
  if (!event?.offer) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${
        inverse
          ? "border-white/10 bg-white/10 text-white"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            inverse ? "bg-white/15 text-white" : "bg-emerald-600 text-white"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {event.offer.badge}
        </span>
        <span
          className={`text-[11px] font-medium ${inverse ? "text-white/80" : "text-emerald-800"}`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {event.offer.label}
        </span>
      </div>
    </div>
  );
};

const CapacityBar = ({ event }) => {
  const pct = Math.max(0, Math.min(100, event?.soldPercentage ?? spotsPercent(event)));

  return (
    <div className="h-1 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: pct > 85 ? "var(--destructive)" : "var(--foreground)",
        }}
      />
    </div>
  );
};

const RatingRow = ({ event, className = "" }) => {
  const rating = Number(event?.averageRating || event?.avgRating || event?.rating || 0);
  const reviewCount = Number(event?.reviewCount || 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star size={11} className="text-foreground fill-foreground" />
      <span
        className="text-[11px] font-semibold text-foreground"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {rating > 0 ? rating.toFixed(1) : "New"}
      </span>
      {reviewCount > 0 && (
        <span
          className="text-[11px] text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

const TagPills = ({ tags = [], max = 2, tone = "default" }) => (
  <div className="flex gap-1 flex-wrap">
    {tags.slice(0, max).map((tag) => (
      <span
        key={tag._id ?? tag.name}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
          tone === "inverse"
            ? "border-white/15 bg-white/10 text-white/80"
            : "border-border bg-secondary text-muted-foreground"
        }`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {tag.name}
      </span>
    ))}
  </div>
);

const SaveBtn = ({ saved, onSave, eventId, dark = false }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (eventId) onSave(eventId);
    }}
    aria-label={saved ? "Unsave" : "Save"}
    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
      dark
        ? "border-white/15 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
        : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
    }`}
  >
    {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
  </button>
);

const CoverImage = ({ event, className = "w-full h-full object-cover" }) => {
  const [failed, setFailed] = useState(false);
  const src = getEventImage(event);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
        <Ticket size={30} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={event?.title || "Event"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const OverlayChips = ({ event, showBadge }) => {
  const soldOut = isEventSoldOut(event);
  const format = getFormatMeta(event);
  const FormatIcon = format.icon;

  return (
    <>
      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
        {event?.offer?.kind === "promotion" && (
          <span
            className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {event.offer.badge}
          </span>
        )}
        {event?.isFree && (
          <span
            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-black"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Free
          </span>
        )}
        {(event?.location?.type === "online" || event?.location?.type === "hybrid") && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-sm"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <FormatIcon size={10} />
            {format.label}
          </span>
        )}
      </div>

      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
        {soldOut && (
          <span
            className="rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Sold Out
          </span>
        )}
        {!soldOut && showBadge && event?.isTrending && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-black"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Flame size={10} />
            Trending
          </span>
        )}
      </div>
    </>
  );
};

const EventMetaBlock = ({ event, muted = false }) => {
  const format = getFormatMeta(event);
  const FormatIcon = format.icon;
  const textTone = muted ? "text-white/80" : "text-muted-foreground";

  return (
    <div className="space-y-1.5">
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${textTone}`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span className="flex items-center gap-1">
          <Calendar size={10} className="shrink-0" />
          {fmtDate(event?.startDate)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={10} className="shrink-0" />
          {fmtTime(event?.startDate)}
        </span>
      </div>
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${textTone}`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span className="flex min-w-0 items-center gap-1">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">{getEventLocationLabel(event)}</span>
        </span>
        <span className="flex items-center gap-1">
          <FormatIcon size={10} className="shrink-0" />
          {format.label}
        </span>
      </div>
    </div>
  );
};

const AvailabilityRow = ({ event, inverse = false }) => (
  <div className="space-y-2">
    <CapacityBar event={event} />
    <div
      className={`flex items-center justify-between gap-2 text-[11px] ${
        inverse ? "text-white/75" : "text-muted-foreground"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <span>{getDemandCopy(event)}</span>
      <span className={inverse ? "text-white/85" : "text-foreground"}>
        {formatAttendees(Number(event?.totalSold || event?.attendees || 0))} sold
      </span>
    </div>
  </div>
);

const CardGrid = ({ event: e, saved, onSave, showBadge }) => {
  const eventId = getEventIdentity(e);
  const href = getEventUrl(e);
  const organizerName = getOrganizerName(e);
  const priceLabel = getEventPriceLabel(e);

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden bg-muted shrink-0">
        <CoverImage
          event={e}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute right-3 top-3">
          <SaveBtn saved={saved} onSave={onSave} eventId={eventId} dark />
        </div>
        <OverlayChips event={e} showBadge={showBadge} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TagPills tags={getEventTags(e)} />
        <OfferCallout event={e} />

        <div>
          <p
            className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {organizerName}
          </p>
          <h3
            className="text-base font-bold leading-snug text-foreground line-clamp-2 group-hover:underline"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {e?.title || "Untitled event"}
            {e?.organizer?.isVerified && <BadgeCheck size={12} className="inline ml-1 text-foreground" />}
          </h3>
        </div>

        <EventMetaBlock event={e} />
        <AvailabilityRow event={e} />

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <RatingRow event={e} />
          <span
            className="text-sm font-bold text-foreground text-right"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};

const CardList = ({ event: e, saved, onSave }) => {
  const eventId = getEventIdentity(e);
  const priceLabel = getEventPriceLabel(e);

  return (
    <Link
      to={getEventUrl(e)}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
        <CoverImage
          event={e}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute bottom-2 left-2">
          {(e?.location?.type === "online" || e?.location?.type === "hybrid") && (
            <span
              className="rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {getFormatMeta(e).label}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {getOrganizerName(e)}
              </p>
              <h3
                className="text-base font-bold leading-snug text-foreground line-clamp-2 group-hover:underline"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {e?.title || "Untitled event"}
                {e?.organizer?.isVerified && <BadgeCheck size={11} className="inline ml-1" />}
              </h3>
            </div>
            <SaveBtn saved={saved} onSave={onSave} eventId={eventId} />
          </div>

          <EventMetaBlock event={e} />
          <div className="mt-2">
            <TagPills tags={getEventTags(e)} max={3} />
          </div>
          {e?.offer && (
            <div className="mt-2">
              <OfferCallout event={e} />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AvailabilityRow event={e} />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <RatingRow event={e} />
            <span
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {priceLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CardFeatured = ({ event: e, saved, onSave }) => {
  const eventId = getEventIdentity(e);

  return (
    <Link
      to={getEventUrl(e)}
      className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-border transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl"
    >
      <CoverImage
        event={e}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <div className="absolute right-4 top-4">
        <SaveBtn saved={saved} onSave={onSave} eventId={eventId} dark />
      </div>
      <OverlayChips event={e} showBadge />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <TagPills tags={getEventTags(e)} max={2} tone="inverse" />
        {e?.offer && (
          <div className="mt-3">
            <OfferCallout event={e} inverse />
          </div>
        )}
        <p
          className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {getOrganizerName(e)}
        </p>
        <h3
          className="mt-1 text-xl font-bold leading-tight text-white line-clamp-2 group-hover:underline"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {e?.title || "Untitled event"}
          {e?.organizer?.isVerified && <BadgeCheck size={13} className="inline ml-1 text-white/80" />}
        </h3>
        <div className="mt-3">
          <EventMetaBlock event={e} muted />
        </div>
        <div className="mt-4">
          <AvailabilityRow event={e} inverse />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div
            className="flex items-center gap-2 text-[11px] text-white/80"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Users size={11} />
            <span>{formatAttendees(Number(e?.totalSold || e?.attendees || 0))} going</span>
          </div>
          <span
            className="text-base font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {getEventPriceLabel(e)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const CardCompact = ({ event: e, showDistance }) => (
  <Link
    to={getEventUrl(e)}
    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:border-foreground/20 hover:bg-accent/30"
  >
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
      <CoverImage
        event={e}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      />
    </div>
    <div className="min-w-0 flex-1">
      <h4
        className="line-clamp-1 text-sm font-bold leading-snug text-foreground group-hover:underline"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {e?.title || "Untitled event"}
      </h4>
      <div
        className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span className="flex items-center gap-0.5">
          <Calendar size={9} />
          {fmtDate(e?.startDate)}
        </span>
        {showDistance && (
          <span className="flex items-center gap-0.5">
            <MapPin size={9} />
            {getEventLocationLabel(e)}
          </span>
        )}
      </div>
    </div>
    <span
      className="text-xs font-bold text-foreground shrink-0 text-right"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {getEventPriceLabel(e)}
    </span>
  </Link>
);

const CardHorizontal = ({ event: e, saved, onSave, showBadge, showReason }) => {
  const eventId = getEventIdentity(e);

  return (
    <Link
      to={getEventUrl(e)}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted">
        <CoverImage
          event={e}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {showBadge && e?.isTrending && (
          <span
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-black"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Flame size={10} />
            Hot
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {showReason && (
              <span
                className="mb-2 inline-flex rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-medium text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {getRecommendationReason(e)}
              </span>
            )}
            <OfferCallout event={e} />
            <TagPills tags={getEventTags(e)} max={2} />
            <h3
              className="mt-2 text-base font-bold text-foreground line-clamp-2 group-hover:underline"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {e?.title || "Untitled event"}
              {e?.organizer?.isVerified && <BadgeCheck size={11} className="inline ml-1" />}
            </h3>
            <p
              className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {getOrganizerName(e)}
            </p>
          </div>
          <SaveBtn saved={saved} onSave={onSave} eventId={eventId} />
        </div>

        <div className="mt-3">
          <EventMetaBlock event={e} />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AvailabilityRow event={e} />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <RatingRow event={e} />
            <span
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {getEventPriceLabel(e)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const BrowseEventCard = ({
  event,
  variant = "grid",
  saved = false,
  onSave = () => {},
  showBadge = false,
  showDistance = false,
  showReason = false,
}) => {
  const props = { event, saved, onSave, showBadge, showDistance, showReason };

  switch (variant) {
    case "list":
      return <CardList {...props} />;
    case "featured":
      return <CardFeatured {...props} />;
    case "compact":
      return <CardCompact {...props} />;
    case "horizontal":
      return <CardHorizontal {...props} />;
    default:
      return <CardGrid {...props} />;
  }
};

export default BrowseEventCard;
