export const LOCATION_TYPES = ["physical", "online", "hybrid"];
export const VISIBILITY_OPTIONS = ["public", "unlisted", "private"];
export const TICKET_TYPES = [
  "general",
  "vip",
  "early_bird",
  "group",
  "backstage",
  "online",
];

export const EMPTY_TICKET = {
  name: "",
  price: "",
  quantity: "",
  description: "",
  type: "general",
  salesStart: "",
  salesEnd: "",
  minPerOrder: "",
  maxPerOrder: "",
  benefitsText: "",
};

export const splitTextList = (value) =>
  String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const toDateInput = (value) => (value ? String(value).split("T")[0] : "");
export const toTimeInput = (value) =>
  value ? String(value).split("T")[1]?.slice(0, 5) || "" : "";
export const toDateTimeLocalInput = (value) =>
  value ? String(value).replace("Z", "").slice(0, 16) : "";

export const buildDateTime = (date, time, fallback = "00:00") =>
  date ? `${date}T${time || fallback}:00` : undefined;

export const buildLocalDateTime = (value) => (value ? `${value}:00` : undefined);

export const getDefaultEventForm = () => ({
  title: "",
  shortDescription: "",
  description: "",
  category: "",
  subcategory: "",
  visibility: "public",
  locationType: "physical",
  ageRestriction: "all",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  timezone: "Asia/Dhaka",
  doorsOpenDate: "",
  doorsOpenTime: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  venueState: "",
  venueCountry: "Bangladesh",
  venueZip: "",
  venueLat: "",
  venueLng: "",
  onlineLink: "",
  onlinePlatform: "",
  streamPassword: "",
  requiresApproval: false,
  accessibilityInfo: "",
  dressCode: "",
  isFree: false,
  currency: "BDT",
  tickets: [],
  coverImage: "",
  galleryImagesText: "",
  videoUrl: "",
  hasRefundPolicy: false,
  allowRefunds: true,
  refundCutoffHours: "24",
  refundPercentageBack: "100",
  refundNotes: "",
  termsAndConditions: "",
  seoMetaTitle: "",
  seoMetaDescription: "",
  seoKeywordsText: "",
  seoCanonicalUrl: "",
  seoOgImage: "",
});

const mapTicketToForm = (ticket = {}) => ({
  ...EMPTY_TICKET,
  name: ticket.name || "",
  price:
    ticket.price === 0 || ticket.price
      ? String(ticket.price)
      : "",
  quantity:
    ticket.quantity === 0 || ticket.quantity
      ? String(ticket.quantity)
      : "",
  description: ticket.description || "",
  type: ticket.type || "general",
  salesStart: toDateTimeLocalInput(ticket.salesStart),
  salesEnd: toDateTimeLocalInput(ticket.salesEnd),
  minPerOrder:
    ticket.minPerOrder === 0 || ticket.minPerOrder
      ? String(ticket.minPerOrder)
      : "",
  maxPerOrder:
    ticket.maxPerOrder === 0 || ticket.maxPerOrder
      ? String(ticket.maxPerOrder)
      : "",
  benefitsText: Array.isArray(ticket.benefits)
    ? ticket.benefits.join("\n")
    : Array.isArray(ticket.perks)
      ? ticket.perks.join("\n")
      : "",
});

