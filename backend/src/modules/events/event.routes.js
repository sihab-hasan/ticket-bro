'use strict';

const express = require('express');
const router = express.Router();

const { authenticate, authorize, optionalAuth } = require('../../common/middleware/auth.middleware');
const { requireOrganizerAccess } = require('../../common/middleware/organizerAccess.middleware');
const { cache } = require('../../common/middleware/cache.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const { ROLES } = require('../../common/constants/roles');
const uploadMiddleware = require('../users/upload.middleware');
const {
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
  imageReactionSchema,
} = require('./event.validation');

// Lazy-load controller
let _ctrl;
const ctrl = () => { if (!_ctrl) _ctrl = require('./event.controller'); return _ctrl; };

// ════════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ════════════════════════════════════════════════════════════════════════════════
router.get('/',          validateRequest(eventListQuerySchema, 'query'), optionalAuth, cache('2m'),  (req, res, next) => ctrl().getEvents(req, res, next));
router.get('/featured',  validateRequest(eventListQuerySchema, 'query'), optionalAuth, cache('5m'),  (req, res, next) => ctrl().getFeaturedEvents(req, res, next));
router.get('/trending',  validateRequest(eventListQuerySchema, 'query'), optionalAuth, cache('5m'),  (req, res, next) => ctrl().getTrendingEvents(req, res, next));
router.get('/offers',    validateRequest(eventListQuerySchema, 'query'), optionalAuth, cache('5m'),  (req, res, next) => ctrl().getOfferEvents(req, res, next));
router.get('/upcoming',  validateRequest(eventListQuerySchema, 'query'), optionalAuth, cache('5m'),  (req, res, next) => ctrl().getUpcomingEvents(req, res, next));

// Admin-scoped read — must be before :slug to avoid route collision
router.get('/admin/all',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateRequest(eventListQuerySchema, 'query'),
  (req, res, next) => ctrl().adminGetAllEvents(req, res, next));

router.get('/:slug',            validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, cache('2m'),  (req, res, next) => ctrl().getEventBySlug(req, res, next));
router.get('/:slug/details',    validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, cache('1m'),  (req, res, next) => ctrl().getEventDetails(req, res, next));
router.get('/:slug/tickets',    validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, cache('1m'),  (req, res, next) => ctrl().getEventTickets(req, res, next));
router.get('/:slug/reviews',    validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, validateRequest(eventReviewQuerySchema, 'query'), cache('1m'),  (req, res, next) => ctrl().getEventReviews(req, res, next));
router.get('/:slug/related',    validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, validateRequest(relatedEventsQuerySchema, 'query'), cache('5m'),  (req, res, next) => ctrl().getRelatedEvents(req, res, next));
router.get('/:slug/ticket-types', validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, (req, res, next) => ctrl().getTicketTypes(req, res, next));
router.get('/:slug/seat-sections', validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, (req, res, next) => ctrl().getSeatSections(req, res, next));
router.get('/:slug/seat-map',   validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, cache('30s'), (req, res, next) => ctrl().getSeatMap(req, res, next));
router.post('/:slug/view',      validateRequest(eventSlugParamsSchema, 'params'), optionalAuth, (req, res, next) => ctrl().trackView(req, res, next));
router.post(
  '/:slug/images/reaction',
  authenticate,
  validateRequest(eventSlugParamsSchema, 'params'),
  validateRequest(imageReactionSchema),
  (req, res, next) => ctrl().toggleImageReaction(req, res, next),
);

// ════════════════════════════════════════════════════════════════════════════════
// ORGANIZER ROUTES
// ════════════════════════════════════════════════════════════════════════════════
const orgAuth = [authenticate, requireOrganizerAccess];

router.post('/',                          ...orgAuth, validateRequest(createEventSchema), (req, res, next) => ctrl().createEvent(req, res, next));
router.put('/:slug',                      ...orgAuth, validateRequest(eventSlugParamsSchema, 'params'), validateRequest(updateEventSchema), (req, res, next) => ctrl().updateEvent(req, res, next));
router.delete('/:slug',                   ...orgAuth, validateRequest(eventSlugParamsSchema, 'params'), (req, res, next) => ctrl().deleteEvent(req, res, next));
router.post('/:slug/publish',             ...orgAuth, validateRequest(eventSlugParamsSchema, 'params'), (req, res, next) => ctrl().publishEvent(req, res, next));
router.post('/:slug/cancel',              ...orgAuth, validateRequest(eventSlugParamsSchema, 'params'), (req, res, next) => ctrl().cancelEvent(req, res, next));
router.post('/:slug/ticket-types',        ...orgAuth, validateRequest(eventSlugParamsSchema, 'params'), validateRequest(createTicketTypeSchema), (req, res, next) => ctrl().createTicketType(req, res, next));
router.put('/:slug/ticket-types/:id',     ...orgAuth, validateRequest(eventSlugAndIdParamsSchema, 'params'), validateRequest(updateTicketTypeSchema), (req, res, next) => ctrl().updateTicketType(req, res, next));
router.delete('/:slug/ticket-types/:id',  ...orgAuth, validateRequest(eventSlugAndIdParamsSchema, 'params'), (req, res, next) => ctrl().deleteTicketType(req, res, next));
router.post('/:slug/seat-sections',       ...orgAuth, validateRequest(eventSlugParamsSchema, 'params'), validateRequest(createSeatSectionSchema), (req, res, next) => ctrl().createSeatSection(req, res, next));
router.put('/:slug/seat-sections/:id',    ...orgAuth, validateRequest(eventSlugAndIdParamsSchema, 'params'), validateRequest(updateSeatSectionSchema), (req, res, next) => ctrl().updateSeatSection(req, res, next));

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════════════════════════
const adminAuth = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.put('/:slug/approve', ...adminAuth, validateRequest(eventSlugParamsSchema, 'params'), (req, res, next) => ctrl().approveEvent(req, res, next));
router.put('/:slug/reject',  ...adminAuth, validateRequest(eventSlugParamsSchema, 'params'), validateRequest(rejectEventSchema), (req, res, next) => ctrl().rejectEvent(req, res, next));

// ════════════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD ROUTES  (Cloudinary)
// POST   /events/:slug/images/cover         → upload / replace cover image
// DELETE /events/:slug/images/cover         → remove cover image
// POST   /events/:slug/images/gallery       → add gallery images (up to 10)
// DELETE /events/:slug/images/gallery       → remove one gallery image (body: { url })
// ════════════════════════════════════════════════════════════════════════════════
router.post(
  '/:slug/images/cover',
  ...orgAuth,
  validateRequest(eventSlugParamsSchema, 'params'),
  uploadMiddleware.eventCover,
  (req, res, next) => ctrl().uploadCoverImage(req, res, next),
);
router.delete(
  '/:slug/images/cover',
  ...orgAuth,
  validateRequest(eventSlugParamsSchema, 'params'),
  (req, res, next) => ctrl().removeCoverImage(req, res, next),
);
router.post(
  '/:slug/images/gallery',
  ...orgAuth,
  validateRequest(eventSlugParamsSchema, 'params'),
  uploadMiddleware.eventGallery,
  (req, res, next) => ctrl().uploadGalleryImages(req, res, next),
);
router.delete(
  '/:slug/images/gallery',
  ...orgAuth,
  validateRequest(eventSlugParamsSchema, 'params'),
  (req, res, next) => ctrl().removeGalleryImage(req, res, next),
);
router.delete(
  '/:slug/images/gallery/batch',
  ...orgAuth,
  validateRequest(eventSlugParamsSchema, 'params'),
  validateRequest(galleryImagesDeleteSchema),
  (req, res, next) => ctrl().removeGalleryImages(req, res, next),
);
router.put(
  '/:slug/images/gallery',
  ...orgAuth,
  validateRequest(eventSlugParamsSchema, 'params'),
  validateRequest(galleryImagesOrderSchema),
  (req, res, next) => ctrl().reorderGalleryImages(req, res, next),
);

module.exports = router;
