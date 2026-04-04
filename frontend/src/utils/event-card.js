export const getEventIdentity = (event = {}) =>
  event?.id || event?._id || event?.slug || "";

export const getEventUrl = (event = {}) => {
  const slug = event?.slug || event?._id || event?.id;
  if (!slug) return "/browse";

  const categorySlug = event?.category?.slug || event?.categorySlug;
  const subcategorySlug = event?.subcategory?.slug || event?.subCategorySlug;
  const eventTypeSlug = event?.eventType?.slug || event?.eventTypeSlug;

  if (categorySlug && subcategorySlug && eventTypeSlug) {
    return `/${categorySlug}/${subcategorySlug}/${eventTypeSlug}/${slug}`;
  }

  return `/events/${slug}`;
};

export const getEventImage = (event = {}) =>
  event?.coverImage ||
  (Array.isArray(event?.images) ? event.images.find(Boolean) : null) ||
  event?.image ||
  event?.thumbnail ||
  "";

export const getEventLocationLabel = (event = {}) => {
  const location = event?.location || event?.venue || {};

  if (location?.type === 'online' || event?.isOnline) return 'Online event';
  if (location?.type === 'hybrid') return 'Hybrid event';

  return (
    location?.name ||
    location?.venue ||
    location?.city ||
    event?.city ||
    event?.venue ||
    'Venue TBA'
  );
};

export const getEventPriceLabel = (event = {}) => {
  if (event?.priceLabel) return event.priceLabel;
  if (event?.isFree || Number(event?.lowestPrice) === 0) return 'Free';

  const currency = event?.currency || 'BDT';
  const candidates = [event?.minPrice, event?.lowestPrice, event?.price]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!candidates.length) return 'See prices';

  const min = Math.min(...candidates);
  if (currency === 'BDT') {
    return `Taka ${min.toLocaleString()}`;
  }

  return `${currency} ${min.toLocaleString()}`;
};

export const getEventTags = (event = {}, max) => {
  const tags = Array.isArray(event?.tags) ? event.tags : [];
  const normalized = tags
    .map((tag) => {
      if (!tag) return null;
      if (typeof tag === 'string') {
        return { _id: tag, name: tag };
      }
      return {
        _id: tag._id || tag.id || tag.slug || tag.name,
        name: tag.name || tag.label || tag.slug,
      };
    })
    .filter((tag) => tag?.name);

  return typeof max === 'number' ? normalized.slice(0, max) : normalized;
};

export const getEventSpotsLeft = (event = {}) => {
  if (typeof event?.spotsLeft === 'number') return event.spotsLeft;

  const totalCapacity = Number(event?.totalCapacity || event?.capacity || 0);
  const totalSold = Number(event?.totalSold || event?.attendees || 0);
  const totalReserved = Number(event?.totalReserved || 0);

  if (!totalCapacity) return null;
  return Math.max(0, totalCapacity - totalSold - totalReserved);
};

export const isEventSoldOut = (event = {}) => {
  if (typeof event?.isSoldOut === 'boolean') return event.isSoldOut;
  const spotsLeft = getEventSpotsLeft(event);
  return spotsLeft === 0 && Number(event?.totalCapacity || event?.capacity || 0) > 0;
};