export const mapEventToForm = (event = {}, ticketTypes = []) => {
  const defaults = getDefaultEventForm();
  const coordinates = event?.location?.coordinates?.coordinates || [];
  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  return {
    ...defaults,
    title: event?.title || "",
    shortDescription: event?.shortDescription || "",
    description: event?.description || "",
    category: event?.category?._id || event?.category || "",
    subcategory: event?.subcategory?._id || event?.subcategory || "",
    visibility: event?.visibility || defaults.visibility,
    locationType: event?.location?.type || defaults.locationType,
    ageRestriction: event?.ageRestriction || defaults.ageRestriction,
    startDate: toDateInput(event?.startDate),
    startTime: toTimeInput(event?.startDate),
    endDate: toDateInput(event?.endDate),
    endTime: toTimeInput(event?.endDate),
    timezone: event?.timezone || defaults.timezone,
    doorsOpenDate: toDateInput(event?.doorsOpen),
    doorsOpenTime: toTimeInput(event?.doorsOpen),
    venueName: event?.location?.name || "",
    venueAddress: event?.location?.address || "",
    venueCity: event?.location?.city || "",
    venueState: event?.location?.state || "",
    venueCountry: event?.location?.country || defaults.venueCountry,
    venueZip: event?.location?.zip || "",
    venueLat: Number.isFinite(lat) ? String(lat) : "",
    venueLng: Number.isFinite(lng) ? String(lng) : "",
    onlineLink: event?.location?.onlineUrl || "",
    onlinePlatform: event?.location?.onlinePlatform || "",
    streamPassword: event?.location?.streamPassword || "",
    requiresApproval: Boolean(event?.requiresApproval),
    accessibilityInfo: event?.accessibilityInfo || "",
    dressCode: event?.dressCode || "",
    isFree: Boolean(event?.isFree),
    currency: event?.currency || defaults.currency,
    tickets: Array.isArray(ticketTypes) ? ticketTypes.map(mapTicketToForm) : [],
    coverImage: event?.coverImage || "",
    galleryImagesText: Array.isArray(event?.images)
      ? event.images.filter(Boolean).join("\n")
      : "",
    videoUrl: event?.videoUrl || "",
    hasRefundPolicy: Boolean(event?.refundPolicy),
    allowRefunds: event?.refundPolicy?.allowRefunds ?? true,
    refundCutoffHours:
      event?.refundPolicy?.cutoffHours === 0 || event?.refundPolicy?.cutoffHours
        ? String(event.refundPolicy.cutoffHours)
        : defaults.refundCutoffHours,
    refundPercentageBack:
      event?.refundPolicy?.percentageBack === 0 || event?.refundPolicy?.percentageBack
        ? String(event.refundPolicy.percentageBack)
        : defaults.refundPercentageBack,
    refundNotes: event?.refundPolicy?.notes || "",
    termsAndConditions: event?.termsAndConditions || "",
    seoMetaTitle: event?.seo?.metaTitle || "",
    seoMetaDescription: event?.seo?.metaDescription || "",
    seoKeywordsText: Array.isArray(event?.seo?.keywords)
      ? event.seo.keywords.join(", ")
      : "",
    seoCanonicalUrl: event?.seo?.canonicalUrl || "",
    seoOgImage: event?.seo?.ogImage || "",
  };
};

export const createReviewErrors = (form, { requireTickets = true } = {}) => {
  const errors = {};

  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.shortDescription.trim()) {
    errors.shortDescription = "Short description is required";
  }
  if (!form.category) errors.category = "Category is required";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.startDate) errors.startDate = "Start date is required";
  if (!form.startTime) errors.startTime = "Start time is required";
  if (!form.endDate) errors.endDate = "End date is required";
  if (!form.endTime) errors.endTime = "End time is required";
  if (["physical", "hybrid"].includes(form.locationType) && !form.venueName.trim()) {
    errors.venueName = "Venue name is required";
  }
  if (["online", "hybrid"].includes(form.locationType) && !form.onlineLink.trim()) {
    errors.onlineLink = "Online event link is required";
  }
  if (
    (form.doorsOpenDate && !form.doorsOpenTime) ||
    (!form.doorsOpenDate && form.doorsOpenTime)
  ) {
    errors.doorsOpenTime = "Doors open date and time must both be set";
  }

  if (requireTickets && !form.tickets.length) {
    errors.tickets = "At least one ticket type is required";
  } else if (
    requireTickets &&
    form.tickets.some((ticket) => !ticket.name.trim() || !ticket.quantity)
  ) {
    errors.tickets = "Each ticket needs a name and quantity";
  } else if (
    requireTickets &&
    !form.isFree &&
    form.tickets.some((ticket) => ticket.price === "")
  ) {
    errors.tickets = "Each paid ticket needs a price";
  } else if (
    requireTickets &&
    form.tickets.some(
      (ticket) =>
        ticket.minPerOrder &&
        ticket.maxPerOrder &&
        Number.parseInt(ticket.minPerOrder, 10) >
          Number.parseInt(ticket.maxPerOrder, 10),
    )
  ) {
    errors.tickets =
      "Ticket minimum per order cannot be greater than the maximum";
  } else if (
    requireTickets &&
    form.tickets.some(
      (ticket) =>
        ticket.salesStart &&
        ticket.salesEnd &&
        new Date(`${ticket.salesEnd}:00`) <=
          new Date(`${ticket.salesStart}:00`),
    )
  ) {
    errors.tickets = "Ticket sales end must be after sales start";
  }

  if (
    form.startDate &&
    form.startTime &&
    form.endDate &&
    form.endTime &&
    new Date(`${form.endDate}T${form.endTime}:00`) <=
      new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.endTime = "End date/time must be after start date/time";
  }

  if (
    form.doorsOpenDate &&
    form.doorsOpenTime &&
    form.startDate &&
    form.startTime &&
    new Date(`${form.doorsOpenDate}T${form.doorsOpenTime}:00`) >
      new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.doorsOpenTime = "Doors open must be before the event starts";
  }

  return errors;
};

