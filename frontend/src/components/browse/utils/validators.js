// src/utils/validators.js

/**
 * Validates an email string
 */
export const isValidEmail = (email = "") => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates a phone number (basic international format)
 */
export const isValidPhone = (phone = "") => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone);
};

/**
 * Checks if a string is empty or only whitespace
 */
export const isEmptyString = (str = "") => !str.trim().length;

/**
 * Validates event slug (letters, numbers, hyphens)
 */
export const isValidSlug = (slug = "") => /^[a-z0-9-]+$/.test(slug);

/**
 * Checks if the number is a valid ticket quantity
 */
export const isValidTicketQuantity = (qty) =>
  Number.isInteger(qty) && qty > 0;