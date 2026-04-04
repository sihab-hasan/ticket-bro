/**
 * BrowseEventCard.jsx
 * Resilient card renderer for both normalized browse events and fresh organizer-created events.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Calendar, Clock, Star, BadgeCheck,
  Bookmark, BookmarkCheck, Users, Ticket,
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
  return date.toLocaleDateString("en-BD", { weekday:"short", month:"short", day:"numeric" });
};

const fmtTime = (iso) => {
  if (!iso) return "Time TBA";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Time TBA";
  return date.toLocaleTimeString("en-BD", { hour:"numeric", minute:"2-digit", hour12:true });
};

const CapacityBar = ({ event }) => {
  const pct = Math.max(0, Math.min(100, event?.soldPercentage ?? spotsPercent(event)));
  return (
    <div className="h-0.5 rounded-full bg-secondary overflow-hidden">
      <div className="h-full rounded-full transition-all"
        style={{ width:`${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }} />
    </div>
  );
};

const RatingRow = ({ event, className = "" }) => (
  <div className={`flex items-center gap-0.5 ${className}`}>
    <Star size={11} className="text-foreground fill-foreground" />
    <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily:"var(--font-sans)" }}>
      {(Number(event?.averageRating || event?.avgRating || event?.rating || 0)).toFixed(1)}
    </span>
    <span className="text-[11px] text-muted-foreground" style={{ fontFamily:"var(--font-sans)" }}>
      ({event?.reviewCount ?? 0})
    </span>
  </div>
);

const TagPills = ({ tags = [], max = 2 }) => (
  <div className="flex gap-1 flex-wrap">
    {tags.slice(0, max).map((tag) => (
      <span key={tag._id ?? tag.name}
        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
        style={{ borderColor:"var(--border)", color:"var(--muted-foreground)", background:"var(--secondary)", fontFamily:"var(--font-sans)" }}>
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
    aria-label={saved?"Unsave":"Save"}
    className={`flex items-center justify-center w-7 h-7 rounded-md border ${dark ? "border-white/20 bg-black/30 backdrop-blur-sm" : "border-border bg-background/70"} hover:opacity-80 transition-opacity`}
  >
    {saved
      ? <BookmarkCheck size={13} className={dark?"text-white":"text-foreground"} />
      : <Bookmark      size={13} className={dark?"text-white":"text-muted-foreground"} />}
  </button>
);

const CoverImage = ({ event, className = "w-full h-full object-cover" }) => {
  const [failed, setFailed] = useState(false);
  const src = getEventImage(event);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
        <Ticket size={28} />
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

const StatusChips = ({ event, showBadge }) => {
  const soldOut = isEventSoldOut(event);
  if (!soldOut && !(showBadge && event?.isTrending) && !event?.isFree) return null;

  return (
    <>
      {event?.isFree && (
        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ background:"var(--foreground)",color:"var(--background)",fontFamily:"var(--font-brand)" }}>
          Free
        </span>
      )}
      {soldOut && (
        <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm"
          style={{ background:"rgba(0,0,0,0.72)",color:"white",fontFamily:"var(--font-sans)" }}>
          Sold Out
        </span>
      )}
      {!soldOut && showBadge && event?.isTrending && (
        <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm"
          style={{ background:"var(--foreground)",color:"var(--background)",fontFamily:"var(--font-sans)" }}>
          🔥 Trending
        </span>
      )}
    </>
  );
};

const CardGrid = ({ event: e, saved, onSave, showBadge }) => {
  const eventId = getEventIdentity(e);
  const href = getEventUrl(e);
  const locationLabel = getEventLocationLabel(e);
  const priceLabel = getEventPriceLabel(e);

  return (
    <Link to={href} className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all">
      <div className="relative h-40 overflow-hidden bg-muted shrink-0">
        <CoverImage event={e} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        <div className="absolute top-2 right-2"><SaveBtn saved={saved} onSave={onSave} eventId={eventId} dark /></div>
        <StatusChips event={e} showBadge={showBadge} />
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <TagPills tags={getEventTags(e)} />
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:underline" style={{ fontFamily:"var(--font-heading)" }}>
          {e?.title || "Untitled event"}{e?.organizer?.isVerified && <BadgeCheck size={11} className="inline ml-1 text-foreground" />}
        </h3>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily:"var(--font-sans)" }}>
            <Calendar size={10} className="shrink-0" />
            <span>{fmtDate(e?.startDate)}</span>
            <span className="text-border">·</span>
            <Clock size={10} className="shrink-0" />
            <span>{fmtTime(e?.startDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily:"var(--font-sans)" }}>
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>
        </div>
        <CapacityBar event={e} />
        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto gap-2">
          <RatingRow event={e} />
          <span className="text-sm font-bold text-foreground text-right" style={{ fontFamily:"var(--font-heading)" }}>{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
};

const CardList = ({ event: e, saved, onSave }) => {
  const eventId = getEventIdentity(e);
  const locationLabel = getEventLocationLabel(e);
  const priceLabel = getEventPriceLabel(e);
  const spotsLeft = getEventSpotsLeft(e);

  return (
    <Link to={getEventUrl(e)} className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all">
      <div className="relative w-24 h-24 rounded shrink-0 overflow-hidden bg-muted">
        <CoverImage event={e} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
        {e?.isFree && <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background:"var(--foreground)",color:"var(--background)",fontFamily:"var(--font-brand)" }}>Free</span>}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:underline" style={{ fontFamily:"var(--font-heading)" }}>
              {e?.title || "Untitled event"}{e?.organizer?.isVerified && <BadgeCheck size={11} className="inline ml-1" />}
            </h3>
            <SaveBtn saved={saved} onSave={onSave} eventId={eventId} />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mb-1.5" style={{ fontFamily:"var(--font-sans)" }}>
            <span className="flex items-center gap-1"><Calendar size={10} />{fmtDate(e?.startDate)} · {fmtTime(e?.startDate)}</span>
            <span className="flex items-center gap-1"><MapPin size={10} />{locationLabel}</span>
          </div>
          <TagPills tags={getEventTags(e, 3)} max={3} />
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <RatingRow event={e} />
            <div className="w-12 h-0.5 rounded-full bg-secondary overflow-hidden hidden sm:block">
              <div className="h-full rounded-full" style={{ width:`${Math.max(0, Math.min(100, spotsPercent(e)))}%`, background: spotsPercent(e)>85?"var(--destructive)":"var(--foreground)" }} />
            </div>
            {typeof spotsLeft === 'number' && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap" style={{ fontFamily:"var(--font-sans)" }}>
                {spotsLeft} left
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-foreground text-right" style={{ fontFamily:"var(--font-heading)" }}>{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
};

const CardFeatured = ({ event: e, saved, onSave }) => {
  const eventId = getEventIdentity(e);
  return (
    <Link to={getEventUrl(e)} className="group relative rounded-lg overflow-hidden border border-border hover:border-foreground/20 hover:shadow-lg transition-all aspect-[16/9]">
      <CoverImage event={e} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute top-3 right-3"><SaveBtn saved={saved} onSave={onSave} eventId={eventId} dark /></div>
      {e?.isTrending && <span className="absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background:"var(--foreground)",color:"var(--background)",fontFamily:"var(--font-sans)" }}>🔥 Trending</span>}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <TagPills tags={getEventTags(e, 2)} max={2} />
        <h3 className="text-base font-bold text-white mt-1.5 line-clamp-2 group-hover:underline" style={{ fontFamily:"var(--font-heading)" }}>
          {e?.title || "Untitled event"}{e?.organizer?.isVerified && <BadgeCheck size={12} className="inline ml-1 text-white/80" />}
        </h3>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/80" style={{ fontFamily:"var(--font-sans)" }}>
            <span className="flex items-center gap-1"><Calendar size={10} />{fmtDate(e?.startDate)}</span>
            <span className="flex items-center gap-1"><MapPin size={10} />{getEventLocationLabel(e)}</span>
            <span className="flex items-center gap-1"><Users size={10} />{formatAttendees(Number(e?.totalSold || e?.attendees || 0))} going</span>
          </div>
          <span className="text-sm font-bold text-white shrink-0 text-right" style={{ fontFamily:"var(--font-heading)" }}>{getEventPriceLabel(e)}</span>
        </div>
      </div>
    </Link>
  );
};

const CardCompact = ({ event: e, showDistance }) => (
  <Link to={getEventUrl(e)} className="group flex items-center gap-3 p-2.5 rounded-md border border-border bg-card hover:border-foreground/20 hover:bg-accent/30 transition-all">
    <div className="relative w-14 h-14 rounded shrink-0 overflow-hidden bg-muted">
      <CoverImage event={e} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1 group-hover:underline" style={{ fontFamily:"var(--font-heading)" }}>{e?.title || "Untitled event"}</h4>
      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground" style={{ fontFamily:"var(--font-sans)" }}>
        <span className="flex items-center gap-0.5"><Calendar size={9} />{fmtDate(e?.startDate)}</span>
        {showDistance && <span className="flex items-center gap-0.5"><MapPin size={9} />{getEventLocationLabel(e)}</span>}
      </div>
    </div>
    <span className="text-xs font-bold text-foreground shrink-0 text-right" style={{ fontFamily:"var(--font-heading)" }}>{getEventPriceLabel(e)}</span>
  </Link>
);

const CardHorizontal = ({ event: e, saved, onSave, showBadge }) => {
  const eventId = getEventIdentity(e);
  return (
    <Link to={getEventUrl(e)} className="group flex gap-4 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all">
      <div className="relative w-32 h-28 rounded shrink-0 overflow-hidden bg-muted">
        <CoverImage event={e} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
        {showBadge && e?.isTrending && <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background:"var(--foreground)",color:"var(--background)",fontFamily:"var(--font-sans)" }}>🔥</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <TagPills tags={getEventTags(e, 2)} max={2} />
            <h3 className="text-sm font-bold text-foreground mt-1.5 line-clamp-2 group-hover:underline" style={{ fontFamily:"var(--font-heading)" }}>
              {e?.title || "Untitled event"}{e?.organizer?.isVerified && <BadgeCheck size={11} className="inline ml-1" />}
            </h3>
          </div>
          <SaveBtn saved={saved} onSave={onSave} eventId={eventId} />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-1.5" style={{ fontFamily:"var(--font-sans)" }}>
          <span className="flex items-center gap-1"><Calendar size={10} />{fmtDate(e?.startDate)} · {fmtTime(e?.startDate)}</span>
          <span className="flex items-center gap-1"><MapPin size={10} />{getEventLocationLabel(e)}</span>
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <RatingRow event={e} />
          <span className="text-sm font-bold text-foreground text-right" style={{ fontFamily:"var(--font-heading)" }}>{getEventPriceLabel(e)}</span>
        </div>
      </div>
    </Link>
  );
};

const BrowseEventCard = ({ event, variant="grid", saved=false, onSave=()=>{}, showBadge=false, showDistance=false, showReason=false }) => {
  const props = { event, saved, onSave, showBadge, showDistance, showReason };
  switch (variant) {
    case "list":       return <CardList       {...props} />;
    case "featured":   return <CardFeatured   {...props} />;
    case "compact":    return <CardCompact    {...props} />;
    case "horizontal": return <CardHorizontal {...props} />;
    default:           return <CardGrid       {...props} />;
  }
};

export default BrowseEventCard;
