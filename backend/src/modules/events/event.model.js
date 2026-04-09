// src/modules/events/event.model.js
'use strict';
const mongoose = require('mongoose');

// ── Helper: safe slugify ────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ── Enums ───────────────────────────────────────────────────────────────────
const EVENT_STATUS = Object.freeze({
  DRAFT:      'draft',
  PENDING:    'pending',
  PUBLISHED:  'published',
  CANCELLED:  'cancelled',
  POSTPONED:  'postponed',
  COMPLETED:  'completed',
  REJECTED:   'rejected',
});

const VISIBILITY = Object.freeze({
  PUBLIC:   'public',
  PRIVATE:  'private',   // invite / direct-link only
  UNLISTED: 'unlisted',  // not in browse, but accessible via link
});

const AGE_RESTRICTION = Object.freeze({
  ALL:    'all',
  TEEN:   'teen',   // 13+
  ADULT:  'adult',  // 18+
});

// ── Recurrence Sub-Schema ───────────────────────────────────────────────────
// Keeps recurring event logic self-contained inside the document.
const recurrenceSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    required: true,
  },
  interval:   { type: Number, default: 1, min: 1 },   // every N frequencies
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],     // 0=Sun … 6=Sat
  endDate:    { type: Date },
  maxOccurrences: { type: Number, min: 1 },
}, { _id: false });

// ── Location Sub-Schema ─────────────────────────────────────────────────────
// IMPORTANT:
// Keep GeoJSON coordinates fully optional. The previous version defaulted
// `coordinates.type` to "Point" even when no coordinate pair was provided,
// which caused MongoDB 2dsphere index writes to fail during event creation.
const geoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: {
    type: [Number],
    default: undefined,
    validate: {
      validator(value) {
        return value == null || (Array.isArray(value) && value.length === 2 && value.every(Number.isFinite));
      },
      message: 'GeoJSON coordinates must be [lng, lat].',
    },
  },
}, { _id: false });

const locationSchema = new mongoose.Schema({
  type:      { type: String, enum: ['online', 'physical', 'hybrid'], default: 'physical' },
  name:      { type: String, trim: true },
  address:   { type: String, trim: true },
  city:      { type: String, trim: true },
  state:     { type: String, trim: true },
  country:   { type: String, trim: true, default: 'Bangladesh' },
  zip:       { type: String, trim: true },
  // GeoJSON point — enables $near / $geoWithin queries when a valid [lng, lat]
  // pair is supplied. No point object is created unless coordinates are present.
  coordinates: { type: geoPointSchema, default: undefined },
  onlineUrl:       { type: String, trim: true },
  onlinePlatform:  { type: String, trim: true }, // e.g. "Zoom", "Google Meet"
  streamPassword:  { type: String, trim: true }, // optional stream password
}, { _id: false });

// ── SEO / Social Meta Sub-Schema ────────────────────────────────────────────
const seoSchema = new mongoose.Schema({
  metaTitle:       { type: String, trim: true, maxlength: 70 },
  metaDescription: { type: String, trim: true, maxlength: 160 },
  ogImage:         { type: String, trim: true },
  keywords:        [{ type: String, trim: true }],
  canonicalUrl:    { type: String, trim: true },
}, { _id: false });

// ── Refund Policy Sub-Schema ────────────────────────────────────────────────
const refundPolicySchema = new mongoose.Schema({
  // e.g. allow refunds up to N hours before the event starts
  allowRefunds:    { type: Boolean, default: true },
  cutoffHours:     { type: Number, default: 24, min: 0 },   // hours before startDate
  percentageBack:  { type: Number, default: 100, min: 0, max: 100 },
  notes:           { type: String, trim: true, maxlength: 1000 },
}, { _id: false });

