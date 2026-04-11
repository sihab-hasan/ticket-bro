import { useState, useEffect, useRef } from "react";

/**
 * useCarbonFootprint
 *
 * Tracks network data transfer for the current browser session and estimates
 * CO2 emissions using the Sustainable Web Design (SWD) model — the same model
 * used by @tgwf/co2 — without any external dependency.
 *
 * SWD formula:  CO2 (g) = bytes × 0.000000000369 × 1_000_000_000 × 0.494 / 1_000_000
 * Simplified:   CO2 (g) = bytes × 0.0000001822
 *
 * Returns: [gCO2, bytesTransferred]
 */

// Grams of CO2 per byte (SWD model, average grid, non-green host)
const CO2_PER_BYTE = 0.0000001822;

const useCarbonFootprint = () => {
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [gCO2, setGCO2] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    // Read already-loaded entries first
    const processEntries = (entries) => {
      let newBytes = 0;
      entries.forEach((entry) => {
        if (
          entry.entryType === "resource" &&
          typeof entry.transferSize === "number" &&
          entry.transferSize > 0
        ) {
          newBytes += entry.transferSize;
        }
      });
      if (newBytes > 0) {
        setBytesTransferred((prev) => {
          const total = prev + newBytes;
          setGCO2(total * CO2_PER_BYTE);
          return total;
        });
      }
    };

    // Process entries already in the buffer
    const existing = performance.getEntriesByType("resource");
    processEntries(existing);

    // Observe future entries
    if (typeof PerformanceObserver !== "undefined") {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          processEntries(list.getEntries());
        });
        observerRef.current.observe({ entryTypes: ["resource"] });
      } catch (_) {
        // PerformanceObserver not supported — silent fallback
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [gCO2, bytesTransferred];
};

export default useCarbonFootprint;
