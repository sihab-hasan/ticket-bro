// frontend/src/context/LocationContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
   LOCATION DATA
   Replace with API call to get available cities
═══════════════════════════════════════════════════════════════ */
export const LOCATIONS = [
  { id: "dhaka", label: "Dhaka", country: "Bangladesh", flag: "🇧🇩" },
  { id: "chittagong", label: "Chittagong", country: "Bangladesh", flag: "🇧🇩" },
  { id: "jashore", label: "Jashore", country: "Bangladesh", flag: "🇧🇩" },
  { id: "sylhet", label: "Sylhet", country: "Bangladesh", flag: "🇧🇩" },
  { id: "rajshahi", label: "Rajshahi", country: "Bangladesh", flag: "🇧🇩" },
  { id: "khulna", label: "Khulna", country: "Bangladesh", flag: "🇧🇩" },
  { id: "barisal", label: "Barisal", country: "Bangladesh", flag: "🇧🇩" },
  { id: "mymensingh", label: "Mymensingh", country: "Bangladesh", flag: "🇧🇩" },
  { id: "london", label: "London", country: "UK", flag: "🇬🇧" },
  { id: "dubai", label: "Dubai", country: "UAE", flag: "🇦🇪" },
  { id: "toronto", label: "Toronto", country: "Canada", flag: "🇨🇦" },
  { id: "singapore", label: "Singapore", country: "Singapore", flag: "🇸🇬" },
  { id: "sydney", label: "Sydney", country: "Australia", flag: "🇦🇺" },
];

const DEFAULT_LOCATION = LOCATIONS[0]; // Dhaka

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    // Persist last selected location in localStorage
    try {
      const saved = localStorage.getItem("selectedLocation");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate it still exists in our list
        const exists = LOCATIONS.find((l) => l.id === parsed.id);
        return exists || DEFAULT_LOCATION;
      }
    } catch (_) {}
    return DEFAULT_LOCATION;
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem("selectedLocation", JSON.stringify(selectedLocation));
    } catch (_) {}
  }, [selectedLocation]);

  const changeLocation = (loc) => {
    setSelectedLocation(loc);
    // In production: trigger global refetch / query invalidation here
    // e.g. queryClient.invalidateQueries({ queryKey: ["events"] })
  };

  return (
    <LocationContext.Provider value={{ selectedLocation, changeLocation, locations: LOCATIONS }}>
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