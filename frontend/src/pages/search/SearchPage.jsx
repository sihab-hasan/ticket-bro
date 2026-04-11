// pages/search/SearchPage.jsx
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Calendar, MapPin, X, 
  ChevronLeft, ChevronRight, Loader2, Grid, List,
  ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/shared/common';
import { useLocation as useLocationCtx } from '@/context/LocationContext';
import searchService from '@/api/search.api';
import { getLocationQueryValue } from '@/lib/locationSelection';
import { normalizeEvent } from '@/utils/browse.utils';
import BrowseEventCard from "@/components/shared/cards/EventCard";
import Container from '@/components/layout/Container';

const EMPTY_FILTERS = {
  category: '',
  subcategory: '',
  city: '',
  location: '',
  startDate: '',
  endDate: '',
  minPrice: '',
  maxPrice: '',
  isFree: false,
  tags: [],
};

const FILTER_PARAM_KEYS = [
  'category',
  'subcategory',
  'city',
  'location',
  'startDate',
  'endDate',
  'minPrice',
  'maxPrice',
  'isFree',
  'tags',
];

const buildFiltersFromParams = (params) => ({
  category: params.get('category') || '',
  subcategory: params.get('subcategory') || '',
  city: params.get('city') || '',
  location: params.get('location') || '',
  startDate: params.get('startDate') || '',
  endDate: params.get('endDate') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  isFree: params.get('isFree') === 'true',
  tags: (params.get('tags') || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
});

const hasExplicitFilterParams = (params) =>
  FILTER_PARAM_KEYS.some((key) => params.has(key));

const areFiltersEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const countActiveFilters = (currentFilters) =>
  Object.values(currentFilters).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return Boolean(value);
  }).length;

const EventCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};

