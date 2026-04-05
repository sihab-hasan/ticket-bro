// frontend/src/components/browse/sections/MapSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { latLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { MapPin, Navigation } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";
import {
  getEventImage,
  getEventLocationLabel,
  getEventPriceLabel,
} from "@/utils/event-card";

// Map placeholder — in production replace with react-leaflet or Google Maps
const MapPlaceholder = ({ locationLabel, eventCount }) => (
  <div className="relative w-full rounded-lg border border-border overflow-hidden bg-secondary/10" style={{ height: "320px" }}>
    {/* Decorative grid lines */}
    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    {/* Center pin */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary animate-pulse">
        <MapPin size={22} className="text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{locationLabel}</p>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{eventCount} events near you</p>
      </div>
      <p className="text-[10px] text-muted-foreground border border-border rounded px-2 py-1 bg-background/70" style={{ fontFamily: "var(--font-sans)" }}>
        Interactive map coming soon · Install react-leaflet to enable
      </p>
    </div>
    {/* Fake scatter dots */}
    {[{x:20,y:30},{x:65,y:20},{x:40,y:55},{x:80,y:65},{x:15,y:70},{x:55,y:75}].map((p, i) => (
      <div key={i} className="absolute w-3 h-3 rounded-full bg-primary/60 border border-primary animate-pulse"
        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i*0.2}s` }} />
    ))}
  </div>
);

const MAP_HEIGHT = 320;
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const getEventId = (event) => event?.id || event?._id || event?.slug || "";

const getLatLng = (event) => {
  const lat = Number(event?.location?.latLng?.lat);
  const lng = Number(event?.location?.latLng?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lat, lng];
};

const MapViewport = ({ events, activeEventId }) => {
  const map = useMap();

  useEffect(() => {
    if (!events.length) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    if (events.length === 1) {
      const position = getLatLng(events[0]);
      if (position) {
        map.setView(position, 13, { animate: false });
      }
    } else {
      const bounds = latLngBounds(
        events.map((event) => getLatLng(event)).filter(Boolean),
      );
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    }

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [events, map]);

  useEffect(() => {
    if (!activeEventId) {
      return;
    }

    const activeEvent = events.find(
      (event) => getEventId(event) === activeEventId,
    );
    const position = getLatLng(activeEvent);

    if (position) {
      map.panTo(position, { animate: true, duration: 0.35 });
    }
  }, [activeEventId, events, map]);

  return null;
};

const MapFallback = ({ locationLabel, eventCount }) => (
  <div
    className="relative flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary/10 p-6 text-center"
    style={{ minHeight: MAP_HEIGHT }}
  >
    <div className="flex max-w-xs flex-col items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
        <MapPin size={22} />
      </span>
      <div>
        <p
          className="text-sm font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Map coordinates missing
        </p>
        <p
          className="mt-1 text-xs text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {eventCount} nearby event{eventCount > 1 ? "s" : ""} were found in{" "}
          {locationLabel}, but none of them have map coordinates yet.
        </p>
      </div>
    </div>
  </div>
);

const MapSection = () => {
  const {
    getNearby,
    locationLabel,
    locationFlag,
    config,
    level,
    buildEventUrl,
  } = useBrowse();
  const nearbyEvents = getNearby();
  const mappableEvents = useMemo(
    () => nearbyEvents.filter((event) => Boolean(getLatLng(event))),
    [nearbyEvents],
  );
  const firstMappableId = getEventId(mappableEvents[0]);
  const [activeEventId, setActiveEventId] = useState(firstMappableId);

  useEffect(() => {
    setActiveEventId(firstMappableId);
  }, [firstMappableId]);
  const listEvents = (mappableEvents.length ? mappableEvents : nearbyEvents).slice(
    0,
    6,
  );
  const title = level === "root" ? `Events Map — ${locationLabel}` : `${config.label} Map`;

  if (!nearbyEvents.length) {
    return null;
  }

  return (
    <section className="w-full bg-background" aria-label="Events map">
      <Container>
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
              <Navigation size={13} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {locationFlag} {mappableEvents.length || nearbyEvents.length} event
                {(mappableEvents.length || nearbyEvents.length) > 1 ? "s" : ""} near
                you in {locationLabel}
                {mappableEvents.length && mappableEvents.length !== nearbyEvents.length
                  ? ` (${mappableEvents.length} pinned on the map)`
                  : ""}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div
              className="overflow-hidden rounded-lg border border-border bg-card"
              style={{ height: MAP_HEIGHT }}
            >
              {mappableEvents.length ? (
                <MapContainer
                  center={getLatLng(mappableEvents[0])}
                  zoom={12}
                  scrollWheelZoom={false}
                  className="h-full w-full z-0"
                >
                  <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
                  <MapViewport
                    events={mappableEvents}
                    activeEventId={activeEventId}
                  />
                  {mappableEvents.map((event) => {
                    const eventId = getEventId(event);
                    const position = getLatLng(event);
                    const isActive = eventId === activeEventId;

                    if (!position) {
                      return null;
                    }

                    return (
                      <CircleMarker
                        key={eventId}
                        center={position}
                        radius={isActive ? 11 : 8}
                        pathOptions={{
                          color: isActive ? "#111827" : "#2563eb",
                          fillColor: isActive ? "#111827" : "#2563eb",
                          fillOpacity: 0.85,
                          weight: isActive ? 3 : 2,
                        }}
                        eventHandlers={{
                          click: () => setActiveEventId(eventId),
                          mouseover: () => setActiveEventId(eventId),
                        }}
                      >
                        <Popup>
                          <div className="min-w-[180px] space-y-1.5">
                            <Link
                              to={buildEventUrl(event)}
                              className="block text-sm font-bold text-foreground hover:underline"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {event.title}
                            </Link>
                            <p
                              className="text-xs text-muted-foreground"
                              style={{ fontFamily: "var(--font-sans)" }}
                            >
                              {getEventLocationLabel(event)}
                            </p>
                            <p
                              className="text-xs font-semibold text-foreground"
                              style={{ fontFamily: "var(--font-sans)" }}
                            >
                              {getEventPriceLabel(event)}
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              ) : (
                <MapFallback
                  locationLabel={locationLabel}
                  eventCount={nearbyEvents.length}
                />
              )}
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {listEvents.map((event) => {
                const eventId = getEventId(event);
                const imageSrc = getEventImage(event);
                const isActive = eventId === activeEventId;

                return (
                  <Link
                    key={eventId}
                    to={buildEventUrl(event)}
                    onMouseEnter={() => setActiveEventId(eventId)}
                    onFocus={() => setActiveEventId(eventId)}
                    className={`group flex items-center gap-2.5 rounded-md border p-2.5 transition-all ${
                      isActive
                        ? "border-foreground/30 bg-accent/30 shadow-sm"
                        : "border-border bg-card hover:border-foreground/20 hover:bg-accent/20"
                    }`}
                  >
                    <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-muted">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(imageEvent) => {
                            imageEvent.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-xs font-bold text-foreground line-clamp-1 group-hover:underline"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {event.title}
                      </h4>
                      <div
                        className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        <MapPin size={8} />
                        <span className="truncate">
                          {getEventLocationLabel(event)}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold text-foreground shrink-0"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {getEventPriceLabel(event)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default MapSection;
