import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, MapPin, Star, Ticket } from "lucide-react";
import { fmtDateShort } from "./shared/EventShared.jsx";
import { getEventImage, getEventLocationLabel, getEventPriceLabel, getEventUrl } from "@/utils/event-card";

const EventRelatedSection = ({ event, events = [] }) => {
  const related = events.filter((item) => item.slug !== event.slug).slice(0, 4);
  const categorySlug = event.category?.slug;

  if (!related.length) {
    return null;
  }

  return (
    <div
      className="w-full border-t border-border"
      style={{ background: "var(--background)" }}
    >
      <div className="content-shell">
        <div className="py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              You Might Also Like
            </h2>
            {categorySlug && (
              <Link
                to={`/${categorySlug}`}
                className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                View all <ChevronRight size={13} />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => {
              const href = getEventUrl(item);
              const imageSrc = getEventImage(item);
              const locationLabel = getEventLocationLabel(item);
              const priceLabel = getEventPriceLabel(item);

              return (
                <Link
                  key={item.id}
                  to={href}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border transition-all hover:border-foreground/20 hover:shadow-md"
                  style={{ background: "var(--card)" }}
                >
                  <div className="relative h-40 shrink-0 overflow-hidden bg-muted">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        onError={(image) => {
                          image.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/30">
                        <Ticket className="h-8 w-8" />
                      </div>
                    )}
                    {item.isFeatured && (
                      <span
                        className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: "var(--foreground)",
                          color: "var(--background)",
                          fontFamily: "var(--font-brand)",
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 p-3">
                    <h3
                      className="line-clamp-2 text-sm font-bold text-foreground group-hover:underline"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="flex items-center gap-1 text-[11px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <Calendar size={10} />
                      {fmtDateShort(item.startDate)}
                    </p>
                    <p
                      className="flex items-center gap-1 truncate text-[11px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <MapPin size={10} />
                      {locationLabel}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <Star
                          size={10}
                          className="fill-foreground text-foreground"
                        />
                        <span
                          className="text-[11px] font-semibold text-foreground"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {Number(item.averageRating || 0).toFixed(1)}
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {priceLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRelatedSection;
