// frontend/src/components/home/HeroSection.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Ticket,
  MapPin,
  Calendar,
  Sparkles,
  Star,
  TrendingUp,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBrowse } from "@/hooks";

// ── helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return "Date TBA";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  } catch { return "Date TBA"; }
};

const formatPrice = (event) => {
  if (event.isFree) return "Free";
  if (event.minPrice) return `${event.currency || "BDT"} ${event.minPrice.toLocaleString()}`;
  return "See prices";
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80";

// ── StatusChip ─────────────────────────────────────────────────────────────────

const StatusChip = ({ event }) => {
  if (event.isTrending && event.trendScore > 85)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.25em] bg-orange-500/20 text-orange-400 border border-orange-500/30">
        <Flame size={10} /> Hot Pick
      </span>
    );
  if (event.isTrending)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.25em] bg-green-500/20 text-green-400 border border-green-500/30">
        <TrendingUp size={10} /> Trending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.25em] bg-primary/20 text-primary border border-primary/30">
      <Sparkles size={10} /> Featured
    </span>
  );
};

// ── HeroSection ───────────────────────────────────────────────────────────────

const HeroSection = () => {
  const navigate = useNavigate();
  const {
    getFeatured,
    getTrending,
    buildEventUrl,
    locationLabel,
    locationFlag,
    totalCount,
    config,
  } = useBrowse();

  // Spotlight pool: featured first, backfilled with trending
  const spotlightEvents = React.useMemo(() => {
    const featured = getFeatured();
    const trending = getTrending();
    const merged = [...featured];
    trending.forEach((e) => {
      if (!merged.find((x) => x._id === e._id)) merged.push(e);
    });
    return merged.slice(0, 12);
  }, [getFeatured, getTrending]);

  const [index, setIndex] = useState(0);

  const handleNext = useCallback(() => {
    if (spotlightEvents.length <= 1) return;
    setIndex((p) => (p + 1) % spotlightEvents.length);
  }, [spotlightEvents.length]);

  const handlePrev = useCallback(() => {
    if (spotlightEvents.length <= 1) return;
    setIndex((p) => (p - 1 + spotlightEvents.length) % spotlightEvents.length);
  }, [spotlightEvents.length]);

  // Auto-advance
  useEffect(() => {
    if (spotlightEvents.length <= 1) return;
    const t = setInterval(handleNext, 6000);
    return () => clearInterval(t);
  }, [spotlightEvents.length, handleNext]);

  // Swipe support
  const onDragEnd = (_e, { offset, velocity }) => {
    if (Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 300) {
      offset.x > 0 ? handlePrev() : handleNext();
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!spotlightEvents.length) {
    return (
      <section className="w-full bg-background pt-4">
        <div className="content-shell">
          <div className="h-[350px] md:h-[500px] flex flex-col items-center justify-center rounded-sm border border-border">
            <MapPin size={40} className="text-primary opacity-30 mb-4" />
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest text-center px-4">
              No spotlight events in {locationLabel}
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-medium uppercase tracking-wider hover:opacity-90 transition-all"
            >
              Browse All Events
            </button>
          </div>
        </div>
      </section>
    );
  }

  const current = spotlightEvents[index];
  const coverImg = current.coverImage || current.images?.[0] || FALLBACK_IMG;
  const venue = current.location?.name || current.location?.addressLabel || "Venue TBA";
  const city  = current.location?.city || locationLabel;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${current.title} ${venue} ${city}`)}`;

  // Animation variants
  const imgVariants = {
    initial: { opacity: 0, scale: 1.08 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, scale: 1.04, transition: { duration: 0.7 } },
  };
  const contentVariants = {
    initial: { opacity: 0, x: -28 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", damping: 26, stiffness: 100, delay: 0.15 } },
    exit:    { opacity: 0, x: 16, transition: { duration: 0.28 } },
  };
  const badgeVariants = {
    initial: { opacity: 0, y: -16, scale: 0.85 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 14, stiffness: 220, delay: 0.45 } },
    exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  return (
    <section className="bg-background pt-4">
      <div className="content-shell">
        <div className="relative h-[350px] sm:h-[420px] md:h-[520px] overflow-hidden rounded-sm group/banner">
          {/* ── IMAGE CAROUSEL ───────────────────────────────────────── */}
          <div className="absolute inset-0 z-0 touch-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${current._id}-${index}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onDragEnd}
                variants={imgVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
              >
                <img
                  src={coverImg}
                  alt={current.title}
                  className="w-full h-full object-cover opacity-55 pointer-events-none"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── MOBILE ARROWS ────────────────────────────────────────── */}
          {spotlightEvents.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-20 md:hidden pointer-events-none">
              <button onClick={handlePrev} aria-label="Previous"
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/20 bg-black/50 text-white backdrop-blur-md pointer-events-auto active:scale-90 transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNext} aria-label="Next"
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/20 bg-black/50 text-white backdrop-blur-md pointer-events-auto active:scale-90 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── CONTENT OVERLAY ──────────────────────────────────────── */}
          <div className="relative z-10 h-full flex flex-col pt-4 sm:pt-6 md:pt-8 px-6 sm:px-10 md:px-12 pb-6 sm:pb-10 md:pb-12 pointer-events-none">
            {/* ── TOP ROW (STATUS + BADGES) ───────────────────────────── */}
            <div className="flex items-start justify-between w-full pointer-events-auto">
              {/* LEFT: Status */}
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-primary" />
                <StatusChip event={current} />
              </div>

              {/* RIGHT: Badges */}
              <div className="flex gap-2 flex-wrap justify-end max-w-[55%]">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/20 rounded-sm flex items-center gap-1.5">
                  <span>{locationFlag}</span>
                  <span>{locationLabel}</span>
                </span>

                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/20 rounded-sm">
                  {current.category?.name || config.label}
                </span>

                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-primary/90 backdrop-blur-md text-white rounded-sm">
                  {formatPrice(current)}
                </span>
              </div>
            </div>

            {/* ── TITLE BLOCK ─────────────────────────────────────────── */}
            <div className="mt-6 sm:mt-8 max-w-3xl flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${current._id}-${index}`}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-[0.92] line-clamp-3">
                    {current.title}
                  </h1>

                  {current.shortDescription && (
                    <p className="mt-3 text-white/65 text-sm max-w-xl line-clamp-2 hidden sm:block">
                      {current.shortDescription}
                    </p>
                  )}

                  {current.averageRating > 0 && (
                    <div className="mt-3 items-center gap-2 hidden sm:flex">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13}
                            className={i < Math.floor(current.averageRating)
                                ? "text-yellow-400 fill-yellow-400"
                              : "text-white/30"} />
                        ))}
                      </div>
                      <span className="text-white/70 text-xs">
                        {current.averageRating} · {(current.reviewCount || 0).toLocaleString()} reviews
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Info row + actions */}
            <div className="mt-auto space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`info-${current._id}-${index}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.28, duration: 0.45 } }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-2 border-l-2 border-primary pl-4 md:pl-6 pointer-events-auto"
                >
                  <div className="flex items-center gap-2.5 text-white/70">
                    <Calendar size={14} className="text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide">
                      {formatDate(current.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                      className="relative text-xs sm:text-sm font-medium tracking-wide text-white/85 hover:text-primary  group/loc">
                      {venue}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/loc:w-full" />
                    </a>
                  </div>
                  {current.spotsLeft > 0 && current.spotsLeft < 100 && (
                    <p className="text-[11px] text-orange-400 font-semibold">
                      Only {current.spotsLeft} spots left!
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* CTA + desktop arrows */}
              <div className="flex flex-row items-center justify-between w-full pointer-events-auto">
                <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(buildEventUrl(current))}
                    className="flex-1 sm:flex-none h-10 sm:h-12 flex items-center justify-center rounded-sm bg-white px-5 sm:px-8 hover:bg-primary hover:text-white transition-all active:scale-95 group/btn cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black group-hover/btn:text-white ">
                      Get Tickets <Ticket size={13} className="group-hover/btn:rotate-12 transition-transform" />
                    </span>
                  </button>
                  <button
                    onClick={() => navigate(buildEventUrl(current))}
                    className="flex-1 sm:flex-none h-10 sm:h-12 flex items-center justify-center rounded-sm bg-black/40 backdrop-blur-md border border-white/20 px-5 sm:px-8 hover:bg-white transition-all active:scale-95 group/btn2 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover/btn2:text-black ">
                      Details <ArrowRight size={13} />
                    </span>
                  </button>
                </div>

                {spotlightEvents.length > 1 && (
                  <div className="hidden md:flex items-center gap-2">
                    <button onClick={handlePrev} aria-label="Previous event"
                      className="w-12 h-12 flex items-center justify-center rounded-sm border border-white/20 bg-black/40 text-white hover:bg-white hover:text-black transition-all active:scale-90 cursor-pointer">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNext} aria-label="Next event"
                      className="w-12 h-12 flex items-center justify-center rounded-sm border border-white/20 bg-black/40 text-white hover:bg-white hover:text-black transition-all active:scale-90 cursor-pointer">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SLIDE DOTS ───────────────────────────────────────────── */}
          {spotlightEvents.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
              {spotlightEvents.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "bg-primary w-8" : "bg-white/30 hover:bg-white/50 w-2"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* ── BOTTOM-RIGHT STAT STRIP ──────────────────────────────── */}
          <div className="absolute bottom-0 right-0 z-20 hidden lg:flex items-stretch pointer-events-none">
            <div className="bg-black/70 backdrop-blur-md border-t border-l border-white/10 px-5 py-2.5 text-center">
              <p className="text-white font-black text-base leading-none">{totalCount.toLocaleString()}+</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">Events</p>
            </div>
            <div className="bg-black/70 backdrop-blur-md border-t border-l border-white/10 px-5 py-2.5 text-center">
              <p className="text-white font-black text-base leading-none">{locationFlag} {locationLabel}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">Location</p>
            </div>
            <div className="bg-black/70 backdrop-blur-md border-t border-l border-white/10 px-5 py-2.5 text-center">
              <p className="text-white font-black text-base leading-none">{index + 1} / {spotlightEvents.length}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">Spotlight</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
