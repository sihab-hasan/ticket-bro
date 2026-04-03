import {
  getEventDetails,
  getRelatedEvents,
  getEventReviews,
} from "./events.api";

const eventDetailsService = {
  getDetails: (slug) => getEventDetails(slug),
  getRelated: (slug) => getRelatedEvents(slug),
  getReviews: (slug, params) => getEventReviews(slug, params),
};

export default eventDetailsService;
