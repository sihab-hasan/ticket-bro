// ============================================================
//  SLUG GENERATOR UTILITY
//  src/common/utils/slugGenerator.js
// ============================================================

const slugify = require("slugify");

class SlugGenerator {
  /**
   * Generate slug from text
   */
  static generate(text, options = {}) {
    const defaultOptions = {
      replacement: "-",
      remove: /[*+~.()'"!:@]/g,
      lower: true,
      strict: true,
      locale: "en",
      trim: true,
    };

    return slugify(text, { ...defaultOptions, ...options });
  }

  /**
   * Generate unique slug with suffix
   */
  static async generateUnique(text, model, field = "slug", options = {}) {
    const baseSlug = this.generate(text, options);
    let slug = baseSlug;
    let counter = 1;

    while (await this.exists(slug, model, field)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Check if slug exists in database
   */
  static async exists(slug, model, field = "slug") {
    const count = await model.countDocuments({ [field]: slug });
    return count > 0;
  }

  /**
   * Generate event slug
   */
  static async generateEventSlug(title, eventId = null, organizerName = null) {
    let base = title;
    if (organizerName) {
      base = `${organizerName}-${title}`;
    }

    const Event = require("../../modules/events/event.model");
    let slug = this.generate(base);

    // Check if exists (excluding current event)
    const query = { slug };
    if (eventId) {
      query._id = { $ne: eventId };
    }

    let counter = 1;
    while (await Event.exists(query)) {
      slug = `${this.generate(base)}-${counter}`;
      query.slug = slug;
      counter++;
    }

    return slug;
  }

  /**
   * Generate organizer slug
   */
  static async generateOrganizerSlug(name, organizerId = null) {
    const Organizer = require("../../modules/organizers/organizer.model");
    return this.generateUnique(name, Organizer, "slug", { organizerId });
  }

  /**
   * Generate category slug
   */
  static async generateCategorySlug(name, categoryId = null) {
    const Category = require("../../modules/categories/category.model");
    return this.generateUnique(name, Category, "slug", { categoryId });
  }

  /**
   * Generate location slug
   */
  static async generateLocationSlug(city, country, locationId = null) {
    const Location = require("../../modules/locations/location.model");
    const base = `${city}-${country}`;
    return this.generateUnique(base, Location, "slug", { locationId });
  }

  /**
   * Normalize slug for URLs
   */
  static normalize(slug) {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  /**
   * Extract ID from slug
   * (if slug contains ID at the end like "event-title-123456")
   */
  static extractId(slug) {
    const parts = slug.split("-");
    const lastPart = parts[parts.length - 1];

    if (lastPart && /^[0-9a-fA-F]{24}$/.test(lastPart)) {
      return lastPart;
    }

    return null;
  }
}

module.exports = SlugGenerator;
