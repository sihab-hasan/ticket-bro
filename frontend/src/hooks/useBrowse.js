import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useLocation as useLocationCtx } from "@/context/LocationContext";
import { useBrowseContext } from "@/context/BrowseContext";
import { ROUTES } from "@/app/AppRoutes";
import { calculateDistanceKm } from "@/lib/locationSelection";
import {
  applyBrowseFilters,
  browseFallbackIcon,
  buildBrowseStats,
  buildFacetCounts,
} from "@/utils/browse.utils";

export const getLevel = ({ categorySlug, subCategorySlug, eventTypeSlug } = {}) => {
  if (eventTypeSlug) return "eventType";
  if (subCategorySlug) return "subCategory";
  if (categorySlug) return "category";
  return "root";
};

export const unslugify = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export const toSlug = (value = "") =>
  value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");

export const spotsPercent = (event) => {
  if (!event?.totalCapacity) {
    return 0;
  }
  return Math.round(((event.totalSold || 0) / event.totalCapacity) * 100);
};

export const formatAttendees = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
};

const normalizeCompareValue = (value = "") => String(value).trim().toLowerCase();

const matchesSelectedLocation = (event, selectedLocation) => {
  if (!selectedLocation || selectedLocation.mode === "all") {
    return true;
  }

  const selectedValues = [
    selectedLocation.slug,
    selectedLocation.label,
  ]
    .filter(Boolean)
    .map(normalizeCompareValue);

  const cityValues = [
    event.location?.city,
    event.location?.slug,
    event.location?.name,
  ]
    .filter(Boolean)
    .map(normalizeCompareValue);

  return selectedValues.some((selectedValue) => cityValues.includes(selectedValue));
};

const matchesRouteScope = ({
  event,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
}) => {
  if (categorySlug && event.category?.slug !== categorySlug) {
    return false;
  }
  if (subCategorySlug && event.subcategory?.slug !== subCategorySlug) {
    return false;
  }
  if (eventTypeSlug && event.eventType?.slug !== eventTypeSlug) {
    return false;
  }
  return true;
};

const uniqueBySlug = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const slug = item?.slug;
    if (!slug || seen.has(slug)) {
      return false;
    }
    seen.add(slug);
    return true;
  });
};

