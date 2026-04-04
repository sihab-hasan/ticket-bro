/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
};

const MAX_EVENT_PAGES = 5;
const EVENTS_PER_PAGE = 100;

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

const fetchAllPublishedEvents = async () => {
  const events = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await eventsService.getAllEvents({
      page,
      limit: EVENTS_PER_PAGE,
      sort: "startDate",
    });

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

  const loadBrowseData = useCallback(async ({ silent = false } = {}) => {
    setState((current) => ({
      ...current,
      isLoading: silent ? current.isLoading : true,
      isRefreshing: silent ? true : current.events.length > 0,
      error: null,
    }));

    try {
      const [categories, subcategories, events, reviewResult] = await Promise.all([
        categoriesService.getAll(),
        subcategoriesService.getAll(),
        fetchAllPublishedEvents(),
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

      setState({
        categories: categories || [],
        subcategories: subcategories || [],
        events,
        reviews,
        navigationItems,
        categoryMap,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error,
      }));
    }
  }, []);

  useEffect(() => {
    loadBrowseData();
  }, [loadBrowseData]);

  const value = useMemo(
    () => ({
      ...state,
      refreshBrowseData: () => loadBrowseData({ silent: true }),
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
