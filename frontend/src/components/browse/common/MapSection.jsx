// frontend/src/components/browse/sections/MapSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, Layers } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useBrowse } from "@/hooks";
import { useLocation } from "@/context/LocationContext";
import SectionShell from "./SectionShell";

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (isActive = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${isActive ? '#ef4444' : '#6366f1'};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 14px; height: 14px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapSection = () => {
  const { getNearby, locationLabel, locationFlag, config, level, buildEventUrl } = useBrowse();
  const { selectedLocation } = useLocation();
  const events = getNearby();
  const [activeEvent, setActiveEvent] = useState(null);
  const title = level === "root" ? `Events Map — ${locationLabel}` : `${config.label} Map`;

  const eventMarkers = events
    .filter((event) => event.location?.latLng)
    .slice(0, 10)
    .map((event) => ({
      id: event.id || event._id,
      title: event.title,
      priceLabel: event.priceLabel,
      location: event.location?.name || event.location?.city || "Venue TBA",
      lat: event.location.latLng.lat,
      lng: event.location.latLng.lng,
      url: buildEventUrl(event),
      image: event.coverImage,
    }));

  if (!eventMarkers.length) {
    return null;
  }

  const center = selectedLocation?.coords
    ? [selectedLocation.coords.lat, selectedLocation.coords.lng]
    : [eventMarkers[0].lat, eventMarkers[0].lng];

  return (
    <SectionShell
      title={title}
      subtitle={`${locationFlag} ${eventMarkers.length} mapped events in ${locationLabel}`}
      icon={Navigation}
      divider={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Map Container */}
        <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: "400px" }}>
          <MapContainer 
            center={center} 
            zoom={12} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} />
            {eventMarkers.map((event) => (
              <Marker 
                key={event.id}
                position={[event.lat, event.lng]}
                icon={createCustomIcon(activeEvent === event.id)}
                eventHandlers={{
                  click: () => setActiveEvent(event.id),
                }}
              >
                <Popup>
                  <div className="w-48">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-24 object-cover rounded-t"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="p-2">
                      <h4 className="font-bold text-sm line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {event.location}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">{event.priceLabel}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Controls Overlay */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <div className="bg-white rounded-lg shadow-md p-1">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Layers size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Event List Sidebar */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">{eventMarkers.length} events</span>
            <button className="text-xs text-primary hover:underline">View all on map</button>
          </div>
          {events
            .filter((event) => event.location?.latLng)
            .slice(0, 8)
            .map((e) => (
            <Link 
              key={e.id} 
              to={buildEventUrl(e)}
              onMouseEnter={() => setActiveEvent(e.id)}
              onMouseLeave={() => setActiveEvent(null)}
              className={`group flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                activeEvent === e.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-foreground/20 hover:bg-accent/20'
              }`}
            >
              <div className="w-14 h-14 rounded-lg shrink-0 overflow-hidden bg-muted">
                <img 
                  src={e.coverImage} 
                  alt={e.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(x) => x.target.style.display="none"} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:underline" style={{ fontFamily: "var(--font-heading)" }}>
                  {e.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                  <MapPin size={10} />
                  <span className="truncate">{e.location?.name || e.location?.city || "Venue TBA"}</span>
                </div>
                <p className="text-xs font-bold text-primary mt-1" style={{ fontFamily: "var(--font-heading)" }}>{e.priceLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionShell>
  );
};

export default MapSection;
