import { useState } from "react";
import { Leaf, X, ChevronDown, ChevronUp } from "lucide-react";
import useCarbonFootprint from "@/hooks/useCarbonFootprint";

/**
 * CarbonFootprintDisplay
 * Floating badge (bottom-right) showing estimated network CO2 emissions.
 * Uses the local useCarbonFootprint hook — no external package needed.
 */
const CarbonFootprintDisplay = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint();
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getEmissionColor = (grams) => {
    if (grams < 0.01) return "#22c55e";
    if (grams < 0.05) return "#f59e0b";
    return "#ef4444";
  };

  const emissionColor = getEmissionColor(gCO2);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 16,
        zIndex: 9999,
        fontFamily: "var(--font-sans, sans-serif)",
        fontSize: "12px",
      }}
    >
      {expanded ? (
        <div
          style={{
            background: "var(--card, #fff)",
            color: "var(--foreground, #111)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: "14px 16px",
            width: "220px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600,
              }}
            >
              <Leaf size={14} color="#22c55e" />
              Carbon Footprint
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setExpanded(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  color: "var(--muted-foreground, #6b7280)",
                }}
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => setVisible(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  color: "var(--muted-foreground, #6b7280)",
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <div
              style={{
                color: "var(--muted-foreground, #6b7280)",
                marginBottom: "2px",
              }}
            >
              CO₂ Emissions
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: emissionColor,
              }}
            >
              {gCO2.toFixed(4)}
              <span
                style={{ fontSize: "12px", fontWeight: 400, marginLeft: "4px" }}
              >
                g CO₂eq
              </span>
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                color: "var(--muted-foreground, #6b7280)",
                marginBottom: "2px",
              }}
            >
              Data Transferred
            </div>
            <div style={{ fontWeight: 600 }}>
              {formatBytes(bytesTransferred)}
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border, #e5e7eb)",
              paddingTop: "8px",
              color: "var(--muted-foreground, #6b7280)",
              lineHeight: "1.5",
            }}
          >
            Estimates based on network data transfer during this session.
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--card, #fff)",
            color: "var(--foreground, #111)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: "999px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          <Leaf size={13} color="#22c55e" />
          <span style={{ color: emissionColor, fontWeight: 600 }}>
            {gCO2.toFixed(4)}g CO₂
          </span>
          <ChevronUp size={12} color="var(--muted-foreground, #6b7280)" />
        </button>
      )}
    </div>
  );
};

export default CarbonFootprintDisplay;
