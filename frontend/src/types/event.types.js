/**
 * event.types.js
 * ─────────────────────────────────────────────────────────────────────────────
 * JSDoc type definitions that EXACTLY mirror the Mongoose event.model.js.
 * No runtime overhead — constants + a single normaliseEvent() helper.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Enums (mirror event.model.js) ──────────────────────────────────────────
export const EVENT_STATUS = Object.freeze({
  DRAFT:     'draft',
  PENDING:   'pending',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
  COMPLETED: 'completed',
  REJECTED:  'rejected',
});

export const VISIBILITY = Object.freeze({
  PUBLIC:   'public',
  PRIVATE:  'private',
  UNLISTED: 'unlisted',
});

export const AGE_RESTRICTION = Object.freeze({
  ALL:   'all',
  TEEN:  'teen',   // 13+
  ADULT: 'adult',  // 18+
});

export const SPONSOR_TIER = Object.freeze({
  PLATINUM: 'platinum',
  GOLD: 'gold',
  SILVER: 'silver',
  BRONZE: 'bronze',
  PARTNER: 'partner',
});

export const RECURRENCE_FREQUENCY = Object.freeze({
  DAILY: 'daily', WEEKLY: 'weekly', BIWEEKLY: 'biweekly', MONTHLY: 'monthly',
});

export const LOCATION_TYPE = Object.freeze({
  ONLINE: 'online', PHYSICAL: 'physical', HYBRID: 'hybrid',
});

// ── Label / colour maps ────────────────────────────────────────────────────
export const EVENT_STATUS_LABEL = {
  [EVENT_STATUS.DRAFT]:     'Draft',
  [EVENT_STATUS.PENDING]:   'Pending Review',
  [EVENT_STATUS.PUBLISHED]: 'Published',
  [EVENT_STATUS.CANCELLED]: 'Cancelled',
  [EVENT_STATUS.POSTPONED]: 'Postponed',
  [EVENT_STATUS.COMPLETED]: 'Completed',
  [EVENT_STATUS.REJECTED]:  'Rejected',
};

export const EVENT_STATUS_COLOR = {
  [EVENT_STATUS.DRAFT]:     'secondary',
  [EVENT_STATUS.PENDING]:   'warning',
  [EVENT_STATUS.PUBLISHED]: 'success',
  [EVENT_STATUS.CANCELLED]: 'destructive',
  [EVENT_STATUS.POSTPONED]: 'warning',
  [EVENT_STATUS.COMPLETED]: 'muted',
  [EVENT_STATUS.REJECTED]:  'destructive',
};

export const VISIBILITY_LABEL = {
  [VISIBILITY.PUBLIC]:   'Public',
  [VISIBILITY.PRIVATE]:  'Private',
  [VISIBILITY.UNLISTED]: 'Unlisted',
};

export const AGE_RESTRICTION_LABEL = {
  [AGE_RESTRICTION.ALL]:   'All Ages',
  [AGE_RESTRICTION.TEEN]:  '13+ Only',
  [AGE_RESTRICTION.ADULT]: '18+ Only',
};

export const LOCATION_TYPE_LABEL = {
  [LOCATION_TYPE.ONLINE]:   'Online',
  [LOCATION_TYPE.PHYSICAL]: 'In Person',
  [LOCATION_TYPE.HYBRID]:   'Hybrid',
};

// ── canPurchase guard ──────────────────────────────────────────────────────
export const canPurchase = (event) =>
  event?.status === EVENT_STATUS.PUBLISHED &&
  event?.visibility !== VISIBILITY.PRIVATE &&
  !event?.isSoldOut &&
  event?.isUpcoming !== false;

const buildOrganizerName = (organizer = {}) =>
  organizer.displayName ||
  organizer.organizationName ||
  organizer.name ||
  organizer.fullName ||
  [organizer.firstName, organizer.lastName].filter(Boolean).join(' ').trim();

const normaliseOrganizer = (organizer, organizerProfile) => {
  if (!organizer && !organizerProfile) {
    return null;
  }

  const verificationStatus =
    organizerProfile?.verificationStatus ||
    organizer?.verificationStatus ||
    (organizer?.isVerified ? 'verified' : 'unverified');
  const userId =
    organizer?._id ||
    organizer?.id ||
    organizerProfile?.user?._id ||
    organizerProfile?.user ||
    null;

  return {
    ...(organizer || {}),
    ...(organizerProfile || {}),
    _id: organizerProfile?._id || organizer?._id || null,
    id: organizerProfile?.id || organizer?.id || organizerProfile?._id || organizer?._id || null,
    userId,
    name: buildOrganizerName(organizerProfile) || buildOrganizerName(organizer) || 'Organizer',
    displayName:
      organizerProfile?.displayName ||
      organizer?.displayName ||
      buildOrganizerName(organizerProfile) ||
      buildOrganizerName(organizer) ||
      'Organizer',
    slug: organizerProfile?.slug || organizer?.slug || null,
    avatar: organizerProfile?.logo || organizerProfile?.avatar || organizer?.avatar || null,
    verificationStatus,
    isVerified: verificationStatus === 'verified' || Boolean(organizer?.isVerified),
  };
};

// ── normaliseEvent ─────────────────────────────────────────────────────────
/**
 * Transforms a raw API document into the normalised frontend shape.
 * Maps every field from event.model.js to a display-ready object.
 *
 * @param {Object|null} raw  - document returned by GET /api/events/:slug
 * @returns {Object|null}
 */
