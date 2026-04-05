// pages/search/SearchResultsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Calendar, MapPin, Ticket, Star, X, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { searchService } from '@/api';
import { getEventImage, getEventLocationLabel, getEventPriceLabel } from '@/utils/event-card';
import Container from '@/components/layout/Container';

const EventCard = ({ event }) => {
  const imageSrc = getEventImage(event);
  const locationLabel = getEventLocationLabel(event);
  const priceLabel = getEventPriceLabel(event);

  return (
    <Link to={ROUTES.EVENT(event.slug || event._id)} className="block no-underline">
      <Card className="group hover:shadow-md transition-all overflow-hidden cursor-pointer">
        <div className="h-36 overflow-hidden bg-muted">
          {imageSrc ? (
            <img src={imageSrc} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Ticket className="h-8 w-8 text-muted-foreground/30" /></div>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-sm font-bold font-heading line-clamp-1 group-hover:text-primary transition-colors">{event.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.startDate, { dateStyle: 'medium', timeStyle: undefined })}</span>
            {locationLabel && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{locationLabel}</span>}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            {event.avgRating > 0 && <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-xs font-semibold">{event.avgRating.toFixed(1)}</span></div>}
            <p className="text-sm font-bold text-primary ml-auto">{priceLabel}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('relevance');
  const [filters, setFilters] = useState({ freeOnly: false, category: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const search = useCallback(async (q, s, f, p) => {
    if (!q?.trim()) return;
    setLoading(true);
    try {
      const params = { q, sort: s, page: p, limit: LIMIT, ...f };
      const data = await searchService.search(params);
      if (p === 1) setResults(data.results || []);
      else setResults((prev) => [...prev, ...(data.results || [])]);
      setTotal(data.total || data.pagination?.total || 0);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q); search(q, sort, filters, 1); setPage(1);
  }, [searchParams.get('q')]);

  const handleSearch = () => { if (query.trim()) { setSearchParams({ q: query }); setPage(1); } };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const activeFilters = Object.values(filters).filter((v) => v && v !== false).length;

  return (
    <Container className="py-6 space-y-5 font-sans">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search events…" className="h-10 pl-9" />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()} className="h-10 font-bold px-5 shrink-0">Search</Button>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Searching…' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''} for `}
          {!loading && <span className="font-bold text-foreground">"{searchParams.get('q')}"</span>}
        </p>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => { setSort(v); search(searchParams.get('q'), v, filters, 1); setPage(1); }}>
            <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="date">Date: Soonest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 relative font-semibold">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />Filters
                {activeFilters > 0 && <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 text-[10px] bg-primary text-black flex items-center justify-center">{activeFilters}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Select value={filters.category} onValueChange={(v) => setFilter('category', v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="All categories" /></SelectTrigger>
                    <SelectContent>
                      {['music', 'tech', 'sports', 'arts', 'food', 'health', 'gaming', 'education'].map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date From</Label>
                  <Input type="date" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date To</Label>
                  <Input type="date" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} className="h-9" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm">Free Events Only</Label>
                  <Switch checked={filters.freeOnly} onCheckedChange={(v) => setFilter('freeOnly', v)} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => { setFilters({ freeOnly: false, category: '', dateFrom: '', dateTo: '' }); }}>Clear All</Button>
                  <Button className="flex-1 font-bold" onClick={() => { search(searchParams.get('q'), sort, filters, 1); setPage(1); }}>Apply</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Results grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : results.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-muted-foreground">
          <Search className="h-10 w-10 opacity-20 mb-3" />
          <p className="text-sm font-semibold">No events found</p>
          <p className="text-xs mt-1">Try different keywords or clear filters</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
          {results.length < total && (
            <Button variant="outline" className="w-full font-semibold" onClick={() => { const next = page + 1; search(searchParams.get('q'), sort, filters, next); setPage(next); }} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}Load More
            </Button>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchResultsPage;
