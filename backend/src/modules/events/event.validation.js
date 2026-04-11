'use strict';

const Event = require('./event.model');
const { Joi, currencyCode, fileOrUrl, isoDate, objectId, optionalString, paginationFields, slug, trimmedString } = require('../../common/validations/common.validation');

const eventStatuses = Object.values(Event.EVENT_STATUS || {});
const eventVisibilities = Object.values(Event.VISIBILITY || {});
const ageRestrictions = Object.values(Event.AGE_RESTRICTION || {});
const ticketTypes = ['general', 'vip', 'early_bird', 'group', 'backstage', 'online'];

const geoPointSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array().items(Joi.number().min(-180).max(180)).length(2).required(),
});

const locationSchema = Joi.object({
  type: Joi.string().valid('online', 'physical', 'hybrid').optional(),
  name: optionalString(200),
  address: optionalString(300),
  city: optionalString(120),
  state: optionalString(120),
  country: optionalString(120),
  zip: optionalString(30),
  coordinates: geoPointSchema.optional(),
  onlineUrl: optionalString(2048),
  onlinePlatform: optionalString(120),
  streamPassword: optionalString(120),
});

const recurrenceSchema = Joi.object({
  frequency: Joi.string().valid('daily', 'weekly', 'biweekly', 'monthly').required(),
  interval: Joi.number().integer().min(1).default(1),
  daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).unique().optional(),
  endDate: isoDate.optional(),
  maxOccurrences: Joi.number().integer().min(1).optional(),
});

const agendaItemSchema = Joi.object({
  title: trimmedString(1, 200).required(),
  description: optionalString(1000),
  startTime: isoDate.required(),
  endTime: isoDate.optional(),
  speaker: optionalString(150),
  location: optionalString(150),
}).custom((value, helpers) => {
  if (value.endTime && new Date(value.endTime) <= new Date(value.startTime)) {
    return helpers.message('Agenda item endTime must be after startTime.');
  }

  return value;
});

const faqItemSchema = Joi.object({
  question: trimmedString(1, 500).required(),
  answer: trimmedString(1, 2000).required(),
});

const sponsorSchema = Joi.object({
  name: trimmedString(1, 200).required(),
  logo: fileOrUrl.optional(),
  url: optionalString(2048),
  tier: Joi.string().valid('platinum', 'gold', 'silver', 'bronze', 'partner').optional(),
});

const refundPolicySchema = Joi.object({
  allowRefunds: Joi.boolean().optional(),
  cutoffHours: Joi.number().integer().min(0).optional(),
  percentageBack: Joi.number().min(0).max(100).optional(),
  notes: optionalString(1000),
});

const seoSchema = Joi.object({
  metaTitle: optionalString(70),
  metaDescription: optionalString(160),
  ogImage: fileOrUrl.optional(),
  keywords: Joi.array().items(trimmedString(1, 100)).max(20).optional(),
  canonicalUrl: optionalString(2048),
});

const eventBodyFields = {
  title: trimmedString(3, 200),
  description: trimmedString(3, 10000),
  shortDescription: optionalString(500),
  videoUrl: optionalString(2048),
  thumbnail: fileOrUrl.optional(),
  category: objectId.optional(),
  subcategory: objectId.optional(),
  eventType: objectId.optional(),
  tags: Joi.array().items(objectId).unique().max(30).optional(),
  startDate: isoDate,
  endDate: isoDate,
  timezone: optionalString(100),
  doorsOpen: isoDate.optional(),
  isRecurring: Joi.boolean().optional(),
  recurrence: recurrenceSchema.optional(),
  parentEvent: objectId.optional(),
  agenda: Joi.array().items(agendaItemSchema).max(50).optional(),
  location: locationSchema.optional(),
  coOrganizers: Joi.array().items(objectId).unique().max(20).optional(),
  isFree: Joi.boolean().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  currency: currencyCode.optional(),
  totalCapacity: Joi.number().integer().min(0).optional(),
  totalSold: Joi.number().integer().min(0).optional(),
  totalReserved: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid(...eventStatuses).optional(),
  visibility: Joi.string().valid(...eventVisibilities).optional(),
  ageRestriction: Joi.string().valid(...ageRestrictions).optional(),
  isFeatured: Joi.boolean().optional(),
  isTrending: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
  isSponsored: Joi.boolean().optional(),
  requiresApproval: Joi.boolean().optional(),
  rejectionReason: optionalString(1000),
  termsAndConditions: optionalString(5000),
  dressCode: optionalString(300),
  accessibilityInfo: optionalString(1000),
  refundPolicy: refundPolicySchema.optional(),
  faqs: Joi.array().items(faqItemSchema).max(50).optional(),
  sponsors: Joi.array().items(sponsorSchema).max(20).optional(),
  seo: seoSchema.optional(),
};

const validateEventChronology = (value, helpers) => {
  if (value.startDate && value.endDate && new Date(value.endDate) <= new Date(value.startDate)) {
    return helpers.message('Event endDate must be after startDate.');
  }

  if (value.doorsOpen && value.startDate && new Date(value.doorsOpen) > new Date(value.startDate)) {
    return helpers.message('doorsOpen cannot be after startDate.');
  }

  if (value.isRecurring && !value.recurrence) {
    return helpers.message('recurrence is required when isRecurring is true.');
  }

  if (
    value.isRecurring
    && ['weekly', 'biweekly'].includes(value.recurrence?.frequency)
    && (!value.recurrence?.daysOfWeek || !value.recurrence.daysOfWeek.length)
  ) {
    return helpers.message('recurrence.daysOfWeek is required for weekly and biweekly events.');
  }

  const reviewLikeStatus = value.status && value.status !== 'draft';
  const locationType = value.location?.type || 'physical';

  if (reviewLikeStatus && ['physical', 'hybrid'].includes(locationType) && !value.location?.name?.trim()) {
    return helpers.message('Venue name is required for physical or hybrid events.');
  }

  if (reviewLikeStatus && ['online', 'hybrid'].includes(locationType) && !value.location?.onlineUrl?.trim()) {
    return helpers.message('onlineUrl is required for online or hybrid events.');
  }

  return value;
};

