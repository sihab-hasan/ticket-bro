// frontend/src/pages/browse/sections/MapSection.jsx
//
// Requires: npm install leaflet react-leaflet
// Add to index.html or main.jsx:
//   import 'leaflet/dist/leaflet.css'
//
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  ChevronRight,
  Star,
  BadgeCheck,
  Ticket,
  Calendar,
  Clock,
  ZoomIn,
  ZoomOut,
  Locate,
  SlidersHorizontal,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useLocation } from "@/context/LocationContext";

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

const getLevel = (categorySlug, subCategorySlug, eventTypeSlug) => {
  if (eventTypeSlug) return "eventType";
  if (subCategorySlug) return "subCategory";
  if (categorySlug) return "category";
  return "root";
};

/* ═══════════════════════════════════════════════════════════════
   CITY CENTER COORDS
═══════════════════════════════════════════════════════════════ */
const CITY_COORDS = {
  dhaka: { lat: 23.8103, lng: 90.4125, zoom: 12 },
  chittagong: { lat: 22.3569, lng: 91.7832, zoom: 12 },
  sylhet: { lat: 24.8949, lng: 91.8687, zoom: 13 },
  rajshahi: { lat: 24.3745, lng: 88.6042, zoom: 13 },
  khulna: { lat: 22.8456, lng: 89.5403, zoom: 13 },
  barisal: { lat: 22.701, lng: 90.3535, zoom: 13 },
  mymensingh: { lat: 24.7471, lng: 90.4203, zoom: 13 },
};

/* ═══════════════════════════════════════════════════════════════
   RADIUS OPTIONS
═══════════════════════════════════════════════════════════════ */
const RADIUS_OPTIONS = [2, 5, 10, 20, 50];

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL — events with lat/lng coordinates
   In production: GET /api/events/map?lat=23.81&lng=90.41&radius=10&category=music
═══════════════════════════════════════════════════════════════ */
const ALL_MAP_EVENTS = [
  {
    id: 1,
    slug: "synthwave-night-dhaka",
    title: "Synthwave Night",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    city: "dhaka",
    lat: 23.7946,
    lng: 90.4152,
    venue: "Club Noir, Gulshan",
    date: "Fri, Mar 21",
    time: "9:00 PM",
    price: 600,
    priceLabel: "৳600",
    rating: 4.6,
    reviewCount: 87,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=400&q=80",
  },
  {
    id: 2,
    slug: "beats-bass-dhaka",
    title: "Beats & Bass",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    city: "dhaka",
    lat: 23.7937,
    lng: 90.4066,
    venue: "Sky Lounge, Banani",
    date: "Fri, Mar 28",
    time: "10:00 PM",
    price: 800,
    priceLabel: "৳800",
    rating: 4.5,
    reviewCount: 73,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
  },
  {
    id: 3,
    slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    city: "dhaka",
    lat: 23.7956,
    lng: 90.4175,
    venue: "Café Harmony, Gulshan",
    date: "Sun, Mar 23",
    time: "7:00 PM",
    price: 350,
    priceLabel: "৳350",
    rating: 4.6,
    reviewCount: 55,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&q=80",
  },
  {
    id: 4,
    slug: "open-mic-friday",
    title: "Friday Open Mic",
    category: "music",
    subCategory: "open-mic",
    eventType: "music",
    city: "dhaka",
    lat: 23.7468,
    lng: 90.3757,
    venue: "Café Uprising, Dhanmondi",
    date: "Fri, Mar 28",
    time: "7:00 PM",
    price: 0,
    priceLabel: "Free",
    rating: 4.4,
    reviewCount: 62,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80",
  },
  {
    id: 5,
    slug: "solo-acoustic-night",
    title: "Solo Acoustic Night",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    city: "dhaka",
    lat: 23.7461,
    lng: 90.3742,
    venue: "The Alley, Dhanmondi",
    date: "Thu, Mar 20",
    time: "8:00 PM",
    price: 400,
    priceLabel: "৳400",
    rating: 4.5,
    reviewCount: 48,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  },
  {
    id: 6,
    slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    city: "dhaka",
    lat: 23.7592,
    lng: 90.407,
    venue: "Hatirjheel Amphitheatre",
    date: "Sat, Mar 22",
    time: "4:00 PM",
    price: 900,
    priceLabel: "৳900",
    rating: 4.7,
    reviewCount: 98,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
  },
  {
    id: 7,
    slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "dhaka",
    lat: 23.8069,
    lng: 90.368,
    venue: "Osmani Memorial Hall",
    date: "Sat, Apr 12",
    time: "6:00 PM",
    price: 600,
    priceLabel: "৳600",
    rating: 4.8,
    reviewCount: 134,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
  },
  {
    id: 8,
    slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "dhaka",
    lat: 23.7379,
    lng: 90.3964,
    venue: "Bangabandhu Stadium",
    date: "Sat, Mar 29",
    time: "5:00 PM",
    price: 2500,
    priceLabel: "৳2,500",
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80",
  },
  {
    id: 9,
    slug: "live-bands-showdown",
    title: "Live Bands Showdown",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "dhaka",
    lat: 23.8139,
    lng: 90.4244,
    venue: "Bashundhara City Arena",
    date: "Sat, Apr 5",
    time: "6:00 PM",
    price: 1500,
    priceLabel: "৳1,500",
    rating: 4.8,
    reviewCount: 175,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
  },
  {
    id: 10,
    slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    city: "dhaka",
    lat: 23.7771,
    lng: 90.3997,
    venue: "ICCB, Agargaon",
    date: "Sat, Mar 15",
    time: "6:00 PM",
    price: 1200,
    priceLabel: "৳1,200",
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
  },
  {
    id: 11,
    slug: "bd-premier-league-final",
    title: "BD Premier League Final",
    category: "sports",
    subCategory: "football",
    eventType: "league-matches",
    city: "dhaka",
    lat: 23.7379,
    lng: 90.3964,
    venue: "Bangabandhu Stadium",
    date: "Fri, Mar 14",
    time: "7:00 PM",
    price: 500,
    priceLabel: "৳500",
    rating: 4.7,
    reviewCount: 203,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&q=80",
  },
  {
    id: 12,
    slug: "dhaka-theatre-gala",
    title: "Dhaka Theatre Gala",
    category: "arts-culture",
    subCategory: "theatre",
    eventType: "drama",
    city: "dhaka",
    lat: 23.7337,
    lng: 90.3984,
    venue: "National Theatre, Shahbag",
    date: "Sat, Mar 22",
    time: "7:30 PM",
    price: 800,
    priceLabel: "৳800",
    rating: 4.7,
    reviewCount: 91,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&q=80",
  },
  {
    id: 13,
    slug: "ctg-jazz-night-new",
    title: "Chittagong Jazz Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "chittagong",
    lat: 22.329,
    lng: 91.8139,
    venue: "Hotel Agrabad",
    date: "Sat, May 24",
    time: "7:30 PM",
    price: 600,
    priceLabel: "৳600",
    rating: 4.7,
    reviewCount: 66,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
  },
  {
    id: 14,
    slug: "sylhet-open-air-concert",
    title: "Sylhet Open Air Concert",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "sylhet",
    lat: 24.8978,
    lng: 91.8614,
    venue: "Sylhet Stadium",
    date: "Sun, May 18",
    time: "5:00 PM",
    price: 800,
    priceLabel: "৳800",
    rating: 4.7,
    reviewCount: 66,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80",
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getMapEvents = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_MAP_EVENTS];
  if (locationId && locationId !== "current")
    pool = pool.filter((e) => e.city === locationId);
  if (level === "category")
    pool = pool.filter((e) => e.category === categorySlug);
  if (level === "subCategory")
    pool = pool.filter(
      (e) => e.category === categorySlug && e.subCategory === subCategorySlug,
    );
  if (level === "eventType")
    pool = pool.filter(
      (e) =>
        e.category === categorySlug &&
        e.subCategory === subCategorySlug &&
        e.eventType === eventTypeSlug,
    );
  return pool;
};

