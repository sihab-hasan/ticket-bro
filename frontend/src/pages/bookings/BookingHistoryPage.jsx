// pages/bookings/BookingHistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, ChevronRight, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import FilterBar from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';
import { bookingService } from '@/api';

const BookingCard = ({ booking }) => (
  <Link to={ROUTES.BOOKINGS.DETAIL(booking.bookingRef || booking._id)} className="block no-underline">
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4 flex gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
          {booking.event?.coverImage ? (
            <img src={booking.event.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Ticket className="h-6 w-6 text-muted-foreground/50" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold font-heading truncate group-hover:text-primary transition-colors">{booking.event?.title || 'Unknown Event'}</p>
            <StatusBadge status={booking.status} className="shrink-0" />
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {booking.event?.startDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(booking.event.startDate, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            )}
            {booking.event?.venue?.city && (
              <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{booking.event.venue.city}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Ref: </span>
              <span className="text-xs font-mono font-bold text-primary">{booking.bookingRef || booking._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-600">{formatPrice(booking.totalAmount)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [filters, setFilters] = useState({ search: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const status = tab === 'cancelled' ? 'cancelled' : tab === 'past' ? 'confirmed' : undefined;
      const data = await bookingService.getMyBookings({ ...filters, status });
      setBookings(data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [tab, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div aria-label="My bookings" className="content-shell py-6 space-y-6 font-sans">
      <PageHeader title="My Bookings" subtitle="View and manage your ticket bookings"
        actions={[{ label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' }]}
      />
      <Tabs value={tab} onValueChange={(v) => { setTab(v); }}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-3">
          <FilterBar
            filters={[{ type: 'search', key: 'search', placeholder: 'Search bookings…' }]}
            values={filters}
            onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
            onClear={() => setFilters({ search: '' })}
          />
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
                <Ticket className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm font-semibold">No {tab} bookings</p>
                {tab === 'upcoming' && (
                  <Link to={ROUTES.BROWSE.ROOT} className="mt-3">
                    <Button size="sm" className="font-bold">Browse Events</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            bookings.map((b) => <BookingCard key={b._id} booking={b} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingHistoryPage;
