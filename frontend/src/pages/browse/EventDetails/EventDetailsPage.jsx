// frontend/src/pages/event/EventDetailsPage.jsx
//
// Route: /browse/:eventSlug
// Displays full details for a single event.
//
// Sections (top → bottom):
//   1. Breadcrumb
//   2. Hero (image + key info)
//   3. Sticky Booking Bar
//   4. About / Description
//   5. Lineup / Performers
//   6. Schedule / Agenda
//   7. Venue & Map
//   8. Organiser
//   9. Reviews
//  10. Related Events
//  11. Newsletter CTA
//
// In production: GET /api/events/:slug → full event object
//
import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Calendar, Clock, Star, BadgeCheck,
  Ticket, Bookmark, BookmarkCheck, Share2,
  ChevronRight, ChevronLeft, ChevronDown,
  Users, Globe, Phone, Mail, Instagram,
  Facebook, Twitter, Youtube,
  Music, Mic, Drum, Guitar,
  Check, X, AlertCircle, ArrowRight,
  Heart, Flag, ZoomIn,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useLocation } from "@/context/LocationContext";

/* ═══════════════════════════════════════════════════════════════
   MOCK EVENT DATA
   In production: const event = await fetch(`/api/events/${slug}`)
═══════════════════════════════════════════════════════════════ */
const MOCK_EVENT = {
  id: 3,
  slug: "rock-arena-2025",
  title: "Rock Arena Bangladesh 2025",
  tagline: "The biggest rock experience Bangladesh has ever seen.",
  category: "Music",
  subCategory: "Concerts",
  eventType: "Live Bands",
  categorySlug: "music",
  subCategorySlug: "concerts",
  eventTypeSlug: "live-bands",
  organizer: {
    id: 1,
    name: "Arena Live",
    slug: "arena-live",
    verified: true,
    avatar: "A",
    bio: "Arena Live is Bangladesh's premier live event production company, bringing world-class concerts and experiences to audiences across the country since 2015.",
    totalEvents: 48,
    totalAttendees: 120000,
    rating: 4.9,
    reviewCount: 842,
    website: "https://arenalive.bd",
    phone: "+880 1700 000000",
    email: "hello@arenalive.bd",
    socials: {
      instagram: "arenalive_bd",
      facebook:  "arenalivebd",
      twitter:   "arenalive_bd",
      youtube:   "AreneLiveBD",
    },
  },
  date: "Saturday, March 29, 2025",
  dateShort: "Sat, Mar 29",
  time: "5:00 PM",
  endTime: "11:00 PM",
  dateISO: "2025-03-29T17:00:00",
  city: "Dhaka",
  venue: {
    name: "Bangabandhu National Stadium",
    address: "Motijheel, Dhaka 1000, Bangladesh",
    lat: 23.7379,
    lng: 90.3964,
    capacity: 20000,
    mapEmbed: "https://maps.google.com/maps?q=Bangabandhu+National+Stadium+Dhaka&output=embed",
  },
  images: [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80",
  ],
  rating: 4.9,
  reviewCount: 312,
  attendees: 14500,
  capacity: 20000,
  spotsLeft: 5500,
  verified: true,
  tags: ["Rock", "Live Music", "Stadium", "Bangladesh", "Concert"],
  description: `Rock Arena Bangladesh 2025 is the country's most anticipated rock concert, bringing together the finest rock bands from across Bangladesh and the region for one unforgettable night at the Bangabandhu National Stadium.

From the raw energy of heavy metal to the melodic storytelling of indie rock, this event is a celebration of everything that makes rock music timeless. With a state-of-the-art stage, world-class sound and lighting, and a passionate crowd of over 20,000 fans, this is more than a concert — it's a movement.

Whether you've been following Bangladesh's rock scene for decades or you're discovering it for the first time, Rock Arena 2025 promises a night you will never forget.`,
  highlights: [
    "5 headline bands performing back to back",
    "State-of-the-art light and sound production",
    "Bangladesh's largest rock audience in a single venue",
    "Live streaming for remote audiences",
    "Exclusive merchandise available on site",
  ],
  lineup: [
    { id: 1, name: "Arbovirus",     role: "Headliner",  genre: "Rock / Alternative", time: "9:30 PM", avatar: "AR", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80" },
    { id: 2, name: "Cryptic Fate",  role: "Co-Headliner", genre: "Heavy Metal",      time: "8:00 PM", avatar: "CF", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&q=80" },
    { id: 3, name: "Shironamhin",   role: "Special Guest",genre: "Alternative Rock",  time: "6:45 PM", avatar: "SH", image: "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=200&q=80" },
    { id: 4, name: "Nemesis",       role: "Supporting",  genre: "Post Grunge",       time: "5:45 PM", avatar: "NE", image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=200&q=80" },
    { id: 5, name: "Warfaze",       role: "Opening Act", genre: "Hard Rock",         time: "5:00 PM", avatar: "WF", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80" },
  ],
  schedule: [
    { time: "4:00 PM", title: "Gates Open",          description: "Entry begins, merchandise stalls open." },
    { time: "5:00 PM", title: "Warfaze",              description: "Opening performance. Hard rock classics." },
    { time: "5:45 PM", title: "Nemesis",              description: "Post grunge set. Fan favourites." },
    { time: "6:45 PM", title: "Shironamhin",          description: "Special guest performance." },
    { time: "7:30 PM", title: "Intermission",         description: "30 min break. Food & beverage stalls." },
    { time: "8:00 PM", title: "Cryptic Fate",         description: "Co-headliner heavy metal set." },
    { time: "9:30 PM", title: "Arbovirus",            description: "Headline performance. Full production show." },
    { time: "11:00 PM", title: "Event Ends",          description: "Encore & crowd farewell." },
  ],
  tickets: [
    { id: "general",   label: "General",    price: 1500, priceLabel: "৳1,500", available: true,  perks: ["Standing area", "Basic entry", "Merchandise access"] },
    { id: "silver",    label: "Silver",     price: 2500, priceLabel: "৳2,500", available: true,  perks: ["Reserved seating", "Priority entry", "Merchandise access", "Complimentary water"] },
    { id: "gold",      label: "Gold",       price: 5000, priceLabel: "৳5,000", available: true,  perks: ["Premium seating", "Backstage pass", "Artist meet & greet", "Exclusive merchandise", "Complimentary F&B"] },
    { id: "vip",       label: "VIP",        price: 10000, priceLabel: "৳10,000", available: false, perks: ["Front-row experience", "Full backstage access", "Private lounge", "Signed merchandise", "All inclusive F&B"] },
  ],
  faqs: [
    { q: "What is the age restriction?", a: "This is an all-ages event. Children under 5 enter free with a paying adult." },
    { q: "Can I bring my own food?", a: "Outside food and beverages are not permitted. Multiple F&B stalls will be available on site." },
    { q: "Is re-entry allowed?", a: "Re-entry is not permitted once you exit the venue. Please plan accordingly." },
    { q: "Are tickets refundable?", a: "All ticket sales are final. However, tickets may be transferred to another person via the app." },
    { q: "What should I bring?", a: "Please bring your ticket (digital or printed), a valid photo ID, and arrive early to avoid queues." },
  ],
  reviews: [
    { id: 1, author: "Rafiq A.", initial: "R", rating: 5, title: "Best concert I've attended!", body: "Absolutely electric atmosphere. Arbovirus were phenomenal as always and the production quality was insane.", helpful: 47, verified: true,  createdAt: "2025-03-01T10:00:00Z" },
    { id: 2, author: "Nadia K.", initial: "N", rating: 5, title: "Unforgettable night",          body: "The sound system was world class. Every band delivered. I cried during Shironamhin's set.",           helpful: 34, verified: true,  createdAt: "2025-02-28T14:30:00Z" },
    { id: 3, author: "Imran H.", initial: "I", rating: 4, title: "Great event, minor issues",    body: "Amazing performances all around. Entry queues were a bit slow but once inside it was perfect.",        helpful: 21, verified: false, createdAt: "2025-02-26T19:00:00Z" },
  ],
  relatedEvents: [
    { id: 6,  slug: "live-bands-showdown",  title: "Live Bands Showdown 2025", date: "Sat, Apr 5",  time: "6:00 PM", venue: "Bashundhara City Arena", priceLabel: "৳1,500", rating: 4.8, image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80" },
    { id: 7,  slug: "live-bands-battle",    title: "Live Bands Battle Night",  date: "Sat, Apr 12", time: "6:00 PM", venue: "Osmani Memorial Hall",   priceLabel: "৳600",   rating: 4.8, image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80" },
    { id: 8,  slug: "dhaka-music-weekend",  title: "Dhaka Music Weekend",      date: "Sat, Mar 22", time: "4:00 PM", venue: "Hatirjheel",             priceLabel: "৳900",   rating: 4.7, image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80" },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const spotsPercent = (a, c) => Math.min(100, Math.round((a / c) * 100));
const timeAgo = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
};

const StarRow = ({ rating, size = 12 }) => (
  <span className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((i) => (
      <Star key={i} size={size} className={rating >= i ? "text-foreground fill-foreground" : "text-border"} />
    ))}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   1. BREADCRUMB
═══════════════════════════════════════════════════════════════ */
const Breadcrumb = ({ event }) => (
  <div className="w-full bg-background">
    <Container>
      <div className="flex items-center gap-1.5 py-4 flex-wrap">
        {[
          { label: "Home",                 to: "/" },
          { label: "Browse",               to: "/browse" },
          { label: event.category,         to: `/browse/${event.categorySlug}` },
          { label: event.subCategory,      to: `/browse/${event.categorySlug}/${event.subCategorySlug}` },
          { label: event.eventType,        to: `/browse/${event.categorySlug}/${event.subCategorySlug}/${event.eventTypeSlug}` },
          { label: event.title,            to: null },
        ].map((crumb, i, arr) => (
          <React.Fragment key={i}>
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-xs font-medium text-foreground truncate max-w-[200px]" style={{ fontFamily: "var(--font-sans)" }}>
                {crumb.label}
              </span>
            )}
            {i < arr.length - 1 && <ChevronRight size={11} className="text-muted-foreground shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </Container>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   2. HERO — Image gallery + key info
═══════════════════════════════════════════════════════════════ */
const Hero = ({ event, saved, onSave, onShare }) => {
  const [activeImg, setActiveImg] = useState(0);
  const pct = spotsPercent(event.attendees, event.capacity);

  return (
    <div className="w-full bg-background border-b border-border">
      <Container>
        <div className="py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Image gallery */}
          <div className="flex flex-col gap-2">
            {/* Main image */}
            <div className="relative rounded-xl overflow-hidden bg-muted" style={{ aspectRatio: "16/9" }}>
              <img
                src={event.images[activeImg]} alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {/* Nav arrows */}
              {event.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((p) => (p - 1 + event.images.length) % event.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft size={16} className="text-white" />
                  </button>
                  <button
                    onClick={() => setActiveImg((p) => (p + 1) % event.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight size={16} className="text-white" />
                  </button>
                </>
              )}
              {/* Image count */}
              <span
                className="absolute bottom-3 right-3 text-[10px] font-medium px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {activeImg + 1} / {event.images.length}
              </span>
            </div>
            {/* Thumbnails */}
            {event.images.length > 1 && (
              <div className="flex gap-2">
                {event.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="relative rounded-md overflow-hidden shrink-0 transition-all"
                    style={{
                      width: 64, height: 44,
                      outline: i === activeImg ? "2px solid var(--foreground)" : "2px solid transparent",
                      outlineOffset: 2,
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Event info */}
          <div className="flex flex-col gap-4">

            {/* Tags + actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {event.tags.slice(0, 3).map((tag) => (
                  <span key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--secondary)", fontFamily: "var(--font-sans)" }}
                  >{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={onSave} className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors" aria-label="Save">
                  {saved ? <BookmarkCheck size={15} className="text-foreground" /> : <Bookmark size={15} className="text-muted-foreground" />}
                </button>
                <button onClick={onShare} className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors" aria-label="Share">
                  <Share2 size={15} className="text-muted-foreground" />
                </button>
                <button className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors" aria-label="Report">
                  <Flag size={15} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {event.title}
                {event.verified && <BadgeCheck size={20} className="inline ml-2 text-foreground" />}
              </h1>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.tagline}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRow rating={event.rating} size={14} />
              <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>({event.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Key details */}
            <div className="flex flex-col gap-2.5 p-4 rounded-lg border border-border" style={{ background: "var(--secondary)" }}>
              <div className="flex items-center gap-2.5 text-sm text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                <Calendar size={15} className="text-muted-foreground shrink-0" />
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                <Clock size={15} className="text-muted-foreground shrink-0" />
                <span>{event.time} — {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                <MapPin size={15} className="text-muted-foreground shrink-0" />
                <span>{event.venue.name}, {event.city}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                <Users size={15} className="text-muted-foreground shrink-0" />
                <span>{event.attendees.toLocaleString()} attending · {event.spotsLeft.toLocaleString()} spots left</span>
              </div>
              {/* Capacity bar */}
              <div className="h-1.5 rounded-full bg-background overflow-hidden mt-1">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }} />
              </div>
            </div>

            {/* Organiser preview */}
            <Link to={`/organiser/${event.organizer.slug}`} className="flex items-center gap-3 group">
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-heading)" }}
              >
                {event.organizer.avatar}
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-foreground group-hover:underline" style={{ fontFamily: "var(--font-sans)" }}>
                    {event.organizer.name}
                  </p>
                  {event.organizer.verified && <BadgeCheck size={13} className="text-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                  {event.organizer.totalEvents} events · {event.organizer.totalAttendees.toLocaleString()} total attendees
                </p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground ml-auto" />
            </Link>

          </div>
        </div>
      </Container>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   3. STICKY BOOKING BAR
═══════════════════════════════════════════════════════════════ */
const BookingBar = ({ event, onBook }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const minPrice = Math.min(...event.tickets.filter((t) => t.available).map((t) => t.price));

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border shadow-lg"
      style={{ background: "var(--background)" }}
    >
      <Container>
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate" style={{ fontFamily: "var(--font-heading)" }}>
              {event.title}
            </p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              {event.dateShort} · {event.time} · {event.venue.name}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>From</p>
              <p className="text-lg font-extrabold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                ৳{minPrice.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onBook}
              className="flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-sans)" }}
            >
              <Ticket size={14} /> Get Tickets
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   4. ABOUT
═══════════════════════════════════════════════════════════════ */
const About = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = event.description.length > 400;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>About this event</h2>
      <div>
        <p
          className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isLong && !expanded ? `${event.description.slice(0, 400)}…` : event.description}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-xs font-semibold text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity mt-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Highlights */}
      <div className="flex flex-col gap-2">
        {event.highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--foreground)" }}
            >
              <Check size={11} className="text-background" />
            </span>
            <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{h}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   5. LINEUP
═══════════════════════════════════════════════════════════════ */
const Lineup = ({ lineup }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Lineup</h2>
    <div className="flex flex-col gap-3">
      {lineup.map((artist) => (
        <div
          key={artist.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border"
          style={{ background: "var(--card)" }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{artist.name}</p>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-brand)" }}
              >
                {artist.role}
              </span>
            </div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{artist.genre}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              <Clock size={11} />{artist.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   6. SCHEDULE
═══════════════════════════════════════════════════════════════ */
const Schedule = ({ schedule }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Schedule</h2>
    <div className="flex flex-col">
      {schedule.map((item, i) => (
        <div key={i} className="flex gap-4 group">
          {/* Time + line */}
          <div className="flex flex-col items-center shrink-0" style={{ width: 64 }}>
            <p className="text-xs font-semibold text-foreground text-right w-full" style={{ fontFamily: "var(--font-sans)" }}>
              {item.time}
            </p>
            {i < schedule.length - 1 && (
              <div className="w-px flex-1 mt-1" style={{ background: "var(--border)", minHeight: 24 }} />
            )}
          </div>
          {/* Dot */}
          <div className="flex flex-col items-center shrink-0 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 shrink-0"
              style={{ borderColor: "var(--foreground)", background: i === 0 ? "var(--foreground)" : "var(--background)" }} />
            {i < schedule.length - 1 && (
              <div className="w-px flex-1 mt-1" style={{ background: "var(--border)", minHeight: 24 }} />
            )}
          </div>
          {/* Content */}
          <div className="pb-4 flex-1">
            <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   7. TICKETS
═══════════════════════════════════════════════════════════════ */
const Tickets = ({ tickets }) => {
  const [selected, setSelected] = useState("silver");
  const [qty, setQty]           = useState(1);

  const ticket = tickets.find((t) => t.id === selected);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Get Tickets</h2>

      {/* Ticket tiers */}
      <div className="flex flex-col gap-2">
        {tickets.map((t) => (
          <button
            key={t.id}
            onClick={() => t.available && setSelected(t.id)}
            disabled={!t.available}
            className="flex items-start gap-3 p-3 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: selected === t.id ? "var(--foreground)" : "var(--border)",
              background:  selected === t.id ? "var(--secondary)"  : "var(--card)",
            }}
          >
            {/* Radio dot */}
            <span
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
              style={{ borderColor: selected === t.id ? "var(--foreground)" : "var(--border)" }}
            >
              {selected === t.id && (
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--foreground)" }} />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {t.label}
                  {!t.available && <span className="ml-2 text-[10px] font-normal text-muted-foreground">(Sold out)</span>}
                </p>
                <p className="text-sm font-bold text-foreground shrink-0" style={{ fontFamily: "var(--font-heading)" }}>{t.priceLabel}</p>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                {t.perks.map((perk) => (
                  <span key={perk} className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                    <Check size={9} className="text-foreground" />{perk}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quantity selector + total */}
      {ticket && (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border" style={{ background: "var(--card)" }}>
          <div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>Quantity</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
              >
                −
              </button>
              <span className="text-sm font-bold text-foreground w-4 text-center" style={{ fontFamily: "var(--font-heading)" }}>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="w-7 h-7 rounded border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>Total</p>
            <p className="text-xl font-extrabold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              ৳{(ticket.price * qty).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        className="flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-bold transition-colors"
        style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-sans)" }}
      >
        <Ticket size={15} /> Book Now · ৳{ticket ? (ticket.price * qty).toLocaleString() : "–"}
      </button>

      <p className="text-[11px] text-center text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
        Secure checkout · Instant confirmation · Tickets sent to your email
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   8. VENUE MAP
═══════════════════════════════════════════════════════════════ */
const VenueMap = ({ venue }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Venue</h2>
    <div className="rounded-xl overflow-hidden border border-border bg-muted" style={{ height: 220 }}>
      <iframe
        title="Venue map"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.name + " " + venue.address)}&output=embed`}
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{venue.name}</p>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
        <MapPin size={13} className="shrink-0" />{venue.address}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
        <Users size={13} className="shrink-0" />Capacity: {venue.capacity.toLocaleString()}
      </div>
      <a
        href={`https://maps.google.com/?q=${encodeURIComponent(venue.name)}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline mt-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Open in Google Maps <ArrowRight size={12} />
      </a>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   9. ORGANISER
═══════════════════════════════════════════════════════════════ */
const Organiser = ({ org }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Organiser</h2>
    <div className="p-4 rounded-xl border border-border flex flex-col gap-4" style={{ background: "var(--card)" }}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
          style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-heading)" }}
        >{org.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{org.name}</p>
            {org.verified && <BadgeCheck size={14} className="text-foreground" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <span>{org.totalEvents} events</span>
            <span>·</span>
            <span>{org.totalAttendees.toLocaleString()} attendees</span>
            <span>·</span>
            <span className="flex items-center gap-0.5"><Star size={10} className="fill-foreground text-foreground" />{org.rating}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{org.bio}</p>

      {/* Contacts */}
      <div className="flex flex-wrap gap-3">
        {org.website && (
          <a href={org.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Globe size={12} />{org.website.replace("https://", "")}
          </a>
        )}
        {org.email && (
          <a href={`mailto:${org.email}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Mail size={12} />{org.email}
          </a>
        )}
        {org.phone && (
          <a href={`tel:${org.phone}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Phone size={12} />{org.phone}
          </a>
        )}
      </div>

      {/* Socials */}
      {org.socials && (
        <div className="flex items-center gap-3 pt-1 border-t border-border">
          {org.socials.instagram && (
            <a href={`https://instagram.com/${org.socials.instagram}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
              <Instagram size={15} />
            </a>
          )}
          {org.socials.facebook && (
            <a href={`https://facebook.com/${org.socials.facebook}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
              <Facebook size={15} />
            </a>
          )}
          {org.socials.twitter && (
            <a href={`https://twitter.com/${org.socials.twitter}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter size={15} />
            </a>
          )}
          {org.socials.youtube && (
            <a href={`https://youtube.com/${org.socials.youtube}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors" aria-label="YouTube">
              <Youtube size={15} />
            </a>
          )}
          <Link
            to={`/organiser/${org.slug}`}
            className="ml-auto text-xs font-semibold text-foreground hover:underline flex items-center gap-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            View all events <ChevronRight size={12} />
          </Link>
        </div>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   10. REVIEWS
═══════════════════════════════════════════════════════════════ */
const Reviews = ({ reviews, rating, reviewCount }) => {
  const [helpfulIds, setHelpfulIds] = useState(new Set());
  const toggleHelpful = (id) => setHelpfulIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Reviews <span className="text-muted-foreground font-normal text-base">({reviewCount.toLocaleString()})</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <StarRow rating={rating} size={13} />
          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{rating}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="p-3 rounded-lg border border-border" style={{ background: "var(--card)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-heading)" }}>
                  {r.initial}
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{r.author}</p>
                    {r.verified && <BadgeCheck size={11} className="text-foreground" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{timeAgo(r.createdAt)}</p>
                </div>
              </div>
              <StarRow rating={r.rating} size={11} />
            </div>
            <p className="text-xs font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>{r.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{r.body}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>Helpful?</span>
              <button onClick={() => toggleHelpful(r.id)}
                className="flex items-center gap-1 text-[11px] transition-colors"
                style={{ color: helpfulIds.has(r.id) ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}>
                <Heart size={11} className={helpfulIds.has(r.id) ? "fill-foreground" : ""} />
                {r.helpful + (helpfulIds.has(r.id) ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="text-xs font-semibold text-foreground hover:underline self-start" style={{ fontFamily: "var(--font-sans)" }}>
        View all {reviewCount} reviews →
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   11. FAQ
═══════════════════════════════════════════════════════════════ */
const FAQ = ({ faqs }) => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>FAQs</h2>
      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden" style={{ background: "var(--card)" }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex items-center justify-between w-full px-4 py-3 text-left gap-2"
            >
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{faq.q}</p>
              <ChevronDown
                size={14}
                className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`}
              />
            </button>
            {openIdx === i && (
              <div className="px-4 pb-3 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed pt-2" style={{ fontFamily: "var(--font-sans)" }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   12. RELATED EVENTS
═══════════════════════════════════════════════════════════════ */
const RelatedEvents = ({ events, categorySlug, subCategorySlug, eventTypeSlug }) => (
  <div className="w-full border-t border-border bg-background">
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>You Might Also Like</h2>
          <Link
            to={`/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`}
            className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            View all <ChevronRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {events.map((e) => (
            <Link key={e.id} to={`/events/${e.slug}`}
              className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all"
            >
              <div className="h-36 overflow-hidden bg-muted shrink-0">
                <img src={e.image} alt={e.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  onError={(ev) => { ev.target.style.display = "none"; }}
                />
              </div>
              <div className="p-3 flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:underline" style={{ fontFamily: "var(--font-heading)" }}>{e.title}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1" style={{ fontFamily: "var(--font-sans)" }}>
                  <Calendar size={10} />{e.date} · {e.time}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate" style={{ fontFamily: "var(--font-sans)" }}>
                  <MapPin size={10} />{e.venue}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-foreground fill-foreground" />
                    <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{e.rating}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{e.priceLabel}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   EVENT DETAILS PAGE
═══════════════════════════════════════════════════════════════ */
const EventDetailsPage = () => {
  const { eventSlug } = useParams();
  const [saved,  setSaved]  = useState(false);
  const [shared, setShared] = useState(false);
  const ticketsRef = useRef(null);

  // In production: fetch event by slug
  const event = MOCK_EVENT;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const scrollToTickets = () => {
    ticketsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!event) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>Event not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 80 }}>

      {/* Breadcrumb */}
      <Breadcrumb event={event} />

      {/* Hero */}
      <Hero
        event={event}
        saved={saved}
        onSave={() => setSaved((p) => !p)}
        onShare={handleShare}
      />

      {/* Sticky booking bar */}
      <BookingBar event={event} onBook={scrollToTickets} />

      {/* Main content */}
      <Container>
        <div className="py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* LEFT column — details */}
          <div className="flex flex-col gap-10">
            <About event={event} />
            <div className="border-t border-border" />
            <Lineup lineup={event.lineup} />
            <div className="border-t border-border" />
            <Schedule schedule={event.schedule} />
            <div className="border-t border-border" />
            <VenueMap venue={event.venue} />
            <div className="border-t border-border" />
            <Organiser org={event.organizer} />
            <div className="border-t border-border" />
            <Reviews reviews={event.reviews} rating={event.rating} reviewCount={event.reviewCount} />
            <div className="border-t border-border" />
            <FAQ faqs={event.faqs} />
          </div>

          {/* RIGHT column — sticky tickets */}
          <div className="hidden lg:block">
            <div ref={ticketsRef} className="sticky top-20">
              <div className="rounded-xl border border-border p-5" style={{ background: "var(--card)" }}>
                <Tickets tickets={event.tickets} />
              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* Mobile tickets — below main content */}
      <div className="lg:hidden border-t border-border bg-background" ref={ticketsRef}>
        <Container>
          <div className="py-6">
            <Tickets tickets={event.tickets} />
          </div>
        </Container>
      </div>

      {/* Related Events */}
      <RelatedEvents
        events={event.relatedEvents}
        categorySlug={event.categorySlug}
        subCategorySlug={event.subCategorySlug}
        eventTypeSlug={event.eventTypeSlug}
      />

    </div>
  );
};

export default EventDetailsPage;