const FilterPanel = ({ facets, tempFilters, setTempFilters, onApply, onClear }) => {
  const updateTempFilter = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-1">
      {facets?.categories?.length > 0 && (
        <FilterSection title="Categories">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {facets.categories.slice(0, 10).map((cat) => (
              <label 
                key={cat._id || cat.slug} 
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${
                  tempFilters.category === (cat.slug || cat._id) 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  tempFilters.category === (cat.slug || cat._id) 
                    ? 'bg-primary border-primary' 
                    : 'border-border'
                }`}>
                  {tempFilters.category === (cat.slug || cat._id) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={tempFilters.category === (cat.slug || cat._id)}
                  onChange={(e) => updateTempFilter('category', e.target.checked ? (cat.slug || cat._id) : '')}
                />
                <span className="text-sm flex-1">{cat.name}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {facets?.cities?.length > 0 && (
        <FilterSection title="Locations">
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {facets.cities.slice(0, 8).map((city) => (
              <label 
                key={city.name} 
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${
                  tempFilters.city === city.name 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  tempFilters.city === city.name 
                    ? 'bg-primary border-primary' 
                    : 'border-border'
                }`}>
                  {tempFilters.city === city.name && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={tempFilters.city === city.name}
                  onChange={(e) => updateTempFilter('city', e.target.checked ? city.name : '')}
                />
                <span className="text-sm flex-1">{city.name}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {city.count}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Date Range">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">From</Label>
            <Input 
              type="date" 
              value={tempFilters.startDate} 
              onChange={(e) => updateTempFilter('startDate', e.target.value)} 
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">To</Label>
            <Input 
              type="date" 
              value={tempFilters.endDate} 
              onChange={(e) => updateTempFilter('endDate', e.target.value)} 
              className="h-9 text-sm"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Min (৳)</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={tempFilters.minPrice} 
                onChange={(e) => updateTempFilter('minPrice', e.target.value)} 
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Max (৳)</Label>
              <Input 
                type="number" 
                placeholder="Any" 
                value={tempFilters.maxPrice} 
                onChange={(e) => updateTempFilter('maxPrice', e.target.value)} 
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Event Type">
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Free Events Only</Label>
            <p className="text-xs text-muted-foreground">Show only events with no admission fee</p>
          </div>
          <Switch 
            checked={tempFilters.isFree} 
            onCheckedChange={(v) => updateTempFilter('isFree', v)} 
          />
        </div>
      </FilterSection>

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button variant="outline" className="flex-1 h-10 font-medium" onClick={onClear}>
          Clear All
        </Button>
        <Button className="flex-1 h-10 font-bold" onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLocation } = useLocationCtx();
  const implicitCityFilter = useMemo(
    () => getLocationQueryValue(selectedLocation) || '',
    [selectedLocation],
  );
  
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState(() => buildFiltersFromParams(searchParams));
  const [tempFilters, setTempFilters] = useState(() => buildFiltersFromParams(searchParams));

  const searchTimeoutRef = useRef(null);
  const LIMIT = 12;

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const data = await searchService.getFacets();
        setFacets(data);
      } catch (e) {
        console.error('Failed to load facets:', e);
      }
    };
    fetchFacets();
  }, []);

  useEffect(() => {
    const nextQuery = searchParams.get('q') || '';
    const nextFilters = buildFiltersFromParams(searchParams);

    setQuery((current) => (current === nextQuery ? current : nextQuery));

    if (!hasExplicitFilterParams(searchParams)) {
      return;
    }

    setFilters((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
    setTempFilters((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
  }, [searchParams]);

  const runSearch = useCallback(async ({
    searchQuery,
    searchFilters,
    searchSort,
    searchPage,
    append = false,
    showLoadingState = true,
  }) => {
    if (showLoadingState) {
      setLoading(true);
    }

    try {
      const params = {
        page: searchPage,
        limit: LIMIT,
        sort: searchSort,
      };

      if (searchQuery && searchQuery.trim() && searchQuery.trim().length >= 2) {
        params.q = searchQuery.trim();
      }

      if (searchFilters.category) params.category = searchFilters.category;
      if (searchFilters.subcategory) params.subcategory = searchFilters.subcategory;
      if (searchFilters.city) params.city = searchFilters.city;
      if (searchFilters.location) params.location = searchFilters.location;
      if (!searchFilters.city && !searchFilters.location && implicitCityFilter) {
        params.city = implicitCityFilter;
      }
      if (searchFilters.startDate) params.startDate = searchFilters.startDate;
      if (searchFilters.endDate) params.endDate = searchFilters.endDate;

      const minPrice = Number(searchFilters.minPrice);
      const maxPrice = Number(searchFilters.maxPrice);
      if (!Number.isNaN(minPrice) && searchFilters.minPrice !== '' && minPrice >= 0) {
        params.minPrice = minPrice;
      }
      if (!Number.isNaN(maxPrice) && searchFilters.maxPrice !== '' && maxPrice >= 0) {
        params.maxPrice = maxPrice;
      }

      if (searchFilters.isFree === true) {
        params.isFree = true;
      }

      if (Array.isArray(searchFilters.tags) && searchFilters.tags.length > 0) {
        params.tags = searchFilters.tags.join(',');
      }

      const data = await searchService.search(params);
      const normalizedEvents = (data.events || []).map(normalizeEvent);

      if (append) {
        setResults((current) => [...current, ...normalizedEvents]);
      } else {
        setResults(normalizedEvents);
      }

      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      return data;
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error('Search error:', error);
      throw error;
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [implicitCityFilter]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setPage(1);
    searchTimeoutRef.current = window.setTimeout(() => {
      runSearch({
        searchQuery: query,
        searchFilters: filters,
        searchSort: sort,
        searchPage: 1,
      });
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, implicitCityFilter, query, runSearch, sort]);

  const handleSearch = (searchQuery = query) => {
    setQuery(searchQuery);
    const nextParams = new URLSearchParams(searchParams);

    if (searchQuery) {
      nextParams.set('q', searchQuery);
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { ...EMPTY_FILTERS };
    setFilters(emptyFilters);
    setTempFilters(emptyFilters);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoadingMore(true);
    const next = page + 1;
    runSearch({
      searchQuery: query,
      searchFilters: filters,
      searchSort: sort,
      searchPage: next,
      append: true,
      showLoadingState: false,
    })
      .then(() => {
        setPage(next);
      })
      .finally(() => setLoadingMore(false));
  };

  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  const sortOptions = [
    { value: '-createdAt', label: 'Most Recent' },
    { value: '-startDate', label: 'Date: Soonest' },
    { value: 'startDate', label: 'Date: Latest' },
    { value: '-totalSold', label: 'Most Popular' },
    { value: '-averageRating', label: 'Top Rated' },
    { value: '-minPrice', label: 'Price: High to Low' },
    { value: 'minPrice', label: 'Price: Low to High' },
  ];

  const showInitialState = !query && !activeFiltersCount && results.length === 0 && !loading;

  return (
    <Container aria-label="Search events" className="py-4 space-y-5 font-sans">
      {/* Hero Search Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">Find Your Next Experience</h1>
          <p className="text-muted-foreground text-sm">Discover concerts, workshops, meetups and more</p>
          
          <div className="relative max-w-lg mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              value={query} 
              onChange={(e) => handleSearch(e.target.value)} 
              placeholder="Search events, venues, organizers..." 
              className="h-14 pl-12 pr-24 text-base rounded-2xl border-2 border-border/50 bg-background/80 backdrop-blur shadow-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {query && !loading && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleSearch('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {showInitialState && total > 0 && (
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{total.toLocaleString()} events</span>
            </div>
            {facets?.cities?.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{facets.cities.length} cities</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters & Sort Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-muted/30 -mx-4 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Searching...</span>
          ) : total > 0 ? (
            <span><span className="font-bold text-foreground">{total.toLocaleString()}</span> events found</span>
          ) : (
            <span>No events found</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              <Grid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 relative font-semibold">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 text-[10px] bg-primary text-black flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto p-0">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-bold">Filter Events</h2>
                <p className="text-sm text-muted-foreground">Refine your search results</p>
              </div>
              <div className="p-4">
                <FilterPanel 
                  facets={facets} 
                  tempFilters={tempFilters}
                  setTempFilters={setTempFilters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
              {filters.category && (
            <Badge variant="secondary" className="gap-1.5 pl-2">
              {facets?.categories?.find(c => c.slug === filters.category)?.name || filters.category}
              <button onClick={() => { 
                const updated = { ...filters, category: '' };
                setFilters(updated);
                setTempFilters(updated);
              }} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.city && (
            <Badge variant="secondary" className="gap-1.5 pl-2">
              {filters.city}
              <button onClick={() => { 
                const updated = { ...filters, city: '' };
                setFilters(updated);
                setTempFilters(updated);
              }} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.isFree && (
            <Badge variant="secondary" className="gap-1.5 pl-2">
              Free
              <button onClick={() => { 
                const updated = { ...filters, isFree: false };
                setFilters(updated);
                setTempFilters(updated);
              }} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1.5 pl-2">
              From: {filters.startDate}
              <button onClick={() => { 
                const updated = { ...filters, startDate: '' };
                setFilters(updated);
                setTempFilters(updated);
              }} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="gap-1.5 pl-2">
              ৳{filters.minPrice || '0'} - ৳{filters.maxPrice || 'Any'}
              <button onClick={() => { 
                const updated = { ...filters, minPrice: '', maxPrice: '' };
                setFilters(updated);
                setTempFilters(updated);
              }} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {loading && page === 1 ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="h-10 w-10 opacity-30" />
            </div>
            <p className="text-lg font-semibold">No events found</p>
            <p className="text-sm mt-1 text-center max-w-md">
              {query ? `No results for "${query}". Try different keywords or adjust filters.` : 'Try adjusting your filters or search terms'}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={handleClearFilters}>Clear Filters</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {results.map((event) => (
              <BrowseEventCard key={event._id || event.id} event={event} variant={viewMode === 'list' ? 'horizontal' : 'grid'} showBadge={true} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (page <= 1 || loading) return;
                  const previousPage = page - 1;
                  setPage(previousPage);
                  runSearch({
                    searchQuery: query,
                    searchFilters: filters,
                    searchSort: sort,
                    searchPage: previousPage,
                  });
                }}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoadMore}
                disabled={page >= totalPages || loading || loadingMore}
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {page < totalPages && (
            <Button variant="outline" className="w-full font-semibold" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load More Events
            </Button>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;
