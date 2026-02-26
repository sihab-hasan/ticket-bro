// frontend/src/contexts/SearchContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';

const SearchContext = createContext(null);

// Search types
export const SearchType = {
  EVENTS: 'events',
  VENUES: 'venues',
  ARTISTS: 'artists',
  ORGANIZERS: 'organizers',
  ALL: 'all'
};

// Sort options
export const SortOption = {
  RELEVANCE: 'relevance',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  POPULARITY: 'popularity',
  RATING: 'rating'
};

// Price ranges
export const PriceRange = {
  UNDER_25: { min: 0, max: 25, label: 'Under $25' },
  UNDER_50: { min: 0, max: 50, label: 'Under $50' },
  UNDER_100: { min: 0, max: 100, label: 'Under $100' },
  UNDER_200: { min: 0, max: 200, label: 'Under $200' },
  CUSTOM: { min: 0, max: 0, label: 'Custom' }
};

// Date ranges
export const DateRange = {
  TODAY: { value: 'today', label: 'Today' },
  TOMORROW: { value: 'tomorrow', label: 'Tomorrow' },
  THIS_WEEK: { value: 'this_week', label: 'This Week' },
  THIS_WEEKEND: { value: 'this_weekend', label: 'This Weekend' },
  NEXT_WEEK: { value: 'next_week', label: 'Next Week' },
  THIS_MONTH: { value: 'this_month', label: 'This Month' },
  NEXT_MONTH: { value: 'next_month', label: 'Next Month' },
  CUSTOM: { value: 'custom', label: 'Custom' }
};

// Initial state
const initialState = {
  query: '',
  type: SearchType.ALL,
  filters: {
    categories: [],
    subcategories: [],
    locations: [],
    dateRange: null,
    dateFrom: null,
    dateTo: null,
    priceRange: null,
    priceMin: null,
    priceMax: null,
    artists: [],
    venues: [],
    organizers: [],
    tags: [],
    isFree: false,
    isOnline: false,
    isSoldOut: false,
    isCanceled: false,
  },
  sort: SortOption.RELEVANCE,
  page: 1,
  limit: 20,
  view: 'grid', // 'grid', 'list', 'calendar'
};

// Search reducer
const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload, page: 1 };
      
    case 'SET_TYPE':
      return { ...state, type: action.payload, page: 1 };
      
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
        page: 1
      };
      
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload }, page: 1 };
      
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters, page: 1 };
      
    case 'SET_SORT':
      return { ...state, sort: action.payload, page: 1 };
      
    case 'SET_PAGE':
      return { ...state, page: action.payload };
      
    case 'SET_LIMIT':
      return { ...state, limit: action.payload, page: 1 };
      
    case 'SET_VIEW':
      return { ...state, view: action.payload };
      
    case 'RESET_SEARCH':
      return initialState;
      
    default:
      return state;
  }
};

// Mock search results
const MOCK_RESULTS = {
  events: [
    { id: 'event_1', type: 'event', title: 'Taylor Swift: The Eras Tour', category: 'Concert', date: '2024-06-15', venue: 'MetLife Stadium', price: 199.99, rating: 4.8, image: 'https://picsum.photos/300/200?random=1' },
    { id: 'event_2', type: 'event', title: 'NBA Finals: Game 7', category: 'Sports', date: '2024-07-20', venue: 'Madison Square Garden', price: 299.99, rating: 4.9, image: 'https://picsum.photos/300/200?random=2' },
    { id: 'event_3', type: 'event', title: 'Hamilton: The Musical', category: 'Theater', date: '2024-08-10', venue: 'Richard Rodgers Theatre', price: 149.99, rating: 4.9, image: 'https://picsum.photos/300/200?random=3' },
    { id: 'event_4', type: 'event', title: 'Comedy Night with Kevin Hart', category: 'Comedy', date: '2024-09-05', venue: 'The Comedy Store', price: 79.99, rating: 4.7, image: 'https://picsum.photos/300/200?random=4' },
  ],
  venues: [
    { id: 'venue_1', type: 'venue', name: 'Madison Square Garden', location: 'New York, NY', capacity: 20000, rating: 4.8, image: 'https://picsum.photos/300/200?random=5' },
    { id: 'venue_2', type: 'venue', name: 'Hollywood Bowl', location: 'Los Angeles, CA', capacity: 17500, rating: 4.7, image: 'https://picsum.photos/300/200?random=6' },
  ],
  artists: [
    { id: 'artist_1', type: 'artist', name: 'Taylor Swift', genre: 'Pop', followers: '95M', rating: 4.9, image: 'https://picsum.photos/300/200?random=7' },
    { id: 'artist_2', type: 'artist', name: 'Drake', genre: 'Hip-Hop', followers: '85M', rating: 4.8, image: 'https://picsum.photos/300/200?random=8' },
  ],
  organizers: [
    { id: 'org_1', type: 'organizer', name: 'Live Nation', events: 1250, rating: 4.6, image: 'https://picsum.photos/300/200?random=9' },
    { id: 'org_2', type: 'organizer', name: 'AEG Presents', events: 980, rating: 4.7, image: 'https://picsum.photos/300/200?random=10' },
  ]
};

