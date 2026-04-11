// frontend/src/context/LocationContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import locationsService from "@/api/locations.api";
import { toast } from "@/components/shared/common";
import {
  ALL_LOCATION,
  normalizeStoredLocation,
  reconcileSelectionWithLocations,
  toCurrentLocationSelection,
  toManualLocationSelection,
} from "@/lib/locationSelection";

export const LOCATIONS = [];
const STORAGE_KEY = "selectedLocation";

const LocationContext = createContext(null);

const readStoredLocation = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeStoredLocation(JSON.parse(saved)) : { ...ALL_LOCATION };
  } catch (_) {
    return { ...ALL_LOCATION };
  }
};

const getFallbackSelection = (selection) =>
  selection?.mode === "city" ? selection : { ...ALL_LOCATION };

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  });

const getGeolocationErrorMessage = (error) => {
  if (error?.code === 1) {
    return "Location permission was denied.";
  }
  if (error?.code === 2) {
    return "Your current location could not be detected.";
  }
  if (error?.code === 3) {
    return "Location detection timed out.";
  }
  return error?.message || "Unable to detect your current location.";
};

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => readStoredLocation());

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const cities = await locationsService.getCities();
        if (cancelled) return;

        const normalized = (cities || []).map((city) => toManualLocationSelection(city));
        setLocations(normalized);

        setSelectedLocation((current) => reconcileSelectionWithLocations(current, normalized));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedLocation));
    } catch (_) {}
  }, [selectedLocation]);

  const changeLocation = useCallback((location) => {
    if (!location || location.mode === "all" || location.id === "all" || location.slug === "all") {
      setSelectedLocation({ ...ALL_LOCATION });
      return;
    }

    if (location.mode === "current") {
      setSelectedLocation(normalizeStoredLocation(location));
      return;
    }

    setSelectedLocation(toManualLocationSelection(location));
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation({ ...ALL_LOCATION });
  }, []);

  const detectCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);

    try {
      const position = await getCurrentPosition();
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const resolvedLocation = await locationsService.reverseGeocode(coords);
      const nextSelection = toCurrentLocationSelection(
        resolvedLocation,
        coords,
      );

      setSelectedLocation(nextSelection);
      toast.success(`Showing events near ${nextSelection.label}.`);
      return nextSelection;
    } catch (error) {
      const fallback = getFallbackSelection(selectedLocation);
      setSelectedLocation(fallback);
      toast.error(
        fallback.mode === "city"
          ? `${getGeolocationErrorMessage(error)} Keeping ${fallback.label}.`
          : `${getGeolocationErrorMessage(error)} Showing all cities.`,
      );
      return fallback;
    } finally {
      setIsDetectingLocation(false);
    }
  }, [selectedLocation]);

  const value = useMemo(
    () => ({
      selectedLocation,
      changeLocation,
      clearLocation,
      detectCurrentLocation,
      locations,
      isLoadingLocations,
      isDetectingLocation,
    }),
    [
      changeLocation,
      clearLocation,
      detectCurrentLocation,
      isDetectingLocation,
      isLoadingLocations,
      locations,
      selectedLocation,
    ],
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