// ── Agenda Item Sub-Schema ──────────────────────────────────────────────────
const agendaItemSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000 },
  startTime:   { type: Date, required: true },
  endTime:     { type: Date },
  speaker:     { type: String, trim: true },
  location:    { type: String, trim: true }, // e.g. "Hall A" for multi-track events
}, { _id: true });

// ── FAQ Item Sub-Schema ─────────────────────────────────────────────────────
const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true, maxlength: 500 },
  answer:   { type: String, required: true, trim: true, maxlength: 2000 },
}, { _id: true });

// ── Sponsor Sub-Schema ──────────────────────────────────────────────────────
const sponsorSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  logo:  { type: String, trim: true },
  url:   { type: String, trim: true },
  tier:  { type: String, enum: ['platinum', 'gold', 'silver', 'bronze', 'partner'], default: 'partner' },
}, { _id: true });

// ── Main Event Schema ───────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema({

  // ── Core identity ────────────────────────────────────────────────────────
  title:            { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
  slug:             { type: String, unique: true, lowercase: true, index: true },
  description:      {
    type: String,
    required() {
      return this.status !== EVENT_STATUS.DRAFT;
    },
    trim: true,
    maxlength: 10000,
  },
  shortDescription: { type: String, trim: true, maxlength: 500 },

  // ── Ownership ────────────────────────────────────────────────────────────
  organizer: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  organizerProfile: {         // denormalized Organizer profile ObjectId
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Organizer',
  },
  coOrganizers: [{            // other users who can manage this event
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  }],

  // ── Media ────────────────────────────────────────────────────────────────
  coverImage: { type: String, trim: true },
  images:     [{ type: String, trim: true }],
  videoUrl:   { type: String, trim: true },
  thumbnail:  { type: String, trim: true }, // auto-generated low-res preview

  // ── Taxonomy ─────────────────────────────────────────────────────────────
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category',    index: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  eventType:   { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' },
  tags:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],

  // ── Schedule ─────────────────────────────────────────────────────────────
  startDate:   {
    type: Date,
    required() {
      return this.status !== EVENT_STATUS.DRAFT;
    },
    index: true,
  },
  endDate:     {
    type: Date,
    required() {
      return this.status !== EVENT_STATUS.DRAFT;
    },
  },
  timezone:    { type: String, default: 'Asia/Dhaka' },
  doorsOpen:   { type: Date },    // when venue opens (before startDate)
  isRecurring: { type: Boolean, default: false },
  recurrence:  { type: recurrenceSchema },
  parentEvent: {                  // set on recurring child instances
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Event',
    index: true,
  },
  agenda: [agendaItemSchema],

  // ── Location ─────────────────────────────────────────────────────────────
  location: { type: locationSchema },

  // ── Tickets & Seats ───────────────────────────────────────────────────────
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  seats:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat'   }],

  // ── Pricing summary (denormalized from ticket types) ─────────────────────
  isFree:    { type: Boolean, default: false },
  minPrice:  { type: Number,  default: 0, min: 0 },
  maxPrice:  { type: Number,  default: 0, min: 0 },
  currency:  { type: String,  default: 'BDT' },

  // ── Capacity (denormalized totals) ───────────────────────────────────────
  totalCapacity:  { type: Number, min: 0 },
  totalSold:      { type: Number, default: 0, min: 0 },
  totalReserved:  { type: Number, default: 0, min: 0 }, // in-cart / pending

  // ── Status & visibility ──────────────────────────────────────────────────
  status: {
    type:    String,
    enum:    Object.values(EVENT_STATUS),
    default: EVENT_STATUS.DRAFT,
    index:   true,
  },
  visibility: {
    type:    String,
    enum:    Object.values(VISIBILITY),
    default: VISIBILITY.PUBLIC,
    index:   true,
  },
  ageRestriction: {
    type:    String,
    enum:    Object.values(AGE_RESTRICTION),
    default: AGE_RESTRICTION.ALL,
  },

  // ── Flags ────────────────────────────────────────────────────────────────
  isFeatured:     { type: Boolean, default: false, index: true },
  isTrending:     { type: Boolean, default: false, index: true },
  isVerified:     { type: Boolean, default: false },
  isSponsored:    { type: Boolean, default: false },
  requiresApproval: { type: Boolean, default: false }, // manual attendee approval

  // ── Admin audit ──────────────────────────────────────────────────────────
  rejectionReason: { type: String, trim: true },
  moderatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt:     { type: Date },

  // ── Lifecycle timestamps ─────────────────────────────────────────────────
  publishedAt:  { type: Date },
  cancelledAt:  { type: Date },
  postponedAt:  { type: Date },
  completedAt:  { type: Date },

  // ── Analytics (lightweight counters) ────────────────────────────────────
  viewCount:      { type: Number, default: 0, min: 0 },
  uniqueViewCount:{ type: Number, default: 0, min: 0 },
  likeCount:      { type: Number, default: 0, min: 0 },
  bookmarkCount:  { type: Number, default: 0, min: 0 },
  shareCount:     { type: Number, default: 0, min: 0 },
  reviewCount:    { type: Number, default: 0, min: 0 },
  averageRating:  { type: Number, default: 0, min: 0, max: 5 },
  trendScore:     { type: Number, default: 0, index: true }, // composite score for trending sort

  // ── Rich content ─────────────────────────────────────────────────────────
  faqs:     [faqItemSchema],
  sponsors: [sponsorSchema],

  // ── Policy ───────────────────────────────────────────────────────────────
  refundPolicy:   { type: refundPolicySchema },
  termsAndConditions: { type: String, trim: true, maxlength: 5000 },
  dressCode:      { type: String, trim: true, maxlength: 300 },
  accessibilityInfo: { type: String, trim: true, maxlength: 1000 },

  // ── SEO ──────────────────────────────────────────────────────────────────
  seo: { type: seoSchema },

  // ── Soft-delete ──────────────────────────────────────────────────────────
  deletedAt: { type: Date, default: null, index: true },

}, {
  timestamps: true,
  toJSON:  { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ─────────────────────────────────────────────────────────────────
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ endDate:   1, status: 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ isFeatured: 1, status: 1 });
eventSchema.index({ isTrending: 1, status: 1 });
eventSchema.index({ trendScore: -1, status: 1 });
eventSchema.index({ averageRating: -1, status: 1 });
eventSchema.index({ category: 1, startDate: 1, status: 1 });
eventSchema.index({ subcategory: 1, startDate: 1 });
eventSchema.index({ eventType:  1, startDate: 1 });
eventSchema.index({ 'location.city': 1, startDate: 1, status: 1 });
eventSchema.index({ parentEvent: 1 });
eventSchema.index({ visibility: 1, status: 1 });
eventSchema.index({ createdAt: -1 }); // "new arrivals" sort
// 2dsphere for geo-proximity queries ($near / $geoWithin)
// Index only documents that actually contain a valid GeoJSON point.
eventSchema.index(
  { 'location.coordinates': '2dsphere' },
  {
    partialFilterExpression: {
      'location.coordinates.type': 'Point',
      'location.coordinates.coordinates.0': { $exists: true },
      'location.coordinates.coordinates.1': { $exists: true },
    },
  },
);
// Full-text search
eventSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  'seo.keywords': 'text',
}, { weights: { title: 10, shortDescription: 5, description: 1, 'seo.keywords': 3 } });