const getSectionTitle = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
) => {
  if (level === "root") return "Explore Events Around You";
  if (level === "category")
    return `Explore ${unslugify(categorySlug)} Events Around You`;
  if (level === "subCategory")
    return `Explore ${unslugify(subCategorySlug)} Events Around You`;
  return `Explore ${unslugify(eventTypeSlug)} Events Around You`;
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR EVENT CARD
═══════════════════════════════════════════════════════════════ */
const SidebarCard = ({ event, isActive, onClick }) => (
  <div
    onClick={onClick}
    className="flex gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all"
    style={{
      borderColor: isActive ? "var(--foreground)" : "var(--border)",
      background: isActive ? "var(--secondary)" : "var(--card)",
    }}
  >
    {/* Thumbnail */}
    <div className="relative w-16 h-16 rounded shrink-0 overflow-hidden bg-muted">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start gap-1 mb-0.5">
        <p
          className="text-xs font-bold text-foreground leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {event.title}
          {event.verified && (
            <BadgeCheck size={10} className="inline ml-0.5 text-foreground" />
          )}
        </p>
      </div>
      <p
        className="text-[10px] text-muted-foreground mb-1 line-clamp-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span className="flex items-center gap-1">
          <Calendar size={9} />
          {event.date} · {event.time}
        </span>
      </p>
      <p
        className="text-[10px] text-muted-foreground line-clamp-1 flex items-center gap-1 mb-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <MapPin size={9} />
        {event.venue}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <Star size={9} className="text-foreground fill-foreground" />
          <span
            className="text-[10px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {event.rating}
          </span>
        </div>
        <span
          className="text-xs font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {event.priceLabel}
        </span>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   LEAFLET MAP (lazy loaded to avoid SSR issues)
═══════════════════════════════════════════════════════════════ */
const LeafletMap = ({ events, center, zoom, activeId, onPinClick }) => {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    let L;
    const init = async () => {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapObjRef.current) return; // already initialized

      // Fix default icon path issue with bundlers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapObjRef.current = map;
      renderMarkers(L, map);
    };

    const renderMarkers = (L, map) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      events.forEach((event) => {
        // Custom red pin SVG
        const svgIcon = L.divIcon({
          className: "",
          html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#e11d48"/>
            <circle cx="14" cy="14" r="6" fill="white"/>
          </svg>`,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([event.lat, event.lng], { icon: svgIcon })
          .addTo(map)
          .bindPopup(
            `
            <div style="font-family:sans-serif;min-width:180px;">
              <img src="${event.image}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:8px;" />
              <p style="font-weight:700;font-size:13px;margin:0 0 4px;">${event.title}</p>
              <p style="font-size:11px;color:#666;margin:0 0 2px;">📅 ${event.date} · ${event.time}</p>
              <p style="font-size:11px;color:#666;margin:0 0 6px;">📍 ${event.venue}</p>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;">⭐ ${event.rating} (${event.reviewCount})</span>
                <strong style="font-size:13px;">${event.priceLabel}</strong>
              </div>
            </div>
          `,
            { maxWidth: 220 },
          )
          .on("click", () => onPinClick(event.id));

        markersRef.current.push(marker);
      });
    };

    init();
  }, []);

  // Pan map when active event changes
  useEffect(() => {
    if (!mapObjRef.current || !activeId) return;
    const event = events.find((e) => e.id === activeId);
    if (event) {
      mapObjRef.current.setView([event.lat, event.lng], 14, { animate: true });
    }
  }, [activeId, events]);

  const handleZoomIn = () => mapObjRef.current?.zoomIn();
  const handleZoomOut = () => mapObjRef.current?.zoomOut();

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
      {/* Custom zoom controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-[400]">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded border border-border bg-background hover:bg-accent  shadow-sm"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Zoom in"
        >
          <ZoomIn size={14} className="text-foreground" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded border border-border bg-background hover:bg-accent  shadow-sm"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} className="text-foreground" />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAP SECTION
═══════════════════════════════════════════════════════════════ */
const MapSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const [activeId, setActiveId] = useState(null);
  const [radius, setRadius] = useState(10);
  const [radiusOpen, setRadiusOpen] = useState(false);

  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const sectionTitle = getSectionTitle(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
  );

  const events = getMapEvents(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    locationId,
  );
  const center = CITY_COORDS[locationId] || CITY_COORDS.dhaka;

  const viewAllTo =
    level === "root"
      ? "/browse"
      : level === "category"
        ? `/browse/${categorySlug}`
        : level === "subCategory"
          ? `/browse/${categorySlug}/${subCategorySlug}`
          : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  return (
    <section
      className="w-full bg-background"
      aria-label="Map of events"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Navigation size={16} className="text-foreground" />
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sectionTitle}
                </h2>
              </div>
              <p
                className="text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {events.length} events found near {locationLabel}
              </p>
            </div>
            <Link
              to={viewAllTo}
              className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline shrink-0 ml-4"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2 mb-4">
            {/* Radius dropdown */}
            <div className="relative">
              <button
                onClick={() => setRadiusOpen((p) => !p)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-accent "
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <MapPin size={12} className="text-primary" />
                {radius} km
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className={`transition-transform ${radiusOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {radiusOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-28 rounded-md border border-border bg-popover shadow-md z-50 py-1">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRadius(r);
                        setRadiusOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs hover:bg-accent "
                      style={{
                        color:
                          r === radius
                            ? "var(--foreground)"
                            : "var(--muted-foreground)",
                        fontWeight: r === radius ? 600 : 400,
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {r} km
                      {r === radius && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Locate me */}
            <button
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground "
              style={{ fontFamily: "var(--font-sans)" }}
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(() => {});
              }}
            >
              <Locate size={12} />
              Use my location
            </button>

            {/* Event count pill */}
            <span
              className="ml-auto text-xs text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span className="font-semibold text-foreground">
                {events.length}
              </span>{" "}
              events within {radius} km
            </span>
          </div>

          {/* Map + Sidebar layout */}
          <div className="flex gap-4" style={{ height: "480px" }}>
            {/* Map — takes most of the width */}
            <div className="flex-1 min-w-0">
              {events.length > 0 ? (
                <LeafletMap
                  events={events}
                  center={center}
                  zoom={center.zoom}
                  activeId={activeId}
                  onPinClick={setActiveId}
                />
              ) : (
                <div className="w-full h-full rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center">
                  <MapPin size={28} className="text-muted-foreground mb-3" />
                  <p
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    No events found in this area
                  </p>
                  <p
                    className="text-xs text-muted-foreground mt-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Try increasing the radius or changing your location.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar — scrollable event list */}
            <div
              className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-0.5"
              style={{ scrollbarWidth: "thin" }}
            >
              {events.length === 0 ? (
                <p
                  className="text-xs text-muted-foreground text-center pt-8"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  No events to display.
                </p>
              ) : (
                events.map((event) => (
                  <SidebarCard
                    key={event.id}
                    event={event}
                    isActive={activeId === event.id}
                    onClick={() =>
                      setActiveId(event.id === activeId ? null : event.id)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MapSection;