const sortByStartDate = (events) =>
  [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

const countThisWeek = (events) => {
  const now = Date.now();
  const nextWeek = now + 7 * 24 * 60 * 60 * 1000;
  return events.filter((event) => {
    const start = new Date(event.startDate).getTime();
    return Number.isFinite(start) && start >= now && start <= nextWeek;
  }).length;
};

const useBrowse = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { categorySlug, subCategorySlug, eventTypeSlug } = params;
  const level = getLevel({ categorySlug, subCategorySlug, eventTypeSlug });

  const {
    categoryMap,
    navigationItems,
    reviews,
    events,
    isLoading,
    isRefreshing,
    error,
    refreshBrowseData,
  } = useBrowseContext();
  const { selectedLocation } = useLocationCtx();

  const cityId = selectedLocation?.slug || "all";
  const cityLabel = selectedLocation?.label || "All Cities";
  const locationFlag = selectedLocation?.flag || "Location";

  const filters = useMemo(
    () => ({
      date: searchParams.get("date"),
      price: searchParams.get("price"),
      format: searchParams.get("format"),
      time: searchParams.get("time"),
      sort: searchParams.get("sort") || "relevance",
    }),
    [searchParams],
  );

  const categoryItems = useMemo(() => Object.values(categoryMap), [categoryMap]);

  const locationEvents = useMemo(
    () => events.filter((event) => matchesSelectedLocation(event, selectedLocation)),
    [events, selectedLocation],
  );

  const scopedEvents = useMemo(
    () =>
      locationEvents.filter((event) =>
        matchesRouteScope({
          event,
          categorySlug,
          subCategorySlug,
          eventTypeSlug,
        }),
      ),
    [categorySlug, eventTypeSlug, locationEvents, subCategorySlug],
  );

  const filteredEvents = useMemo(
    () => applyBrowseFilters(scopedEvents, filters),
    [filters, scopedEvents],
  );

  const facetCounts = useMemo(() => buildFacetCounts(scopedEvents), [scopedEvents]);

  const activeCategory = categorySlug ? categoryMap[categorySlug] || null : null;
  const activeSubcategory = useMemo(
    () =>
      activeCategory?.subcategories?.find((subcategory) => subcategory.slug === subCategorySlug) ||
      null,
    [activeCategory, subCategorySlug],
  );
  const activeEventTypes = useMemo(
    () =>
      uniqueBySlug(
        filteredEvents
          .map((event) => event.eventType)
          .filter(Boolean),
      ),
    [filteredEvents],
  );
  const activeEventType = useMemo(
    () => activeEventTypes.find((eventType) => eventType.slug === eventTypeSlug) || null,
    [activeEventTypes, eventTypeSlug],
  );

  const config = useMemo(() => {
    if (level === "root") {
      return {
        label: "All Events",
        icon: browseFallbackIcon,
        description: "Discover live events across every category.",
        subcategories: categoryItems,
        eventTypes: [],
        totalEvents: locationEvents.length,
        thisWeek: countThisWeek(locationEvents),
      };
    }

    if (level === "category") {
      return {
        ...(activeCategory || {}),
        label: activeCategory?.label || unslugify(categorySlug),
        icon: activeCategory?.icon || browseFallbackIcon,
        subcategories: activeCategory?.subcategories || [],
        eventTypes: uniqueBySlug(
          scopedEvents.map((event) => event.eventType).filter(Boolean),
        ),
        totalEvents: scopedEvents.length,
        thisWeek: countThisWeek(scopedEvents),
      };
    }

    if (level === "subCategory") {
      return {
        ...(activeCategory || {}),
        label: activeCategory?.label || unslugify(categorySlug),
        icon: activeCategory?.icon || browseFallbackIcon,
        currentSubcategory: activeSubcategory,
        subcategories: activeEventTypes,
        eventTypes: activeEventTypes,
        totalEvents: scopedEvents.length,
        thisWeek: countThisWeek(scopedEvents),
      };
    }

    return {
      ...(activeCategory || {}),
      label: activeCategory?.label || unslugify(categorySlug),
      icon: activeCategory?.icon || browseFallbackIcon,
      currentSubcategory: activeSubcategory,
      currentEventType: activeEventType,
      subcategories: activeEventTypes,
      eventTypes: activeEventTypes,
      totalEvents: scopedEvents.length,
      thisWeek: countThisWeek(scopedEvents),
    };
  }, [
    activeCategory,
    activeEventType,
    activeEventTypes,
    activeSubcategory,
    categoryItems,
    categorySlug,
    level,
    locationEvents,
    scopedEvents,
  ]);

  const scopedReviews = useMemo(() => reviews || [], [reviews]);

  const totalCount = filteredEvents.length;

  const getHeroDescription = () => {
    if (level === "root") {
      return `Discover live events happening in ${cityLabel}. Browse every category, venue, and experience in one place.`;
    }
    if (level === "category") {
      return activeCategory?.description || `Explore ${config.label} events happening in ${cityLabel}.`;
    }
    if (level === "subCategory") {
      return `Browse ${activeSubcategory?.name || unslugify(subCategorySlug)} events in ${cityLabel}.`;
    }
    return `Find ${activeEventType?.name || unslugify(eventTypeSlug)} events in ${cityLabel}.`;
  };

  const buildEventUrl = (event) => {
    const category = event.category?.slug || categorySlug || "browse";
    const subcategory = event.subcategory?.slug || subCategorySlug || category;
    const type = event.eventType?.slug || eventTypeSlug || subcategory;
    return ROUTES.BROWSE.EVENT(category, subcategory, type, event.slug);
  };

  const buildCategoryUrl = (slug) => ROUTES.BROWSE.CATEGORY(slug);
  const buildSubCategoryUrl = (category, subcategory) =>
    ROUTES.BROWSE.SUBCATEGORY(category, subcategory);
  const buildEventTypeUrl = (category, subcategory, type) =>
    ROUTES.BROWSE.EVENT_TYPE(category, subcategory, type);

  const currentBrowsePath = useMemo(() => {
    if (level === "root") {
      return ROUTES.BROWSE.ROOT;
    }
    if (level === "category") {
      return ROUTES.BROWSE.CATEGORY(categorySlug);
    }
    if (level === "subCategory") {
      return ROUTES.BROWSE.SUBCATEGORY(categorySlug, subCategorySlug);
    }
    return ROUTES.BROWSE.EVENT_TYPE(categorySlug, subCategorySlug, eventTypeSlug);
  }, [categorySlug, eventTypeSlug, level, subCategorySlug]);

  const resultsHref = `${currentBrowsePath}#browse-results`;

  const getEvents = () => filteredEvents;

  const getFeatured = () => {
    const featured = filteredEvents.filter((event) => event.isFeatured);
    return (featured.length ? featured : filteredEvents).slice(0, 6);
  };

  const getTrending = () =>
    [...filteredEvents]
      .sort(
        (a, b) =>
          Number(b.trendScore || b.totalSold || 0) -
          Number(a.trendScore || a.totalSold || 0),
      )
      .slice(0, 8);

  const getTopRated = () =>
    [...filteredEvents]
      .sort(
        (a, b) =>
          Number(b.averageRating || 0) - Number(a.averageRating || 0) ||
          Number(b.reviewCount || 0) - Number(a.reviewCount || 0),
      )
      .slice(0, 8);

  const getNewArrivals = () =>
    [...filteredEvents]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);

  const getNearby = () =>
    [...filteredEvents]
      .filter((event) => event.location?.latLng)
      .map((event) => {
        const distance = selectedLocation?.coords
          ? calculateDistanceKm(selectedLocation.coords, event.location.latLng)
          : null;

        return distance === null ? event : { ...event, distance };
      })
      .sort((a, b) => {
        const distanceA = Number.isFinite(a.distance) ? a.distance : null;
        const distanceB = Number.isFinite(b.distance) ? b.distance : null;

        if (distanceA !== null && distanceB !== null && distanceA !== distanceB) {
          return distanceA - distanceB;
        }

        if (distanceA !== null) {
          return -1;
        }

        if (distanceB !== null) {
          return 1;
        }

        return new Date(a.startDate) - new Date(b.startDate);
      })
      .slice(0, 8);

  const getEditorsPicks = () =>
    [...filteredEvents]
      .sort((a, b) => {
        const scoreA =
          Number(a.isFeatured || 0) * 100 +
          Number(a.averageRating || 0) * 10 +
          Number(a.reviewCount || 0);
        const scoreB =
          Number(b.isFeatured || 0) * 100 +
          Number(b.averageRating || 0) * 10 +
          Number(b.reviewCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, 6);

  const getRecommended = () =>
    [...filteredEvents]
      .sort((a, b) => {
        const scoreA =
          Number(a.totalSold || 0) +
          Number(a.averageRating || 0) * 20 +
          Number(a.bookmarkCount || 0);
        const scoreB =
          Number(b.totalSold || 0) +
          Number(b.averageRating || 0) * 20 +
          Number(b.bookmarkCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, 6);

  const getUpcoming = () =>
    sortByStartDate(
      filteredEvents.filter((event) => {
        if (!event.startDate) return false;
        return new Date(event.startDate).getTime() > Date.now();
      }),
    ).slice(0, 8);

  const getReviews = () => scopedReviews.slice(0, 6);

  const getStats = () =>
    buildBrowseStats(filteredEvents.length ? filteredEvents : scopedEvents);

  const getFacets = () => facetCounts;

  return {
    level,
    config,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    cityId,
    cityLabel,
    locationLabel: cityLabel,
    locationFlag,
    totalCount,
    filters,
    isLoading,
    isRefreshing,
    error,
    refreshBrowseData,
    getHeroDescription,
    isRoot: level === "root",
    isCategory: level === "category",
    isSubCategory: level === "subCategory",
    isEventType: level === "eventType",
    categoryItems,
    navigationItems,
    activeCategory,
    activeSubcategory,
    activeEventType,
    scopedEvents,
    filteredEvents,
    getEvents,
    getFeatured,
    getTrending,
    getTopRated,
    getNewArrivals,
    getNearby,
    getEditorsPicks,
    getRecommended,
    getUpcoming,
    getReviews,
    getStats,
    getFacets,
    buildEventUrl,
    buildCategoryUrl,
    buildSubCategoryUrl,
    buildEventTypeUrl,
    currentBrowsePath,
    resultsHref,
    unslugify,
    toSlug,
    spotsPercent,
    formatAttendees,
    CATEGORY_MAP: categoryMap,
  };
};

export default useBrowse;