// ── Slug auto-generation ────────────────────────────────────────────────────
eventSchema.pre('save', async function () {
  if (!this.isModified('title') && this.slug) return;
  let base = toSlug(this.title);
  let slug = base;
  let i = 1;
  while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
});


// Remove incomplete GeoJSON points before validation/save so regular physical
// events without map coordinates do not crash on the geo index.
eventSchema.pre('validate', function () {
  const point = this.location?.coordinates;
  const coords = point?.coordinates;
  const hasValidPair = Array.isArray(coords) && coords.length === 2 && coords.every(Number.isFinite);

  if (!hasValidPair) {
    if (this.location) {
      this.location.coordinates = undefined;
    }
    return;
  }

  if (!point.type) {
    this.location.coordinates.type = 'Point';
  }
});

// ── Auto-set lifecycle timestamps on status change ──────────────────────────
eventSchema.pre('save', function () {
  if (!this.isModified('status')) return;
  const now = new Date();
  if (this.status === EVENT_STATUS.PUBLISHED  && !this.publishedAt)  this.publishedAt  = now;
  if (this.status === EVENT_STATUS.CANCELLED  && !this.cancelledAt)  this.cancelledAt  = now;
  if (this.status === EVENT_STATUS.POSTPONED  && !this.postponedAt)  this.postponedAt  = now;
  if (this.status === EVENT_STATUS.COMPLETED  && !this.completedAt)  this.completedAt  = now;
});

