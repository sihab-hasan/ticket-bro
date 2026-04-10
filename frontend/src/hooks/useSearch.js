import { useCallback, useEffect, useState, useMemo } from 'react';
import searchService from '@/api/search.api';
import { normalizeEvent } from '@/utils/browse.utils';

export const useSearch = (options = {}) => {
  const { 
    debounceMs = 300,
    initialQuery = '',
    autoSearch = false 
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    location: '',
    city: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    isFree: false,
    tags: [],
    sort: '-createdAt'
  });

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.location) params.set('location', filters.location);
    if (filters.city) params.set('city', filters.city);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.isFree) params.set('isFree', 'true');
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));
    params.set('sort', filters.sort);
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());

    return params.toString();
  }, [query, filters, pagination.page, pagination.limit]);

  const search = useCallback(async (resetPage = false) => {
    if (!query && !Object.values(filters).some(v => v)) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = {
        q: query,
        category: filters.category,
        subcategory: filters.subcategory,
        location: filters.location,
        city: filters.city,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        isFree: filters.isFree,
        tags: filters.tags,
        sort: filters.sort,
        page: resetPage ? 1 : pagination.page,
        limit: pagination.limit
      };

      const response = await searchService.search(params);
      
      setResults((response?.events || []).map(normalizeEvent));
      setPagination({
        page: response?.page || 1,
        limit: response?.limit || 20,
        total: response?.total || 0,
        totalPages: response?.totalPages || 0
      });
    } catch (err) {
      setError(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, pagination.page, pagination.limit]);

  // Debounced search
  useEffect(() => {
    if (!autoSearch) return;
    
    const timer = setTimeout(() => {
      search(true);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchParams, autoSearch, debounceMs]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      subcategory: '',
      location: '',
      city: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
      isFree: false,
      tags: [],
      sort: '-createdAt'
    });
  }, []);

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.page]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    pagination,
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    search,
    setPage,
    nextPage,
    prevPage,
    hasResults: results.length > 0,
    hasFilters: Object.values(filters).some(v => v)
  };
};

export const useAutocomplete = (options = {}) => {
  const { debounceMs = 200, minLength = 2 } = options;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length < minLength) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchService.autocomplete(query);
        setSuggestions(response?.suggestions || []);
        setIsOpen(true);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, minLength]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    loading,
    isOpen,
    close,
    clear,
    setOpen: setIsOpen
  };
};

export const useTrendingSearches = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    const fetchTrending = async () => {
      try {
        const response = await searchService.getTrending();
        if (!cancelled) {
          setTrending(response?.events || []);
        }
      } catch (e) {
        if (!cancelled) setTrending([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrending();
    return () => { cancelled = true; };
  }, []);

  return { trending, loading };
};

export default useSearch;