export const createDraftErrors = (form) => {
  const errors = {};

  if (!form.title.trim()) errors.title = "Title is required to save a draft";

  if ((form.startDate && !form.startTime) || (!form.startDate && form.startTime)) {
    errors.startTime = "Start date and time must both be set";
  }

  if ((form.endDate && !form.endTime) || (!form.endDate && form.endTime)) {
    errors.endTime = "End date and time must both be set";
  }

  if (
    (form.doorsOpenDate && !form.doorsOpenTime) ||
    (!form.doorsOpenDate && form.doorsOpenTime)
  ) {
    errors.doorsOpenTime = "Doors open date and time must both be set";
  }

  if (
    form.startDate &&
    form.startTime &&
    form.endDate &&
    form.endTime &&
    new Date(`${form.endDate}T${form.endTime}:00`) <=
      new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.endTime = "End date/time must be after start date/time";
  }

  if (
    form.doorsOpenDate &&
    form.doorsOpenTime &&
    form.startDate &&
    form.startTime &&
    new Date(`${form.doorsOpenDate}T${form.doorsOpenTime}:00`) >
      new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.doorsOpenTime = "Doors open must be before the event starts";
  }

  return errors;
};

export const buildLocationPayload = (form, status) => {
  const hasPhysicalLocation = [
    form.venueName,
    form.venueAddress,
    form.venueCity,
    form.venueState,
    form.venueCountry,
    form.venueZip,
  ].some((value) => value?.trim());

  const hasOnlineLocation = [
    form.onlineLink,
    form.onlinePlatform,
    form.streamPassword,
  ].some((value) => value?.trim());

  if (!hasPhysicalLocation && !hasOnlineLocation && status === "draft") {
    return undefined;
  }

  const latitude = Number.parseFloat(form.venueLat);
  const longitude = Number.parseFloat(form.venueLng);

  return {
    type: form.locationType,
    name: ["physical", "hybrid"].includes(form.locationType)
      ? form.venueName.trim() || undefined
      : undefined,
    address: ["physical", "hybrid"].includes(form.locationType)
      ? form.venueAddress.trim() || undefined
      : undefined,
    city: ["physical", "hybrid"].includes(form.locationType)
      ? form.venueCity.trim() || undefined
      : undefined,
    state: ["physical", "hybrid"].includes(form.locationType)
      ? form.venueState.trim() || undefined
      : undefined,
    country: ["physical", "hybrid"].includes(form.locationType)
      ? form.venueCountry.trim() || undefined
      : undefined,
    zip: ["physical", "hybrid"].includes(form.locationType)
      ? form.venueZip.trim() || undefined
      : undefined,
    coordinates:
      ["physical", "hybrid"].includes(form.locationType) &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
        ? {
            type: "Point",
            coordinates: [longitude, latitude],
          }
        : undefined,
    onlineUrl: ["online", "hybrid"].includes(form.locationType)
      ? form.onlineLink.trim() || undefined
      : undefined,
    onlinePlatform: ["online", "hybrid"].includes(form.locationType)
      ? form.onlinePlatform.trim() || undefined
      : undefined,
    streamPassword: ["online", "hybrid"].includes(form.locationType)
      ? form.streamPassword.trim() || undefined
      : undefined,
  };
};

export const buildEventPayload = (form, { status } = {}) => ({
  title: form.title.trim(),
  shortDescription: form.shortDescription.trim() || undefined,
  description: form.description.trim() || undefined,
  category: form.category || undefined,
  subcategory: form.subcategory || undefined,
  startDate: buildDateTime(form.startDate, form.startTime),
  endDate: buildDateTime(form.endDate, form.endTime),
  timezone: form.timezone,
  doorsOpen: buildDateTime(form.doorsOpenDate, form.doorsOpenTime),
  location: buildLocationPayload(form, status),
  ageRestriction: form.ageRestriction,
  isFree: form.isFree,
  currency: form.currency,
  visibility: form.visibility,
  requiresApproval: form.requiresApproval,
  coverImage: form.coverImage.trim() || undefined,
  images: splitTextList(form.galleryImagesText),
  videoUrl: form.videoUrl.trim() || undefined,
  refundPolicy: form.hasRefundPolicy
    ? {
        allowRefunds: form.allowRefunds,
        cutoffHours: Number.parseInt(form.refundCutoffHours || "0", 10),
        percentageBack: Number.parseInt(form.refundPercentageBack || "0", 10),
        notes: form.refundNotes.trim() || undefined,
      }
    : undefined,
  termsAndConditions: form.termsAndConditions.trim() || undefined,
  dressCode: form.dressCode.trim() || undefined,
  accessibilityInfo: form.accessibilityInfo.trim() || undefined,
  seo:
    form.seoMetaTitle.trim() ||
    form.seoMetaDescription.trim() ||
    form.seoKeywordsText.trim() ||
    form.seoCanonicalUrl.trim() ||
    form.seoOgImage.trim()
      ? {
          metaTitle: form.seoMetaTitle.trim() || undefined,
          metaDescription: form.seoMetaDescription.trim() || undefined,
          keywords: splitTextList(form.seoKeywordsText),
          canonicalUrl: form.seoCanonicalUrl.trim() || undefined,
          ogImage: form.seoOgImage.trim() || undefined,
        }
      : undefined,
  ...(status ? { status } : {}),
});
