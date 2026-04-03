// frontend/src/context/LocationContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import locationsService from "@/api/locations.api";
import { normalizeLocationOption } from "@/utils/browse.utils";

export const LOCATIONS = [];

const DEFAULT_LOCATION = {
  id: "all",
  slug: "all",
  label: "All Cities",
  country: "",
  flag: "Location",
  count: 0,
};

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedLocation");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return DEFAULT_LOCATION;
  });

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const cities = await locationsService.getCities();
        if (cancelled) return;

        const normalized = (cities || []).map(normalizeLocationOption);
        setLocations(normalized);

        setSelectedLocation((current) => {
          if (!normalized.length) {
            return current || DEFAULT_LOCATION;
          }

          const matched =
            normalized.find((location) => location.id === current?.id) ||
            normalized.find((location) => location.slug === current?.slug);

          if (matched) {
            return matched;
          }

          if (current?.id === "current") {
            return current;
          }

          return normalized[0];
        });
      } catch (_) {
        if (!cancelled) {
          setLocations([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("selectedLocation", JSON.stringify(selectedLocation));
    } catch (_) {}
  }, [selectedLocation]);

  const changeLocation = (loc) => {
    setSelectedLocation(loc || DEFAULT_LOCATION);
  };

  const value = useMemo(
    () => ({
      selectedLocation,
      changeLocation,
      locations,
      isLoadingLocations,
    }),
    [isLoadingLocations, locations, selectedLocation],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
};

export default LocationContext;
