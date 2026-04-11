import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Locate, MapPin, Search, X } from "lucide-react";
import { ALL_LOCATION, matchesLocationOption } from "@/lib/locationSelection";

const getButtonClasses = ({ compact, inline }) => {
  if (inline) {
    return "flex items-center gap-1.5 px-3 h-full text-muted-foreground hover:text-primary";
  }

  if (compact) {
    return "flex items-center rounded-md hover:bg-accent h-8 px-2 gap-1 sm:h-9";
  }

  return "flex items-center rounded-md hover:bg-accent h-9 px-3 gap-1.5 max-w-[160px]";
};

const getLabelClasses = ({ compact, inline }) => {
  if (inline) {
    return "text-xs font-medium hidden sm:inline max-w-[80px] truncate";
  }

  if (compact) {
    return "font-medium text-foreground truncate text-sm hidden sm:inline max-w-[110px]";
  }

  return "font-medium text-foreground truncate text-sm max-w-full";
};

const getMenuClasses = ({ inline }) =>
  inline
    ? "absolute top-[calc(100%+8px)] left-0 w-64 rounded-md border border-border bg-popover shadow-lg z-[60] overflow-hidden"
    : "absolute top-full left-0 mt-1.5 w-[min(288px,calc(100vw-1rem))] rounded-md bg-popover shadow-lg z-[60] overflow-hidden";

const LocationPicker = ({
  locations = [],
  selectedLocation = ALL_LOCATION,
  onLocationChange,
  onDetectLocation,
  onClearLocation,
  isDetecting = false,
  compact = false,
  inline = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filteredLocations = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return locations;
    }

    return locations.filter((location) =>
      `${location.label} ${location.country}`.toLowerCase().includes(search),
    );
  }, [locations, query]);

  const handleSelect = (location) => {
    onLocationChange?.(location);
    setOpen(false);
    setQuery("");
  };

  const handleDetect = async () => {
    await onDetectLocation?.();
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className={getButtonClasses({ compact, inline })}
        aria-label="Select location"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <MapPin className={`h-3.5 w-3.5 ${selectedLocation?.mode === "current" ? "text-primary" : "text-primary"} shrink-0`} />
        <span className={getLabelClasses({ compact, inline })}>
          {selectedLocation?.label || "Location"}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200 ${
            compact ? "hidden sm:block" : ""
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className={getMenuClasses({ inline })}>
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search city or country…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-sm bg-muted rounded-md border-0 outline-none text-foreground placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear location search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="p-1 border-b border-border">
            <button
              type="button"
              onClick={handleDetect}
              disabled={isDetecting}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm hover:bg-accent text-left disabled:opacity-50"
            >
              <Locate className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {isDetecting ? "Detecting…" : "Use my current location"}
                </p>
                {selectedLocation?.mode === "current" && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {selectedLocation.label}
                  </p>
                )}
              </div>
              {selectedLocation?.mode === "current" && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto p-1" role="listbox">
            <button
              type="button"
              role="option"
              aria-selected={selectedLocation?.mode === "all"}
              onClick={() => {
                onClearLocation?.();
                setOpen(false);
                setQuery("");
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm hover:bg-accent text-left"
            >
              <span className="text-base leading-none shrink-0">{ALL_LOCATION.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm leading-none">
                  {ALL_LOCATION.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Explore every public city
                </p>
              </div>
              {selectedLocation?.mode === "all" && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </button>

            {!query && (
              <p className="text-[10px] font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
                Popular Cities
              </p>
            )}

            {filteredLocations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No locations found
              </p>
            ) : (
              filteredLocations.map((location) => (
                <button
                  key={location.slug}
                  type="button"
                  role="option"
                  aria-selected={matchesLocationOption(selectedLocation, location)}
                  onClick={() => handleSelect(location)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm hover:bg-accent text-left"
                >
                  <span className="text-base leading-none shrink-0">{location.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm leading-none">
                      {location.label}
                    </p>
                    {location.country && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {location.country}
                      </p>
                    )}
                  </div>
                  {matchesLocationOption(selectedLocation, location) && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
