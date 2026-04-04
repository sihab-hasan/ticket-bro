import React, { useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Navigation, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const buildSearchResults = (locations, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return locations;

  return locations.filter((location) => {
    const haystack = [location.label, location.city, location.country, location.slug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
};

export const LocationSelector = ({ compact = false }) => {
  const { selectedLocation, changeLocation, locations, isLoadingLocations } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const debouncedSearch = useDebounce(search, 200);

  useOnClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const results = useMemo(
    () => buildSearchResults(locations || [], debouncedSearch),
    [debouncedSearch, locations],
  );

  const currentLabel = selectedLocation?.label || selectedLocation?.city || "Select location";

  const handleSelect = (location) => {
    changeLocation(location);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        className="gap-2"
        onClick={() => setIsOpen((open) => !open)}
      >
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[160px] truncate">{currentLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-popover p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Choose location</h3>
              <p className="text-xs text-muted-foreground">Filter events by city.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search city"
              className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => handleSelect({ id: "all", slug: "all", label: "All Cities" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">All Cities</p>
                <p className="text-xs text-muted-foreground">Show every available location</p>
              </div>
            </button>

            {isLoadingLocations ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">Loading locations…</p>
            ) : results.length ? (
              results.map((location) => (
                <button
                  type="button"
                  key={location.id || location.slug || location.label}
                  onClick={() => handleSelect(location)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{location.label || location.city || location.slug}</p>
                    {(location.country || location.count) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {[location.country, typeof location.count === "number" ? `${location.count} events` : null]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="px-3 py-6 text-sm text-muted-foreground">No locations found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
