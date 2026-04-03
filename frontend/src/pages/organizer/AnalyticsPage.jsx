import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, RefreshCw, Ticket, TrendingUp, Users } from 'lucide-react';
import { organizersService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { formatPrice } from '@/utils/formatters';

const BarChart = ({ data = [], color = 'bg-primary', label }) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-2">
      {data.slice(0, 7).map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">
            {item.label}
          </span>
          <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
            <div
              className={`h-full ${color} rounded transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-20 text-right shrink-0">
            {label === 'revenue' ? formatPrice(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const mapDemographics = (demographics) => {
  if (Array.isArray(demographics)) {
    return demographics;
  }

  return Object.entries(demographics || {}).map(([label, value]) => ({
    label,
    percent: Number(value || 0),
  }));
};

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [overview, setOverview] = useState({});
  const [revenue, setRevenue] = useState({ months: [] });
  const [ticketStats, setTicketStats] = useState({});
  const [audience, setAudience] = useState({});

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      const params = eventFilter !== 'all' ? { eventId: eventFilter } : undefined;
      const [eventsResult, overviewResult, revenueResult, ticketResult, audienceResult] =
        await Promise.all([
          organizersService.getMyEvents({ page: 1, limit: 20 }),
          organizersService.getAnalyticsOverview(params),
          organizersService.getAnalyticsRevenue(params),
          organizersService.getAnalyticsTickets(params),
          organizersService.getAnalyticsAudience(params),
        ]);

      setEvents(eventsResult?.events || []);
      setOverview(overviewResult || {});
      setRevenue(revenueResult || { months: [] });
      setTicketStats(ticketResult || {});
      setAudience(audienceResult || {});
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load analytics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [eventFilter]);

  const selectedEvents = useMemo(() => {
    if (eventFilter === 'all') return events.slice(0, 5);
    return events.filter((event) => event._id === eventFilter);
  }, [eventFilter, events]);

  const revenueChartData = (revenue?.months || []).map((item) => ({
    label: item.label,
    value: Number(item.revenue || 0),
  }));

  const ticketChartData = [
    { label: 'Sold', value: Number(ticketStats?.sold || 0) },
    { label: 'Available', value: Number(ticketStats?.available || 0) },
    { label: 'Checked In', value: Number(ticketStats?.checkedIn || 0) },
    { label: 'Cancelled', value: Number(ticketStats?.cancelled || 0) },
  ];

  const demographics = mapDemographics(audience?.demographics);
  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(overview?.totalRevenue || 0),
      icon: TrendingUp,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Total Bookings',
      value:
        overview?.totalBookings?.toLocaleString?.() || overview?.totalBookings || '0',
      icon: Ticket,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Active Events',
      value:
        overview?.activeEvents?.toLocaleString?.() || overview?.activeEvents || '0',
      icon: BarChart3,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Repeat Attendees',
      value:
        audience?.repeatAttendees?.toLocaleString?.() ||
        audience?.repeatAttendees ||
        '0',
      icon: Users,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <PageHeader
          title="Analytics"
          subtitle="Organizer-facing metrics powered by the shared API layer"
          className="mb-0"
        />
        <div className="flex items-center gap-2">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="h-9 w-52">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>
                  {event.title.length > 28
                    ? `${event.title.slice(0, 28)}...`
                    : event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={fetchAnalytics}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-36 w-full" />
            ) : revenueChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No revenue data yet
              </p>
            ) : (
              <BarChart data={revenueChartData} color="bg-green-500" label="revenue" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Ticket Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <BarChart data={ticketChartData} color="bg-primary" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Audience Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">Total Attendees</p>
                    <p className="text-lg font-bold">
                      {audience?.totalAttendees?.toLocaleString?.() ||
                        audience?.totalAttendees ||
                        0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs text-muted-foreground">Repeat Attendees</p>
                    <p className="text-lg font-bold">
                      {audience?.repeatAttendees?.toLocaleString?.() ||
                        audience?.repeatAttendees ||
                        0}
                    </p>
                  </div>
                </div>
                {demographics.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No audience demographic data yet
                  </p>
                ) : (
                  demographics.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.percent}%</span>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                    </div>
                  ))
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              {eventFilter === 'all' ? 'Recent Event Performance' : 'Selected Event'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-36 w-full" />
            ) : selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No event data yet
              </p>
            ) : (
              selectedEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {Number(event.totalSold || 0)} sold
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