export const normaliseEvent = (raw) => {
  if (!raw) return null;

  // location sub-document
  const loc  = raw.location || {};
  const coords = loc.coordinates?.coordinates; // [lng, lat]
  const latLng = Array.isArray(coords) && coords.length === 2
    ? { lat: coords[1], lng: coords[0] }
    : null;
  const addressLabel = [loc.name, loc.address, loc.city, loc.state, loc.country]
    .filter(Boolean).join(', ');

  // pricing
  const currency  = raw.currency || 'BDT';
  const priceLabel = raw.isFree
    ? 'Free'
    : raw.minPrice === raw.maxPrice
      ? `${currency} ${raw.minPrice}`
      : `${currency} ${raw.minPrice} – ${raw.maxPrice}`;

  // capacity / spots
  const totalSold     = raw.totalSold     || 0;
  const totalReserved = raw.totalReserved || 0;
  const spotsLeft = raw.spotsLeft != null
    ? raw.spotsLeft
    : raw.totalCapacity != null
      ? Math.max(0, raw.totalCapacity - totalSold - totalReserved)
      : null;
  const soldPercentage = raw.soldPercentage != null
    ? raw.soldPercentage
    : raw.totalCapacity
      ? Math.round((totalSold / raw.totalCapacity) * 100)
      : 0;

  // dates
  const startDate = raw.startDate ? new Date(raw.startDate) : null;
  const endDate   = raw.endDate   ? new Date(raw.endDate)   : null;
  const now       = new Date();
  const isUpcoming = startDate ? startDate > now : false;
  const isOngoing  = startDate && endDate ? startDate <= now && endDate >= now : false;
  const isPast     = endDate ? endDate < now : false;
  const durationMinutes = startDate && endDate
    ? Math.round((endDate - startDate) / 60000)
    : null;
  const normalizedOrganizer = normaliseOrganizer(raw.organizer, raw.organizerProfile);

  return {
    // identity
    _id:              raw._id,
    id:               raw._id,
    slug:             raw.slug,
    title:            raw.title,
    description:      raw.description,
    shortDescription: raw.shortDescription || '',

    // ownership
    organizer:        normalizedOrganizer,
    organizerProfile: normalizedOrganizer,
    coOrganizers:     raw.coOrganizers || [],

    // media
    coverImage: raw.coverImage || raw.images?.[0] || null,
    images:     raw.images     || [],
    videoUrl:   raw.videoUrl   || null,
    thumbnail:  raw.thumbnail  || raw.coverImage || null,

    // taxonomy (populated → { _id, name, slug })
    category:    raw.category    || null,
    subcategory: raw.subcategory || null,
    eventType:   raw.eventType   || null,
    tags:        raw.tags        || [],

    // schedule
    startDate,
    endDate,
    timezone:       raw.timezone    || 'Asia/Dhaka',
    doorsOpen:      raw.doorsOpen   ? new Date(raw.doorsOpen) : null,
    isRecurring:    raw.isRecurring || false,
    recurrence:     raw.recurrence  || null,
    parentEvent:    raw.parentEvent || null,
    agenda:         raw.agenda      || [],
    durationMinutes,

    // location (normalised sub-doc)
    location: {
      type:           loc.type          || LOCATION_TYPE.PHYSICAL,
      typeLabel:      LOCATION_TYPE_LABEL[loc.type] || 'In Person',
      name:           loc.name          || '',
      address:        loc.address       || '',
      city:           loc.city          || '',
      state:          loc.state         || '',
      country:        loc.country       || 'Bangladesh',
      zip:            loc.zip           || '',
      addressLabel,
      isOnline:       loc.type === LOCATION_TYPE.ONLINE,
      isHybrid:       loc.type === LOCATION_TYPE.HYBRID,
      latLng,
      onlineUrl:      loc.onlineUrl      || null,
      onlinePlatform: loc.onlinePlatform || null,
      streamPassword: loc.streamPassword || null,
    },

    // pricing
    isFree:    raw.isFree    || false,
    minPrice:  raw.minPrice  || 0,
    maxPrice:  raw.maxPrice  || 0,
    currency,
    priceLabel,

    // capacity
    totalCapacity: raw.totalCapacity || null,
    totalSold,
    totalReserved,
    spotsLeft,
    soldPercentage,
    isSoldOut:  spotsLeft !== null && spotsLeft === 0,

    // status & visibility
    status:          raw.status         || EVENT_STATUS.DRAFT,
    statusLabel:     EVENT_STATUS_LABEL[raw.status] || raw.status || '',
    statusColor:     EVENT_STATUS_COLOR[raw.status] || 'secondary',
    visibility:      raw.visibility     || VISIBILITY.PUBLIC,
    visibilityLabel: VISIBILITY_LABEL[raw.visibility] || '',
    ageRestriction:  raw.ageRestriction || AGE_RESTRICTION.ALL,
    ageLabel:        AGE_RESTRICTION_LABEL[raw.ageRestriction] || 'All Ages',

    // flags
    isFeatured:       raw.isFeatured       || false,
    isTrending:       raw.isTrending       || false,
    isVerified:       raw.isVerified       || false,
    isSponsored:      raw.isSponsored      || false,
    requiresApproval: raw.requiresApproval || false,

    // admin audit
    rejectionReason: raw.rejectionReason || null,
    moderatedBy:     raw.moderatedBy     || null,
    moderatedAt:     raw.moderatedAt     ? new Date(raw.moderatedAt) : null,

    // virtuals / computed
    isUpcoming,
    isOngoing,
    isPast,

    // analytics
    viewCount:     raw.viewCount     || 0,
    uniqueViewCount: raw.uniqueViewCount || 0,
    likeCount:     raw.likeCount     || 0,
    bookmarkCount: raw.bookmarkCount || 0,
    shareCount:    raw.shareCount    || 0,
    reviewCount:   raw.reviewCount   || 0,
    averageRating: raw.averageRating || 0,
    trendScore:    raw.trendScore    || 0,

    // rich content
    faqs:     raw.faqs     || [],
    sponsors: raw.sponsors || [],

    // policies
    refundPolicy:       raw.refundPolicy       || null,
    termsAndConditions: raw.termsAndConditions || null,
    dressCode:          raw.dressCode          || null,
    accessibilityInfo:  raw.accessibilityInfo  || null,

    // seo
    seo: raw.seo || null,

    // timestamps
    createdAt:   raw.createdAt   ? new Date(raw.createdAt)   : null,
    updatedAt:   raw.updatedAt   ? new Date(raw.updatedAt)   : null,
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : null,
    cancelledAt: raw.cancelledAt ? new Date(raw.cancelledAt) : null,

    // UI guards
    canPurchase: raw.status === EVENT_STATUS.PUBLISHED && isUpcoming && spotsLeft !== 0,
    canReview:   isPast,
    canCancel:   [EVENT_STATUS.DRAFT, EVENT_STATUS.PENDING, EVENT_STATUS.PUBLISHED].includes(raw.status),
  };
};