// ── Virtuals ────────────────────────────────────────────────────────────────
eventSchema.virtual('isUpcoming').get(function () {
  return this.startDate > new Date();
});
eventSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});
eventSchema.virtual('isPast').get(function () {
  return this.endDate < new Date();
});
eventSchema.virtual('soldPercentage').get(function () {
  if (!this.totalCapacity) return 0;
  return Math.round((this.totalSold / this.totalCapacity) * 100);
});
eventSchema.virtual('spotsLeft').get(function () {
  if (!this.totalCapacity) return null;
  return Math.max(0, this.totalCapacity - this.totalSold - this.totalReserved);
});
eventSchema.virtual('isSoldOut').get(function () {
  const left = this.spotsLeft;
  return left !== null && left === 0;
});
eventSchema.virtual('priceLabel').get(function () {
  if (this.isFree) return 'Free';
  if (this.minPrice === this.maxPrice) return `${this.currency} ${this.minPrice}`;
  return `${this.currency} ${this.minPrice} – ${this.maxPrice}`;
});
// Duration in minutes
eventSchema.virtual('durationMinutes').get(function () {
  if (!this.startDate || !this.endDate) return null;
  return Math.round((this.endDate - this.startDate) / 60000);
});

// ── Instance methods ─────────────────────────────────────────────────────────
// Check if a user is a co-organizer or main organizer
eventSchema.methods.isManagedBy = function (userId) {
  const id = userId?.toString();
  return (
    this.organizer?.toString() === id ||
    this.coOrganizers?.some((u) => u.toString() === id)
  );
};

// ── Statics ──────────────────────────────────────────────────────────────────
eventSchema.statics.EVENT_STATUS    = EVENT_STATUS;
eventSchema.statics.VISIBILITY      = VISIBILITY;
eventSchema.statics.AGE_RESTRICTION = AGE_RESTRICTION;

// Base query for all live public events
eventSchema.statics.published = function () {
  return this.where({
    status:     EVENT_STATUS.PUBLISHED,
    visibility: VISIBILITY.PUBLIC,
    deletedAt:  null,
  });
};

// Upcoming published events sorted soonest-first
eventSchema.statics.upcoming = function () {
  return this.published()
    .where('startDate').gte(new Date())
    .sort({ startDate: 1 });
};

// Trending: sort by composite trendScore desc
eventSchema.statics.trending = function (limit = 20) {
  return this.published()
    .sort({ trendScore: -1 })
    .limit(limit);
};

// Events near a GeoJSON point  { lng, lat }  within radiusKm
eventSchema.statics.nearLocation = function (lng, lat, radiusKm = 30) {
  return this.published().where('location.coordinates').near({
    center: { type: 'Point', coordinates: [lng, lat] },
    maxDistance: radiusKm * 1000,
    spherical:   true,
  });
};

// ── Model ────────────────────────────────────────────────────────────────────
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
