import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  ChevronDown,
  X,
  Search,
  Navigation,
  Star,
  Clock,
  History,
} from "lucide-react";
import { useLocation } from "../../../providers/LocationProvider";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useDebounce } from "../../../hooks/useDebounce";
import { Button } from "@/components/ui/button";

export const LocationSelector = () => {
  const {
    currentLocation,
    detectedLocation,
    savedLocations,
    recentSearches,
    isLoading,
    setLocation,
    saveLocation,
    removeSavedLocation,
    geocodeAddress,
    requestBrowserLocation,
    formatDistance,
  } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [searchResults, setSearchResults] = useState([]);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const results = await geocodeAddress(query, { limit: 10 });
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (location) => {
    setLocation(location);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleUseCurrentLocation = async () => {
    try {
      const position = await requestBrowserLocation();
      if (position) setIsOpen(false);
    } catch (error) {
      console.error("Failed to get current location:", error);
    }
  };

  const getLocationDisplay = () => {
    if (currentLocation?.city?.name) {
      return `${currentLocation.city.name}, ${currentLocation.country?.code || ""}`;
    }
    return "Select location";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 text-sm font-normal border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
      >
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[150px] truncate font-sans">
          {getLocationDisplay()}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-popover text-popover-foreground shadow-xl rounded-lg border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-heading font-semibold text-base">
              Choose your location
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-sans">
              Select a location to see events near you
            </p>
          </div>

          {/* Search Input */}
          <div className="p-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, address, or venue..."
                className="w-full pl-9 pr-9 py-2 bg-secondary/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Current Location */}
          <div className="px-3 pb-2">
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Navigation className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Use current location</p>
                {detectedLocation && (
                  <p className="text-xs text-muted-foreground">
                    {detectedLocation.city?.name},{" "}
                    {detectedLocation.country?.name}
                  </p>
                )}
              </div>
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-3 bg-muted/10">
            {["search", "saved", "recent"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {activeTab === "search" && (
              <SearchTab
                isSearching={isSearching}
                searchQuery={searchQuery}
                searchResults={searchResults}
                onSelect={handleSelectLocation}
                onSave={saveLocation}
                savedLocations={savedLocations}
                formatDistance={formatDistance}
              />
            )}
            {activeTab === "saved" && (
              <SavedTab
                savedLocations={savedLocations}
                onSelect={handleSelectLocation}
                onRemove={removeSavedLocation}
              />
            )}
            {activeTab === "recent" && (
              <RecentTab
                recentSearches={recentSearches}
                onSelect={handleSelectLocation}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground h-8"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components for better structure ---

const SearchTab = ({
  isSearching,
  searchQuery,
  searchResults,
  onSelect,
  onSave,
  savedLocations,
  formatDistance,
}) => {
  if (isSearching)
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );

  if (searchQuery.length < 2)
    return (
      <p className="text-center py-8 text-sm text-muted-foreground">
        Type at least 2 characters...
      </p>
    );

  if (searchResults.length === 0)
    return (
      <p className="text-center py-8 text-sm text-muted-foreground">
        No locations found
      </p>
    );

  return searchResults.map((result, index) => (
    <LocationResultItem
      key={`${result.placeId || index}`}
      location={result}
      onSelect={onSelect}
      onSave={onSave}
      isSaved={savedLocations.some((l) => l.placeId === result.placeId)}
      formatDistance={formatDistance}
    />
  ));
};

const SavedTab = ({ savedLocations, onSelect, onRemove }) => {
  if (savedLocations.length === 0)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No saved places yet</p>
      </div>
    );
  return savedLocations.map((location) => (
    <SavedLocationItem
      key={location.id}
      location={location}
      onSelect={onSelect}
      onRemove={onRemove}
    />
  ));
};

const RecentTab = ({ recentSearches, onSelect }) => {
  if (recentSearches.length === 0)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No recent searches</p>
      </div>
    );
  return recentSearches.map((search, index) => (
    <RecentSearchItem key={index} search={search} onSelect={onSelect} />
  ));
};

const LocationResultItem = ({
  location,
  onSelect,
  onSave,
  isSaved,
  formatDistance,
}) => (
  <div className="group relative">
    <button
      onClick={() => onSelect(location)}
      className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <span className="text-lg opacity-80">📍</span>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-sm truncate">
          {location.text || location.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {location.secondaryText || location.formattedAddress}
        </p>
        {location.distance && (
          <p className="text-[10px] text-primary font-semibold mt-1 uppercase tracking-tight">
            {formatDistance(location.distance)} away
          </p>
        )}
      </div>
    </button>
    {!isSaved && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave(location);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
      >
        <Star className="h-4 w-4" />
      </button>
    )}
  </div>
);

const SavedLocationItem = ({ location, onSelect, onRemove }) => (
  <div className="group relative">
    <button
      onClick={() => onSelect(location)}
      className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Star className="h-4 w-4 text-chart-4 fill-chart-4 mt-0.5" />
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-sm truncate">
          {location.text || location.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {location.secondaryText}
        </p>
      </div>
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

const RecentSearchItem = ({ search, onSelect }) => (
  <button
    onClick={() => onSelect(search)}
    className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
  >
    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
    <div className="flex-1 text-left">
      <p className="font-medium text-sm">{search.text || search.name}</p>
      {search.timestamp && (
        <p className="text-[10px] text-muted-foreground">
          {new Date(search.timestamp).toLocaleDateString()}
        </p>
      )}
    </div>
  </button>
);