export const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    'Taylor Swift',
    'NBA Finals',
    'Hamilton',
    'Comedy Shows',
    'Concerts this weekend',
    'Sports events',
  ]);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  }, []);

  // Save recent searches
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recent_searches', JSON.stringify(recentSearches.slice(0, 10)));
    }
  }, [recentSearches]);

  // Perform search
  const search = useCallback(async (searchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Merge with current state
      const params = { ...state, ...searchParams };
      
      // Save to recent searches if query exists
      if (params.query && params.query.trim()) {
        setRecentSearches(prev => {
          const filtered = prev.filter(s => s !== params.query);
          return [params.query, ...filtered].slice(0, 10);
        });
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock results based on search type
      let searchResults = [];
      if (params.type === SearchType.ALL) {
        searchResults = [
          ...MOCK_RESULTS.events,
          ...MOCK_RESULTS.venues,
          ...MOCK_RESULTS.artists,
          ...MOCK_RESULTS.organizers,
        ];
      } else {
        searchResults = MOCK_RESULTS[params.type] || [];
      }
      
      // Filter by query
      if (params.query) {
        const query = params.query.toLowerCase();
        searchResults = searchResults.filter(item => 
          item.title?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.genre?.toLowerCase().includes(query)
        );
      }
      
      // Apply filters
      if (params.filters) {
        // Category filter
        if (params.filters.categories?.length) {
          searchResults = searchResults.filter(item => 
            params.filters.categories.includes(item.category)
          );
        }
        
        // Location filter
        if (params.filters.locations?.length) {
          searchResults = searchResults.filter(item => 
            params.filters.locations.some(loc => 
              item.venue?.includes(loc) || item.location?.includes(loc)
            )
          );
        }
        
        // Price range filter
        if (params.filters.priceRange) {
          const { min, max } = params.filters.priceRange;
          searchResults = searchResults.filter(item => 
            item.price >= min && item.price <= max
          );
        }
        
        // Free events filter
        if (params.filters.isFree) {
          searchResults = searchResults.filter(item => item.price === 0);
        }
      }
      
      // Apply sorting
      switch (params.sort) {
        case SortOption.DATE_ASC:
          searchResults.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case SortOption.DATE_DESC:
          searchResults.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case SortOption.PRICE_ASC:
          searchResults.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case SortOption.PRICE_DESC:
          searchResults.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case SortOption.RATING:
          searchResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          // Relevance - keep as is
          break;
      }
      
      // Paginate
      const start = (params.page - 1) * params.limit;
      const paginatedResults = searchResults.slice(start, start + params.limit);
      
      setResults(paginatedResults);
      setTotalResults(searchResults.length);
      setTotalPages(Math.ceil(searchResults.length / params.limit));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return [];
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const suggestions = [
        ...MOCK_RESULTS.events.filter(e => 
          e.title.toLowerCase().includes(query.toLowerCase())
        ).map(e => ({ type: 'event', text: e.title })),
        ...MOCK_RESULTS.artists.filter(a => 
          a.name.toLowerCase().includes(query.toLowerCase())
        ).map(a => ({ type: 'artist', text: a.name })),
        ...MOCK_RESULTS.venues.filter(v => 
          v.name.toLowerCase().includes(query.toLowerCase())
        ).map(v => ({ type: 'venue', text: v.name })),
      ].slice(0, 5);
      
      setSuggestions(suggestions);
      return suggestions;
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      return [];
    }
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  }, []);

  // Remove from recent searches
  const removeRecentSearch = useCallback((search) => {
    setRecentSearches(prev => prev.filter(s => s !== search));
  }, []);

  // Reset search
  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
    setResults([]);
    setTotalResults(0);
    setTotalPages(0);
  }, []);

  const value = {
    // State
    ...state,
    results,
    totalResults,
    totalPages,
    isLoading,
    error,
    suggestions,
    recentSearches,
    popularSearches,
    
    // Actions
    setQuery: (query) => dispatch({ type: 'SET_QUERY', payload: query }),
    setType: (type) => dispatch({ type: 'SET_TYPE', payload: type }),
    setFilter: (key, value) => dispatch({ type: 'SET_FILTER', payload: { key, value } }),
    setFilters: (filters) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    setSort: (sort) => dispatch({ type: 'SET_SORT', payload: sort }),
    setPage: (page) => dispatch({ type: 'SET_PAGE', payload: page }),
    setLimit: (limit) => dispatch({ type: 'SET_LIMIT', payload: limit }),
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    
    // Search methods
    search,
    getSuggestions,
    resetSearch,
    
    // Recent searches
    clearRecentSearches,
    removeRecentSearch,
    
    // Constants
    SearchType,
    SortOption,
    PriceRange,
    DateRange,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};