import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Ticket,
  MapPin,
  Info,
  Calendar,
  Sparkles,
  Star,
  TrendingUp,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import StatusBadge from "@/components/shared/StatusBadge";
import serviceTypes from "@/data/serviceTypes";

const Hero = ({ city }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch and process events from serviceTypes data
  useEffect(() => {
    const fetchEvents = () => {
      setLoading(true);

      const allEvents = [];

      // Extract all events from the serviceTypes structure
      serviceTypes.forEach((serviceType) => {
        serviceType.categories.forEach((category) => {
          category.subcategories.forEach((subcategory) => {
            if (subcategory.events && Array.isArray(subcategory.events)) {
              subcategory.events.forEach((event) => {
                // Add category and service type info to each event
                allEvents.push({
                  ...event,
                  id: event.id || `${subcategory.id}-event-${Math.random()}`,
                  serviceTypeId: serviceType.id,
                  serviceTypeName: serviceType.name,
                  serviceTypeIcon: serviceType.icon,
                  serviceTypeColor: serviceType.color,
                  categoryId: category.id,
                  categoryName: category.name,
                  subcategoryId: subcategory.id,
                  subcategoryName: subcategory.name,
                  itemType: "event", // Add item type for routing
                  // Ensure consistent structure
                  media: {
                    banner:
                      event.image ||
                      event.media?.banner ||
                      `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`,
                    ...event.media,
                  },
                  location: {
                    venue: event.venue || "TBD",
                    city: city || event.location?.city || "Major City",
                    address:
                      event.address ||
                      event.location?.address ||
                      "Location TBD",
                    ...event.location,
                  },
                  schedule: {
                    formattedDate: event.date
                      ? new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : event.schedule?.formattedDate || "Date TBA",
                    date: event.date,
                    time: event.time,
                    ...event.schedule,
                  },
                  ticketing: {
                    status: event.isSoldOut
                      ? "SOLD_OUT"
                      : event.remainingTickets < 50
                        ? "LOW"
                        : event.ticketing?.status || "AVAILABLE",
                    price: event.price || event.ticketing?.price,
                    currency: event.currency || "USD",
                    ...event.ticketing,
                  },
                });
              });
            }

            // Also check for routes if they exist (for travel/adventure)
            if (subcategory.routes && Array.isArray(subcategory.routes)) {
              subcategory.routes.forEach((route) => {
                allEvents.push({
                  ...route,
                  id: route.id || `${subcategory.id}-route-${Math.random()}`,
                  title: route.name,
                  itemType: "route", // Add item type for routing
                  serviceTypeId: serviceType.id,
                  serviceTypeName: serviceType.name,
                  serviceTypeIcon: serviceType.icon,
                  categoryId: category.id,
                  categoryName: category.name,
                  subcategoryId: subcategory.id,
                  subcategoryName: subcategory.name,
                  media: {
                    banner:
                      route.image ||
                      `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`,
                  },
                  location: {
                    venue: route.startPoint || "Trailhead",
                    city: city || "Adventure Location",
                  },
                  schedule: {
                    formattedDate: route.duration || "Flexible Schedule",
                  },
                  ticketing: {
                    status: "AVAILABLE",
                    price: route.price || "Contact for pricing",
                  },
                  difficulty: route.difficulty,
                  distance: route.distance,
                  elevation: route.elevation,
                });
              });
            }
          });
        });
      });

      // Filter events by city if city prop is provided
      const filteredByCity =
        city && city !== "All" && city !== "all"
          ? allEvents.filter(
              (event) =>
                event.location?.city
                  ?.toLowerCase()
                  .includes(city.toLowerCase()) ||
                event.location?.address
                  ?.toLowerCase()
                  .includes(city.toLowerCase()) ||
                event.venue?.toLowerCase().includes(city.toLowerCase()),
            )
          : allEvents;

      // Prioritize featured, trending, and hot events
      const prioritizedEvents = filteredByCity.sort((a, b) => {
        const getPriority = (event) => {
          if (event.isHot) return 4;
          if (event.isTrending) return 3;
          if (event.featured) return 2;
          if (event.rating > 4.5) return 1;
          return 0;
        };
        return getPriority(b) - getPriority(a);
      });

      setEvents(prioritizedEvents);
      setLoading(false);
    };

    fetchEvents();
  }, [city]);

  // Expanded spotlight categories for hero section to include more event types
  const spotlightCategories = useMemo(
    () => [
      "concerts",
      "music",
      "festivals",
      "sports",
      "theater",
      "comedy",
      "expos",
      "conferences",
      "tourism",
      "adventure",
      "food festivals",
      "wine tasting",
      "cultural",
      "live events",
      "entertainment",
      "nightlife",
      "performing arts",
      "rock",
      "jazz",
      "classical",
      "pop",
      "electronic",
      "hip hop",
      "country",
      "blues",
      "reggae",
      "latin",
      "world music",
      "musicals",
      "plays",
      "opera",
      "ballet",
      "dance",
      "circus",
      "stand-up",
      "improv",
      "film",
      "cinema",
      "movie",
      "documentary",
      "nfl",
      "nba",
      "mlb",
      "nhl",
      "football",
      "basketball",
      "baseball",
      "hockey",
      "tennis",
      "golf",
      "boxing",
      "ufc",
      "mma",
      "wrestling",
      "hiking",
      "camping",
      "safari",
      "wildlife",
      "beach",
      "island",
      "luxury",
      "cruise",
      "yacht",
      "wellness",
      "spa",
      "yoga",
      "meditation",
      "cooking",
      "wine",
      "beer",
      "food",
      "dining",
      "networking",
      "business",
      "tech",
      "technology",
      "coding",
      "hackathon",
      "startup",
      "fashion",
      "beauty",
      "family",
      "kids",
      "children",
      "education",
      "learning",
      "workshop",
      "seminar",
      "training",
      "charity",
      "fundraiser",
      "volunteer",
      "community",
      "holiday",
      "celebration",
      "new year",
      "christmas",
      "halloween",
      "thanksgiving",
      "independence day",
      "pride",
      "cultural festival",
      "art exhibition",
      "gallery",
      "photography",
      "craft",
      "maker",
      "design",
      "architecture",
      "science",
      "space",
      "astronomy",
      "nature",
      "environment",
      "sustainability",
      "automotive",
      "car show",
      "boat show",
      "air show",
      "aviation",
      "maritime",
      "gaming",
      "esports",
      "video games",
      "comic con",
      "anime",
      "retro",
      "vintage",
      "antique",
      "collectible",
      "toy",
      "comic",
      "book",
      "literature",
      "poetry",
      "writing",
      "storytelling",
    ],
    [],
  );

  const filteredBanners = useMemo(() => {
    return events
      .filter((event) => {
        // Filter out sold out or completed events
        if (event.ticketing?.status === "COMPLETED" || event.isSoldOut)
          return false;

        // Check if event matches spotlight categories
        const eventName = event.title?.toLowerCase() || "";
        const categoryName = event.categoryName?.toLowerCase() || "";
        const subcategoryName = event.subcategoryName?.toLowerCase() || "";
        const serviceTypeName = event.serviceTypeName?.toLowerCase() || "";
        const tags = event.tags?.map((t) => t.toLowerCase()) || [];

        return spotlightCategories.some(
          (cat) =>
            eventName.includes(cat) ||
            categoryName.includes(cat) ||
            subcategoryName.includes(cat) ||
            serviceTypeName.includes(cat) ||
            tags.some((tag) => tag.includes(cat)),
        );
      })
      .slice(0, 15); // INCREASED FROM 6 TO 15 - SHOW MORE SPOTLIGHT EVENTS
  }, [events, spotlightCategories]);

  useEffect(() => {
    setIndex(0);
  }, [filteredBanners.length, city]);

  const handleNext = useCallback(() => {
    if (filteredBanners.length <= 1) return;
    setIndex((prev) => (prev + 1) % filteredBanners.length);
  }, [filteredBanners.length]);

  const handlePrev = useCallback(() => {
    if (filteredBanners.length <= 1) return;
    setIndex(
      (prev) => (prev - 1 + filteredBanners.length) % filteredBanners.length,
    );
  }, [filteredBanners.length]);

  useEffect(() => {
    if (filteredBanners.length <= 1) return;
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [filteredBanners.length, handleNext]);

  const onDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 50;
    if (Math.abs(offset.x) > swipeThreshold && Math.abs(velocity.x) > 500) {
      offset.x > 0 ? handlePrev() : handleNext();
    }
  };

  // Navigation handler - UPDATED for new browse routing structure
  const handleEventNavigation = (event) => {
    if (event.itemType === "route") {
      // Route path: /browse/:serviceTypeId/c/:categoryId/s/:subcategoryId/route/:itemId
      navigate(
        `/browse/${event.serviceTypeId}/c/${event.categoryId}/s/${event.subcategoryId}/route/${event.id}`,
      );
    } else {
      // Event path: /browse/:serviceTypeId/c/:categoryId/s/:subcategoryId/event/:itemId
      navigate(
        `/browse/${event.serviceTypeId}/c/${event.categoryId}/s/${event.subcategoryId}/event/${event.id}`,
      );
    }
  };

  // Alternative simplified navigation for "View All" button
  const handleViewAll = () => {
    navigate("/browse");
  };

  // Get event category display name
  const getEventCategory = (event) => {
    if (event.categoryName) return event.categoryName;
    if (event.serviceTypeName) return event.serviceTypeName;
    if (event.subcategoryName) return event.subcategoryName;
    return "Featured Event";
  };

  // Get event status
  const getEventStatus = (event) => {
    if (event.isSoldOut) return "SOLD OUT";
    if (event.isHot) return "HOT";
    if (event.isTrending) return "TRENDING";
    if (event.remainingTickets < 50) return "LIMITED";
    if (event.ticketing?.status) return event.ticketing.status;
    return "AVAILABLE";
  };

  // Format price
  const formatPrice = (event) => {
    if (event.price) {
      if (typeof event.price === "number") {
        return `$${event.price}`;
      }
      return event.price;
    }
    if (event.ticketing?.price) {
      if (typeof event.ticketing.price === "number") {
        return `$${event.ticketing.price}`;
      }
      return event.ticketing.price;
    }
    return "Price TBD";
  };

  if (!filteredBanners.length) {
    return (
      <section className="w-full">
        <Container>
          <div className=" h-[350px] md:h-[500px]  flex flex-col items-center justify-center rounded-sm">
            <MapPin size={48} className="text-brand-primary opacity-30 mb-4" />
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase text-center px-4">
              No Spotlight Events in {city || "this location"}
            </p>
            <p className="text-muted-foreground/50 text-xs mt-3 max-w-md text-center px-4">
              Check back soon for exciting concerts, festivals, and events!
            </p>
            <button
              onClick={handleViewAll}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-medium uppercase tracking-wider transition-all"
            >
              Browse All Events
            </button>
          </div>
        </Container>
      </section>
    );
  }

  const current = filteredBanners[index];
  const formattedDate =
    current.schedule?.formattedDate ||
    (current.date
      ? new Date(current.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : current.duration || "Date TBA");

  const eventCategory = getEventCategory(current);
  const eventStatus = getEventStatus(current);
  const eventPrice = formatPrice(current);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${current.title} ${current.location?.venue || current.venue} ${current.location?.city || city}`,
  )}`;

  // Animation variants
  const cinematicVariants = {
    initial: { opacity: 0, scale: 1.1 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.8 } },
  };

  const contentVariants = {
    initial: { opacity: 0, x: -30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 100, delay: 0.2 },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  const badgeVariants = {
    initial: { opacity: 0, y: -20, scale: 0.8 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 200, delay: 0.5 },
    },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <section className="bg-background pt-4">
      <Container>
        <div className="relative h-[350px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-sm group/banner">
          {/* SERVICE TYPE ICON & CATEGORY BADGES */}
          <div className="absolute top-4 left-4 z-30 flex gap-2 pointer-events-auto">
            {current.serviceTypeIcon && (
              <span className="px-3 py-1 text-sm bg-black/60 backdrop-blur-md text-white border border-white/20 rounded-sm flex items-center gap-1">
                <span>{current.serviceTypeIcon}</span>
                <span className="text-[10px] font-medium">
                  {current.serviceTypeName}
                </span>
              </span>
            )}
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/20 rounded-sm">
              {eventCategory}
            </span>
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-brand-primary/90 backdrop-blur-md text-white rounded-sm">
              {eventPrice}
            </span>
          </div>

          {/* STATUS BADGE */}
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current.id}-${index}`}
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <StatusBadge status={eventStatus} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* IMAGE CAROUSEL */}
          <div className="absolute inset-0 z-0 touch-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current.id}-${index}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                variants={cinematicVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
              >
                <img
                  src={current.media?.banner}
                  alt={current.title}
                  className="w-full h-full object-cover opacity-60 pointer-events-none"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* MOBILE ARROWS */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20 md:hidden pointer-events-none">
            <button
              onClick={handlePrev}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-white/20 bg-black/40 text-white backdrop-blur-md pointer-events-auto active:scale-90 transition-all"
              aria-label="Previous event"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-white/20 bg-black/40 text-white backdrop-blur-md pointer-events-auto active:scale-90 transition-all"
              aria-label="Next event"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* CONTENT OVERLAY */}
          <div className="relative z-10 h-full flex flex-col p-6 sm:p-10 md:p-12 pointer-events-none">
            <div className="flex-1 flex">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${current.id}-${index}`}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="max-w-4xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-[2px] w-8 bg-brand-primary" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/90 flex items-center gap-1">
                      {current.isHot ? (
                        <>
                          <Sparkles size={12} className="text-orange-400" />
                          HOT PICK
                        </>
                      ) : current.isTrending ? (
                        <>
                          <TrendingUp size={12} className="text-green-400" />
                          TRENDING
                        </>
                      ) : (
                        `FEATURED IN ${(city || current.location?.city || "YOUR AREA").toUpperCase()}`
                      )}
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white leading-[0.9] transition-colors group-hover/banner:text-brand-primary line-clamp-3">
                    {current.title}
                  </h1>
                  {current.description && (
                    <p className="mt-4 text-white/70 text-sm md:text-base max-w-2xl line-clamp-2 hidden sm:block">
                      {current.description}
                    </p>
                  )}
                  {current.difficulty && (
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-sm ${
                          current.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-400"
                            : current.difficulty === "Moderate"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : current.difficulty === "Challenging"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {current.difficulty} • {current.distance} •{" "}
                        {current.elevation}
                      </span>
                    </div>
                  )}
                  {current.rating && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Math.floor(current.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-400"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-white/80 text-xs">
                        {current.rating} (
                        {current.attendees?.toLocaleString() ||
                          current.reviews ||
                          0}
                        + reviews)
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* INFO ZONE */}
            <div className="mt-auto space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${current.id}-${index}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.3, duration: 0.5 },
                  }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-2 md:gap-3 border-l-2 border-brand-primary pl-4 md:pl-6 pointer-events-auto"
                >
                  <div className="flex items-center gap-3 text-white/70">
                    <Calendar
                      size={16}
                      className="text-brand-primary shrink-0"
                    />
                    <p className="text-xs sm:text-base font-medium tracking-wide">
                      {formattedDate}
                      {current.time && ` • ${current.time}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-brand-primary shrink-0" />
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative text-xs sm:text-base md:text-lg font-medium tracking-wide text-white/90 hover:text-brand-primary transition-colors group/loc"
                    >
                      {current.location?.venue ||
                        current.venue ||
                        current.startPoint ||
                        "Venue TBA"}
                      <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-brand-primary transition-all duration-300 group-hover/loc:w-full" />
                    </a>
                  </div>
                  {current.remainingTickets > 0 &&
                    current.remainingTickets < 200 && (
                      <p className="text-xs text-orange-400 font-medium">
                        Only {current.remainingTickets} tickets left!
                      </p>
                    )}
                </motion.div>
              </AnimatePresence>

              {/* ACTION BAR */}
              <div className="flex flex-row items-center justify-between w-full pointer-events-auto">
                <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleEventNavigation(current)}
                    className="flex-1 sm:flex-none h-10 sm:h-12 flex items-center justify-center rounded-sm bg-white px-5 sm:px-8 hover:bg-brand-primary transition-all active:scale-95 group/btn cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black">
                      {current.isSoldOut
                        ? "SOLD OUT"
                        : current.itemType === "route"
                          ? "VIEW ROUTE"
                          : "GET TICKETS"}{" "}
                      <Ticket
                        size={14}
                        className="group-hover/btn:rotate-12 transition-transform"
                      />
                    </span>
                  </button>
                  <button
                    onClick={() => handleEventNavigation(current)}
                    className="flex-1 sm:flex-none h-10 sm:h-12 flex items-center justify-center rounded-sm bg-black/40 backdrop-blur-md border border-white/20 px-5 sm:px-8 hover:bg-white transition-all active:scale-95 group/btn2 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover/btn2:text-black">
                      DETAILS <Info size={14} />
                    </span>
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="w-12 h-12 flex items-center justify-center rounded-sm border border-white/20 bg-black/40 text-white hover:bg-white hover:text-black transition-all active:scale-90 cursor-pointer"
                    aria-label="Previous event"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-12 h-12 flex items-center justify-center rounded-sm border border-white/20 bg-black/40 text-white hover:bg-white hover:text-black transition-all active:scale-90 cursor-pointer"
                    aria-label="Next event"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE INDICATORS */}
          {filteredBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {filteredBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "bg-brand-primary w-8"
                      : "bg-white/30 hover:bg-white/50 w-2"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Hero;