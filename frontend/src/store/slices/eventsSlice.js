/**
 * eventsSlice.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Redux Toolkit slice for all event data.
 * Fields map directly to event.model.js.
 *
 * Async thunks call the real API (events.api.js).
 * Each thunk normalises the API response via normaliseEvent().
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventsApi from '@/api/events.api';
import { normaliseEvent } from '@/types/event.types';

// ── Thunks ─────────────────────────────────────────────────────────────────

/** GET /api/events  — paginated, filterable */
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const raw = await eventsApi.getAllEvents(params);
      return {
        events: (raw?.events || []).map(normaliseEvent),
        pagination: raw?.pagination || {},
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/events/featured */
export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeaturedEvents',
  async (limit = 6, { rejectWithValue }) => {
    try {
      const raw = await eventsApi.getFeaturedEvents(limit);
      return Array.isArray(raw) ? raw.map(normaliseEvent) : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/events/trending */
export const fetchTrendingEvents = createAsyncThunk(
  'events/fetchTrendingEvents',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const raw = await eventsApi.getTrendingEvents(limit);
      return Array.isArray(raw) ? raw.map(normaliseEvent) : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/events/upcoming */
export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcomingEvents',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const raw = await eventsApi.getUpcomingEvents(limit);
      return Array.isArray(raw) ? raw.map(normaliseEvent) : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/events/:slug  — single event detail */
export const fetchEventBySlug = createAsyncThunk(
  'events/fetchEventBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const raw = await eventsApi.getEventBySlug(slug);
      return normaliseEvent(raw);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/events/:slug/related */
export const fetchRelatedEvents = createAsyncThunk(
  'events/fetchRelatedEvents',
  async (slug, { rejectWithValue }) => {
    try {
      const raw = await eventsApi.getRelatedEvents(slug);
      return Array.isArray(raw) ? raw.map(normaliseEvent) : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Initial State ──────────────────────────────────────────────────────────
const initialState = {
  // Lists (indexed by context key for caching)
  events:          [],   // current page / filter result
  featured:        [],
  trending:        [],
  upcoming:        [],
  related:         [],

  // Single-event detail
  currentEvent:    null,

  // Pagination (mirrors API response)
  pagination: {
    page:       1,
    limit:      12,
    total:      0,
    totalPages: 0,
  },

  // Loading states — one per thunk
  loading: {
    events:          false,
    featured:        false,
    trending:        false,
    upcoming:        false,
    currentEvent:    false,
    related:         false,
  },

  // Error states
  error: {
    events:          null,
    featured:        null,
    trending:        null,
    upcoming:        null,
    currentEvent:    null,
    related:         null,
  },
};

// ── Slice ──────────────────────────────────────────────────────────────────
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    /** Manually set the current event (e.g. from a prefetched list item) */
    setCurrentEvent(state, { payload }) {
      state.currentEvent = payload ? normaliseEvent(payload) : null;
    },
    /** Clear single event detail when navigating away */
    clearCurrentEvent(state) {
      state.currentEvent = null;
      state.related      = [];
      state.error.currentEvent = null;
    },
    /** Reset the events list (e.g. on filter change) */
    clearEvents(state) {
      state.events     = [];
      state.pagination = initialState.pagination;
    },
    /** Optimistically toggle the bookmark flag */
    toggleBookmark(state, { payload: eventId }) {
      const toggle = (arr) =>
        arr.map((e) =>
          (e._id === eventId || e.id === eventId)
            ? { ...e, bookmarkCount: e.bookmarkCount + (e._bookmarked ? -1 : 1), _bookmarked: !e._bookmarked }
            : e
        );
      state.events    = toggle(state.events);
      state.trending  = toggle(state.trending);
      state.featured  = toggle(state.featured);
      state.upcoming  = toggle(state.upcoming);
      if (state.currentEvent?._id === eventId || state.currentEvent?.id === eventId) {
        state.currentEvent = {
          ...state.currentEvent,
          bookmarkCount: state.currentEvent.bookmarkCount + (state.currentEvent._bookmarked ? -1 : 1),
          _bookmarked: !state.currentEvent._bookmarked,
        };
      }
    },
  },

  extraReducers: (builder) => {
    // ── fetchEvents ───────────────────────────────────────────────────────
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading.events = true;
        state.error.events   = null;
      })
      .addCase(fetchEvents.fulfilled, (state, { payload }) => {
        state.loading.events = false;
        state.events = payload.events || [];
        state.pagination = { ...state.pagination, ...(payload.pagination || {}) };
      })
      .addCase(fetchEvents.rejected, (state, { payload }) => {
        state.loading.events = false;
        state.error.events   = payload || 'Failed to load events';
      });

    // ── fetchFeaturedEvents ───────────────────────────────────────────────
    builder
      .addCase(fetchFeaturedEvents.pending,   (state) => { state.loading.featured = true;  state.error.featured = null; })
      .addCase(fetchFeaturedEvents.fulfilled, (state, { payload }) => { state.loading.featured = false; state.featured = payload; })
      .addCase(fetchFeaturedEvents.rejected,  (state, { payload }) => { state.loading.featured = false; state.error.featured = payload; });

    // ── fetchTrendingEvents ───────────────────────────────────────────────
    builder
      .addCase(fetchTrendingEvents.pending,   (state) => { state.loading.trending = true;  state.error.trending = null; })
      .addCase(fetchTrendingEvents.fulfilled, (state, { payload }) => { state.loading.trending = false; state.trending = payload; })
      .addCase(fetchTrendingEvents.rejected,  (state, { payload }) => { state.loading.trending = false; state.error.trending = payload; });

    // ── fetchUpcomingEvents ───────────────────────────────────────────────
    builder
      .addCase(fetchUpcomingEvents.pending,   (state) => { state.loading.upcoming = true;  state.error.upcoming = null; })
      .addCase(fetchUpcomingEvents.fulfilled, (state, { payload }) => { state.loading.upcoming = false; state.upcoming = payload; })
      .addCase(fetchUpcomingEvents.rejected,  (state, { payload }) => { state.loading.upcoming = false; state.error.upcoming = payload; });

    // ── fetchEventBySlug ──────────────────────────────────────────────────
    builder
      .addCase(fetchEventBySlug.pending,   (state) => { state.loading.currentEvent = true;  state.error.currentEvent = null; })
      .addCase(fetchEventBySlug.fulfilled, (state, { payload }) => { state.loading.currentEvent = false; state.currentEvent = payload; })
      .addCase(fetchEventBySlug.rejected,  (state, { payload }) => { state.loading.currentEvent = false; state.error.currentEvent = payload; });

    // ── fetchRelatedEvents ────────────────────────────────────────────────
    builder
      .addCase(fetchRelatedEvents.pending,   (state) => { state.loading.related = true;  state.error.related = null; })
      .addCase(fetchRelatedEvents.fulfilled, (state, { payload }) => { state.loading.related = false; state.related = payload; })
      .addCase(fetchRelatedEvents.rejected,  (state, { payload }) => { state.loading.related = false; state.error.related = payload; });
  },
});

export const {
  setCurrentEvent,
  clearCurrentEvent,
  clearEvents,
  toggleBookmark,
} = eventsSlice.actions;

export default eventsSlice.reducer;
