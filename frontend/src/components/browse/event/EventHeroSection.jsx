/**
 * EventHeroSection.jsx
 * Hero: full-bleed image gallery + event identity card
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  BadgeCheck,
  Share2,
  ZoomIn,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Flame,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import Container from "@/components/layout/Container";
import {
  CapacityBar,
  StatusBadge,
  StarRow,
  fmtDate,
  fmtNum,
  fmtTime,
} from "./shared/EventShared.jsx";

const getVenueLabel = (event) => {
  if (event.location?.type === "online") {
    return "Online event";
  }
  if (event.location?.type === "hybrid") {
    return event.location?.name || event.location?.city || "Hybrid event";
  }
  return event.location?.name || event.location?.city || "Venue TBA";
};

const EventHeroSection = ({ event, saved, onSave, onShare, onBook }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const images = useMemo(
    () => Array.from(new Set([...(event.images || []), event.coverImage].filter(Boolean))),
    [event.coverImage, event.images],
  );
  const hasImages = images.length > 0;
  const safeIndex = hasImages ? Math.min(activeImg, images.length - 1) : 0;
  const activeImage = hasImages ? images[safeIndex] : null;

  useEffect(() => {
    setActiveImg(0);
    setLightbox(false);
  }, [event.id, event.slug]);

  const prev = useCallback(() => {
    if (!hasImages) return;
    setActiveImg((current) => (current - 1 + images.length) % images.length);
  }, [hasImages, images.length]);

  const next = useCallback(() => {
    if (!hasImages) return;
    setActiveImg((current) => (current + 1) % images.length);
  }, [hasImages, images.length]);

  const venueLabel = getVenueLabel(event);
  const attendanceLabel =
    event.totalCapacity != null
      ? `${fmtNum(event.totalSold)} / ${fmtNum(event.totalCapacity)}`
      : event.canPurchase === false
        ? "Registration unavailable"
        : "Open registration";

  return (
    <>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(320px, 55vh, 620px)" }}
      >
        {activeImage ? (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(24px) brightness(0.28)",
              }}
            />
            <img
              key={activeImage}
              src={activeImage}
              alt={event.title}
              className="relative h-full w-full object-contain"
              style={{ animation: "fadeIn 0.3s ease" }}
              onError={(e) => {
                e.currentTarget.style.opacity = "0.25";
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/70">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ImageIcon size={28} />
              </div>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Event cover image coming soon
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 sm:p-6">
          <div className="flex gap-1.5 flex-wrap">
            <StatusBadge status={event.status} />
            {event.isFeatured && (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: "rgba(163,230,53,0.15)",
                  borderColor: "rgba(163,230,53,0.4)",
                  color: "#a3e635",
                }}
              >
                <Sparkles size={9} /> Featured
              </span>
            )}
            {event.isTrending && (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: "rgba(251,191,36,0.15)",
                  borderColor: "rgba(251,191,36,0.4)",
                  color: "#fbbf24",
                }}
              >
                <Flame size={9} /> Trending
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSave}
              aria-label="Save"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
            >
              {saved ? (
                <BookmarkCheck size={15} className="text-lime-400" />
              ) : (
                <Bookmark size={15} className="text-white" />
              )}
            </button>
            <button
              onClick={onShare}
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
            >
              <Share2 size={15} className="text-white" />
            </button>
            <button
              onClick={() => hasImages && setLightbox(true)}
              aria-label="Zoom"
              disabled={!hasImages}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ZoomIn size={15} className="text-white" />
            </button>
          </div>
        </div>

        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                {(event.tags || []).length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {(event.tags || []).slice(0, 4).map((tag, index) => (
                      <span
                        key={tag._id || tag.id || tag.slug || index}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          color: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>
                )}
                <h1
                  className="mb-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl"
                  style={{
                    fontFamily: "var(--font-heading)",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {event.title}
                  {event.isVerified && (
                    <BadgeCheck size={22} className="ml-2 inline text-lime-400" />
                  )}
                </h1>
                {event.shortDescription && (
                  <p
                    className="mb-3 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {event.shortDescription}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <StarRow rating={event.averageRating} size={13} />
                    <span className="text-sm font-bold text-white">
                      {(event.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-white/70">
                      ({fmtNum(event.reviewCount)} reviews)
                    </span>
                  </div>
                  <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                  <span
                    className="text-base font-extrabold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {event.priceLabel ||
                      (event.isFree
                        ? "Free"
                        : `From ${event.currency === "BDT" ? "৳" : `${event.currency} `}${Number(event.minPrice || 0).toLocaleString()}`)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                {hasImages && images.length > 1 && (
                  <div className="flex gap-1 shrink-0">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImg(index)}
                        className="rounded-full transition-all"
                        style={{
                          width: index === safeIndex ? 20 : 6,
                          height: 6,
                          background:
                            index === safeIndex
                              ? "var(--color-brand-primary, #a3e635)"
                              : "rgba(255,255,255,0.4)",
                        }}
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={onBook}
                  disabled={event.canPurchase === false}
                  className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Ticket size={14} />
                  {event.canPurchase === false ? "View ticket status" : "Get tickets"}
                </button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <div className="border-b border-border" style={{ background: "var(--card)" }}>
        <Container>
          <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ background: "var(--secondary)" }}
              >
                <Calendar size={15} className="text-foreground" />
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-wide text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Date
                </p>
                <p
                  className="text-xs font-semibold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {fmtDate(event.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ background: "var(--secondary)" }}
              >
                <Clock size={15} className="text-foreground" />
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-wide text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Time
                </p>
                <p
                  className="text-xs font-semibold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {fmtTime(event.startDate)}{event.endDate ? ` – ${fmtTime(event.endDate)}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ background: "var(--secondary)" }}
              >
                <MapPin size={15} className="text-foreground" />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[10px] uppercase tracking-wide text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Venue
                </p>
                <p
                  className="truncate text-xs font-semibold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {venueLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ background: "var(--secondary)" }}
              >
                <Users size={15} className="text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] uppercase tracking-wide text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Attendance
                </p>
                <p
                  className="text-xs font-semibold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {attendanceLabel}
                </p>
                {event.totalCapacity != null && (
                  <CapacityBar soldPercentage={event.soldPercentage} className="mt-1" />
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {lightbox && activeImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(false)}
        >
          {images.length > 1 && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          )}
          <img
            src={activeImage}
            alt={event.title}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(evt) => evt.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          )}
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 text-sm font-medium text-white/70 hover:text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            ✕ Close
          </button>
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {safeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default EventHeroSection;