const validateCreateEventState = (value, helpers) => {
  const reviewLikeStatus = value.status && value.status !== 'draft';
  const missing = [];

  if (reviewLikeStatus && !value.title?.trim()) missing.push('title');
  if (reviewLikeStatus && !value.description?.trim()) missing.push('description');
  if (reviewLikeStatus && !value.category) missing.push('category');
  if (reviewLikeStatus && !value.startDate) missing.push('startDate');
  if (reviewLikeStatus && !value.endDate) missing.push('endDate');

  if (missing.length) {
    return helpers.message(`Complete these fields before review or publish: ${missing.join(', ')}.`);
  }

  return validateEventChronology(value, helpers);
};

const createEventSchema = Joi.object(eventBodyFields)
  .fork(['title'], (schema) => schema.required())
  .custom(validateCreateEventState);

const updateEventSchema = Joi.object(eventBodyFields)
  .min(1)
  .custom(validateEventChronology);

const eventListQuerySchema = Joi.object({
  ...paginationFields,
  category: objectId.optional(),
  organizer: objectId.optional(),
  city: optionalString(120),
  country: optionalString(120),
  status: Joi.string().valid(...eventStatuses).optional(),
  visibility: Joi.string().valid(...eventVisibilities).optional(),
  isFeatured: Joi.boolean().optional(),
  isTrending: Joi.boolean().optional(),
  isFree: Joi.boolean().optional(),
  search: optionalString(150),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
});

const relatedEventsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).default(6),
});

const eventReviewQuerySchema = Joi.object({
  ...paginationFields,
  sort: Joi.string()
    .valid('-createdAt', 'createdAt', '-rating', 'rating')
    .default('-createdAt'),
  search: optionalString(200),
});

const eventSlugParamsSchema = Joi.object({
  slug: slug.required(),
});

const eventSlugAndIdParamsSchema = Joi.object({
  slug: slug.required(),
  id: objectId.required(),
});

const ticketTypeBodyFields = {
  name: trimmedString(1, 100),
  description: optionalString(500),
  type: Joi.string().valid(...ticketTypes).optional(),
  price: Joi.number().min(0).optional(),
  quantity: Joi.number().integer().min(0).optional(),
  sold: Joi.number().integer().min(0).optional(),
  reserved: Joi.number().integer().min(0).optional(),
  maxPerOrder: Joi.number().integer().min(1).optional(),
  minPerOrder: Joi.number().integer().min(1).optional(),
  salesStart: isoDate.optional(),
  salesEnd: isoDate.optional(),
  isActive: Joi.boolean().optional(),
  benefits: Joi.array().items(trimmedString(1, 150)).max(20).optional(),
  color: optionalString(50),
  sortOrder: Joi.number().integer().min(0).optional(),
};

const validateTicketTypePayload = (value, helpers) => {
  if (value.salesStart && value.salesEnd && new Date(value.salesEnd) <= new Date(value.salesStart)) {
    return helpers.message('Ticket type salesEnd must be after salesStart.');
  }

  if (value.minPerOrder && value.maxPerOrder && value.minPerOrder > value.maxPerOrder) {
    return helpers.message('minPerOrder cannot be greater than maxPerOrder.');
  }

  if (value.quantity !== undefined && value.sold !== undefined && value.sold > value.quantity) {
    return helpers.message('sold cannot be greater than quantity.');
  }

  if (value.quantity !== undefined && value.reserved !== undefined && value.reserved > value.quantity) {
    return helpers.message('reserved cannot be greater than quantity.');
  }

  return value;
};

const createTicketTypeSchema = Joi.object(ticketTypeBodyFields)
  .fork(['name', 'price', 'quantity'], (schema) => schema.required())
  .custom(validateTicketTypePayload);

const updateTicketTypeSchema = Joi.object(ticketTypeBodyFields)
  .min(1)
  .custom(validateTicketTypePayload);

const seatSectionBodyFields = {
  name: trimmedString(1, 100),
  capacity: Joi.number().integer().min(1),
  color: Joi.string().trim().max(50).optional(),
};

const createSeatSectionSchema = Joi.object(seatSectionBodyFields).fork(['name', 'capacity'], (schema) => schema.required());
const updateSeatSectionSchema = Joi.object(seatSectionBodyFields).min(1);

const rejectEventSchema = Joi.object({
  reason: optionalString(1000),
});

const galleryImagesDeleteSchema = Joi.object({
  urls: Joi.array().items(fileOrUrl.required()).min(1).max(10).unique().required(),
});

const galleryImagesOrderSchema = Joi.object({
  images: Joi.array().items(fileOrUrl.required()).max(10).unique().required(),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventListQuerySchema,
  relatedEventsQuerySchema,
  eventReviewQuerySchema,
  eventSlugParamsSchema,
  eventSlugAndIdParamsSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
  createSeatSectionSchema,
  updateSeatSectionSchema,
  rejectEventSchema,
  galleryImagesDeleteSchema,
  galleryImagesOrderSchema,
};
