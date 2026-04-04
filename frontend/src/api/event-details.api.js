import {
  getEventDetails,
  getRelatedEvents,
} from "./events.api";

const eventDetailsService = {
  getDetails: (slug) => getEventDetails(slug),
  getRelated: (slug) => getRelatedEvents(slug),
};

export default eventDetailsService;
