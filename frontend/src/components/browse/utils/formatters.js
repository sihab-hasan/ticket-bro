// src/utils/formatters.js

/**
 * Formats a date string into a human-readable format
 * Example: '2026-02-23T18:30:00Z' => 'Feb 23, 2026, 06:30 PM'
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: options.dateStyle || "medium",
    timeStyle: options.timeStyle || "short",
  }).format(date);
};

/**
 * Formats a price (number) to currency string
 * Example: 5000 => $5,000.00
 */
export const formatPrice = (amount, currency = "USD") => {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts slug to readable text
 * Example: "music-concert" => "Music Concert"
 */
export const slugToTitle = (slug = "") =>
  slug
    .split("-")
    .map((word) => capitalize(word))
    .join(" ");