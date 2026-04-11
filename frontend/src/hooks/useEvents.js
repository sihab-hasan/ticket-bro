/**
 * useEvents.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook that wraps the Redux events slice + events.api.js.
 *
 * Provides:
 *   - Data from the store (events, featured, trending, upcoming, currentEvent)
 *   - Dispatch helpers (load*, refresh, bookmark)
 *   - Query param builder aligned to event.model.js field names
 *
 * All API query params match the backend query handler which accepts:
 *   category, subcategory, eventType, city, status, visibility,
 *   isFeatured, isTrending, isFree, startDate[gte], startDate[lte],
 *   minPrice, maxPrice, sort, page, limit
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  fetchFeaturedEvents,
  fetchTrendingEvents,
  fetchUpcomingEvents,
  fetchEventBySlug,
  fetchRelatedEvents,
  setCurrentEvent,
  clearCurrentEvent,
  clearEvents,
  toggleBookmark,
} from '@/store/slices/eventsSlice';
import { useLocation as useLocationCtx } from '@/context/LocationContext';
import { getLocationQueryValue } from '@/lib/locationSelection';
import { EVENT_STATUS, VISIBILITY } from '@/types/event.types';

// ── Selectors ──────────────────────────────────────────────────────────────
const selectEvents       = (s) => s.events;
const selectList         = (s) => s.events.events;
const selectFeatured     = (s) => s.events.featured;
const selectTrending     = (s) => s.events.trending;
const selectUpcoming     = (s) => s.events.upcoming;
const selectCurrentEvent = (s) => s.events.currentEvent;
const selectRelated      = (s) => s.events.related;
const selectPagination   = (s) => s.events.pagination;
const selectLoading      = (s) => s.events.loading;
const selectError        = (s) => s.events.error;

// ── Hook ───────────────────────────────────────────────────────────────────
const useEvents = () => {
  const dispatch = useDispatch();
  const { selectedLocation } = useLocationCtx();
  const cityFilter = getLocationQueryValue(selectedLocation);

  // Store state
  const events       = useSelector(selectList);
  const featured     = useSelector(selectFeatured);
  const trending     = useSelector(selectTrending);
  const upcoming     = useSelector(selectUpcoming);
  const currentEvent = useSelector(selectCurrentEvent);
  const related      = useSelector(selectRelated);
  const pagination   = useSelector(selectPagination);
  const loading      = useSelector(selectLoading);
  const error        = useSelector(selectError);

  // ── Query param builder ────────────────────────────────────────────────
  /**
   * Builds a query params object aligned to event.model.js + API handler.
   *
   * @param {Object} overrides  — any event.model.js-compatible query fields
   * @returns {Object}
   */
  const buildParams = useCallback((overrides = {}) => {
    const base = {
      status:     EVENT_STATUS.PUBLISHED,
      visibility: VISIBILITY.PUBLIC,
      // Inject the globally selected city when discovery is scoped to one city.
      ...(cityFilter ? { city: cityFilter } : {}),
    };
    return { ...base, ...overrides };
  }, [cityFilter]);

  // ── Load helpers ───────────────────────────────────────────────────────

  /** Load paginated / filtered event list */
  const loadEvents = useCallback((params = {}) =>
    dispatch(fetchEvents(buildParams(params))), [dispatch, buildParams]);

  /** Load isFeatured=true events */
  const loadFeatured = useCallback((limit = 6) =>
    dispatch(fetchFeaturedEvents(limit)), [dispatch]);

  /** Load events sorted by trendScore desc (isTrending=true on backend) */
  const loadTrending = useCallback((limit = 8) =>
    dispatch(fetchTrendingEvents(limit)), [dispatch]);

  /** Load upcoming events (startDate >= now, sorted soonest first) */
  const loadUpcoming = useCallback((limit = 8) =>
    dispatch(fetchUpcomingEvents(limit)), [dispatch]);

  /** Load single event by slug */
  const loadEvent = useCallback((slug) =>
    dispatch(fetchEventBySlug(slug)), [dispatch]);

  /** Load related events for the given slug */
  const loadRelated = useCallback((slug) =>
    dispatch(fetchRelatedEvents(slug)), [dispatch]);

  /** Toggle bookmark (optimistic) */
  const handleToggleBookmark = useCallback((eventId) =>
    dispatch(toggleBookmark(eventId)), [dispatch]);

  /** Force-refresh the current list with the same location */
  const refresh = useCallback((params = {}) => loadEvents(params), [loadEvents]);

  // ── Derived helpers (model-aware) ─────────────────────────────────────

  /** Filter events by startDate >= today (upcoming only) */
  const getUpcomingFromList = useCallback(() => {
    const now = new Date();
    return events.filter((e) => e.startDate && e.startDate > now)
                 .sort((a, b) => a.startDate - b.startDate);
  }, [events]);

  /** Filter events happening right now */
  const getOngoingFromList = useCallback(() => {
    const now = new Date();
    return events.filter((e) => e.startDate && e.endDate && e.startDate <= now && e.endDate >= now);
  }, [events]);

  /** Sort by trendScore desc (uses event.model.js trendScore field) */
  const getTrendingFromList = useCallback(() =>
    [...events].sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)), [events]);

  /** Sort by averageRating desc (uses event.model.js averageRating field) */
  const getTopRatedFromList = useCallback(() =>
    [...events].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)), [events]);

  /** Sort by createdAt desc (new arrivals — uses model createdAt index) */
  const getNewArrivalsFromList = useCallback(() =>
    [...events].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8), [events]);

  /** Get events closest to the user (requires location.latLng populated) */
  const getNearbyFromList = useCallback(() =>
    events.filter((e) => e.location?.latLng), [events]);

  /** Get free events (isFree=true) */
  const getFreeFromList = useCallback(() =>
    events.filter((e) => e.isFree), [events]);

  return {
    // data
    events,
    featured,
    trending,
    upcoming,
    currentEvent,
    related,
    pagination,
    loading,
    error,

    // actions
    loadEvents,
    loadFeatured,
    loadTrending,
    loadUpcoming,
    loadEvent,
    loadRelated,
    refresh,
    toggleBookmark: handleToggleBookmark,
    setCurrentEvent: (e) => dispatch(setCurrentEvent(e)),
    clearCurrentEvent: () => dispatch(clearCurrentEvent()),
    clearEvents: () => dispatch(clearEvents()),

    // query builder
    buildParams,

    // derived
    getUpcomingFromList,
    getOngoingFromList,
    getTrendingFromList,
    getTopRatedFromList,
    getNewArrivalsFromList,
    getNearbyFromList,
    getFreeFromList,

    // convenience booleans
    isLoadingList:    loading.events,
    isLoadingEvent:   loading.currentEvent,
    isLoadingRelated: loading.related,
    hasError:         !!error.events,
    isEmpty:          !loading.events && events.length === 0,
  };
};

export default useEvents;
