/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import categoriesService from "@/api/categories.api";
import subcategoriesService from "@/api/subcategories.api";
import eventsService from "@/api/events.api";
import reviewsService from "@/api/reviews.api";
import {
  buildBrowseNavigation,
  buildCategoryMap,
  normalizeBrowseReview,
  normalizeEvent,
} from "@/utils/browse.utils";
import { subscribeToBrowseRefresh } from "@/lib/browseSync";

const BrowseContext = createContext(null);

const EMPTY_STATE = {
  categories: [],
  subcategories: [],
  events: [],
  reviews: [],
  navigationItems: [],
  categoryMap: {},
  isLoading: true,
  isRefreshing: false,
  error: null,
  lastUpdatedAt: 0,
};

const MAX_EVENT_PAGES = 20;
const EVENTS_PER_PAGE = 100;
const BACKGROUND_REFRESH_INTERVAL = 60 * 1000;
const MIN_REFRESH_GAP = 5 * 1000;
const FRESH_HEADERS = {
  "Cache-Control": "no-cache",
};

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.id || item._id;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const fetchAllPublishedEvents = async (requestOptions = {}) => {
  const events = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await eventsService.getAllEvents({
      page,
      limit: EVENTS_PER_PAGE,
      sort: "startDate",
      status: "published",
      visibility: "public",
    }, requestOptions);

    events.push(...(result?.events || []));
    totalPages = Math.min(
      Number(result?.pagination?.totalPages || 1),
      MAX_EVENT_PAGES,
    );
    page += 1;
  } while (page <= totalPages);

  return uniqueById(events.map(normalizeEvent));
};

export const BrowseProvider = ({ children }) => {
  const [state, setState] = useState(EMPTY_STATE);
  const isLoadingRef = useRef(false);
  const lastRefreshRef = useRef(0);

  const loadBrowseData = useCallback(async ({ silent = false, forceFresh = false } = {}) => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setState((current) => ({
      ...current,
      isLoading: silent ? current.isLoading : true,
      isRefreshing: silent ? true : current.events.length > 0,
      error: silent && current.events.length > 0 ? current.error : null,
    }));

    try {
      const eventRequestOptions = forceFresh
        ? { headers: FRESH_HEADERS }
        : {};
      const [categories, subcategories, events, reviewResult] = await Promise.all([
        categoriesService.getAll(),
        subcategoriesService.getAll(),
        fetchAllPublishedEvents(eventRequestOptions),
        reviewsService
          .getAll({
            page: 1,
            limit: 6,
            sort: "-createdAt",
          })
          .catch(() => ({ reviews: [] })),
      ]);
      const reviews = (reviewResult?.reviews || []).map((review) =>
        normalizeBrowseReview(review),
      );

      const categoryMap = buildCategoryMap({
        categories: categories || [],
        subcategories: subcategories || [],
        events,
      });
      const navigationItems = buildBrowseNavigation({
        categories: categories || [],
        subcategories: subcategories || [],
        events,
      });

      const nextState = {
        categories: categories || [],
        subcategories: subcategories || [],
        events,
        reviews,
        navigationItems,
        categoryMap,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdatedAt: Date.now(),
      };

      startTransition(() => {
        setState(nextState);
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: current.events.length > 0 ? null : error,
      }));
    } finally {
      lastRefreshRef.current = Date.now();
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadBrowseData();
  }, [loadBrowseData]);

  const requestLiveRefresh = useCallback(
    ({ allowHidden = false, force = false } = {}) => {
      if (typeof document !== "undefined") {
        const isHidden = document.visibilityState === "hidden";
        if (!allowHidden && isHidden) {
          return;
        }
      }

      const now = Date.now();
      if (!force && now - lastRefreshRef.current < MIN_REFRESH_GAP) {
        return;
      }

      lastRefreshRef.current = now;
      void loadBrowseData({ silent: true, forceFresh: true });
    },
    [loadBrowseData],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      requestLiveRefresh();
    }, BACKGROUND_REFRESH_INTERVAL);

    const handleFocus = () => requestLiveRefresh();
    const handleOnline = () => requestLiveRefresh({ force: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestLiveRefresh();
      }
    };
    const unsubscribeBrowseRefresh = subscribeToBrowseRefresh(() =>
      requestLiveRefresh({ force: true }),
    );

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribeBrowseRefresh();
    };
  }, [requestLiveRefresh]);

  const value = useMemo(
    () => ({
      ...state,
      refreshBrowseData: () => loadBrowseData({ silent: true, forceFresh: true }),
    }),
    [loadBrowseData, state],
  );

  return (
    <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>
  );
};

export const useBrowseContext = () => {
  const context = useContext(BrowseContext);
  if (!context) {
    throw new Error("useBrowseContext must be used within a BrowseProvider");
  }
  return context;
};

export default BrowseContext;
