/**
 * EventVenueSection.jsx
 * Venue details + embedded map
 */
import React, { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  MapPin,
  Navigation,
  Wifi,
} from "lucide-react";
import { SectionHeading } from "./shared/EventShared.jsx";

const EventVenueSection = ({ event }) => {
  const [copied, setCopied] = useState(false);
  const loc = event.location || {};

  const isOnline = loc.isOnline || loc.type === "online";
  const isHybrid = loc.isHybrid || loc.type === "hybrid";
  const latLng = loc.latLng;
  const address =
    loc.addressLabel ||
    [loc.name, loc.address, loc.city, loc.state, loc.country]
      .filter(Boolean)
      .join(", ");
  const hasMapLocation = Boolean(latLng || address);
  const mapsUrl = hasMapLocation
    ? `https://maps.google.com/?q=${encodeURIComponent(
        latLng ? `${latLng.lat},${latLng.lng}` : address,
      )}`
    : null;
  const embedUrl = hasMapLocation
    ? latLng
      ? `https://maps.google.com/maps?q=${latLng.lat},${latLng.lng}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  const copyAddress = async () => {
    if (!address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading>
        {isOnline && !isHybrid ? "Online Event" : "Venue"}
        <span className="text-xs font-normal text-muted-foreground">
          {loc.typeLabel ||
            (isOnline ? "Online" : isHybrid ? "Hybrid" : "In Person")}
        </span>
      </SectionHeading>

      {(isOnline || isHybrid) && (
        <div
          className="flex flex-col gap-3 rounded-xl border border-border p-4"
          style={{ background: "var(--card)" }}
        >
          <div className="flex items-center gap-2.5">
            <Wifi size={18} className="text-foreground" />
            <div>
              <p
                className="text-sm font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {loc.onlinePlatform || "Online access"}
              </p>
              <p
                className="text-xs text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {loc.onlineUrl
                  ? "Use the event link below to join when access opens."
                  : "Join details will be shared before the event starts."}
              </p>
            </div>
          </div>
          {loc.onlineUrl && (
            <a
              href={loc.onlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <Globe size={12} /> Open event link <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      {!isOnline && (
        <>
          {hasMapLocation ? (
            <div
              className="overflow-hidden rounded-xl border border-border bg-muted"
              style={{ height: 240 }}
            >
              <iframe
                title="Event venue"
                src={embedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div
              className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"
              style={{ background: "var(--card)", fontFamily: "var(--font-sans)" }}
            >
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Venue details coming soon</p>
                <p className="mt-1">
                  The organizer has not published the exact venue or map yet.
                </p>
              </div>
            </div>
          )}

          <div
            className="flex flex-col gap-3 rounded-xl border border-border p-4"
            style={{ background: "var(--card)" }}
          >
            <div>
              <p
                className="text-sm font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {loc.name || (isHybrid ? "Physical venue" : "Venue")}
              </p>
              <p
                className="mt-0.5 text-xs text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {address || "The organizer will share the final address soon."}
              </p>
            </div>
            {hasMapLocation && mapsUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <Navigation size={11} /> Get Directions
                </a>
                <button
                  onClick={copyAddress}
                  disabled={!address}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-foreground" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> Copy Address
                    </>
                  )}
                </button>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Open in Maps <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventVenueSection;
