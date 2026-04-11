import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import { organizersService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { formatDate, formatPrice } from '@/utils/formatters';
import { ROUTES } from '@/app/AppRoutes';
import { useSocket } from '@/hooks';

const getEventKey = (event) => event?.slug || event?._id;

const OrganizerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [dashboard, eventsResult, bookingsResult, payoutsResult] =
        await Promise.all([
          organizersService.getDashboard(),
          organizersService.getMyEvents({ page: 1, limit: 4 }),
          organizersService.getMyBookings({ page: 1, limit: 4 }),
          organizersService.getPayouts({ page: 1, limit: 20 }),
        ]);

      const pendingPayout = (payoutsResult?.payouts || [])
        .filter((payout) => ['pending', 'processing'].includes(payout.status))
        .reduce((sum, payout) => sum + Number(payout.amount || 0), 0);

      setData({
        ...dashboard,
        pendingPayout,
        recentEvents: eventsResult?.events || [],
        recentBookings: bookingsResult?.bookings || [],
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSocketEvent = useCallback((event, data) => {
    if (event === 'organizer:dashboard.update') {
      if (data?.dashboard) {
        setData(prev => ({ ...prev, ...data.dashboard }));
      }
      // Handle event approval/rejection
      if (data?.eventApproved || data?.eventRejected) {
        fetchDashboard();
        if (data.eventApproved) {
          toast.success('Your event has been approved and published!');
        } else if (data.eventRejected) {
          toast.warning(`Your event was rejected: ${data.reason || 'Please check your event for details'}`);
        }
      }
    } else if (event === 'organizer:booking.new' || event === 'organizer:booking.cancelled') {
      fetchDashboard();
    } else if (event === 'organizer:checkin.new') {
      fetchDashboard();
    } else if (event === 'organizer:revenue.update' || event === 'organizer:ticket.sold' || event === 'organizer:ticket.refunded') {
      fetchDashboard();
    } else if (event === 'organizer:analytics.update') {
      fetchDashboard();
    }
  }, [fetchDashboard]);

  useSocket([
    'organizer:dashboard.update',
    'organizer:booking.new',
    'organizer:booking.cancelled',
    'organizer:checkin.new',
    'organizer:revenue.update',
    'organizer:ticket.sold',
    'organizer:ticket.refunded',
    'organizer:analytics.update',
  ], { onEvent: handleSocketEvent });

  const overview = data?.overview || {};
  const stats = [
    {
      title: 'Total Events',
      value: overview.totalEvents?.toLocaleString?.() || overview.totalEvents || '0',
      icon: Calendar,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Bookings',
      value:
        overview.totalBookings?.toLocaleString?.() || overview.totalBookings || '0',
      icon: Ticket,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(overview.totalRevenue || 0),
      icon: DollarSign,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Active Events',
      value:
        overview.activeEvents?.toLocaleString?.() || overview.activeEvents || '0',
      icon: TrendingUp,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <PageHeader
          title="My Dashboard"
          subtitle="Manage your events and track performance"
          className="mb-0"
        />
        <Link to={ROUTES.ORGANIZER.CREATE_EVENT}>
          <Button className="font-bold h-9">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {(data?.pendingPayout || 0) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
          <DollarSign className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Pending Payouts: {formatPrice(data.pendingPayout)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You have payout requests still being processed.
            </p>
          </div>
          <Link to={ROUTES.ORGANIZER.REVENUE}>
            <Button size="sm" className="h-8 font-bold">
              View Revenue
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold font-heading">
                  My Events
                </CardTitle>
                <Link
                  to={ROUTES.ORGANIZER.EVENTS}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : (data?.recentEvents || []).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No events yet
                  </p>
                  <Link to={ROUTES.ORGANIZER.CREATE_EVENT}>
                    <Button size="sm" className="font-bold">
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                (data?.recentEvents || []).map((event) => {
                  const eventKey = getEventKey(event);
                  const sold = Number(event.totalSold || 0);
                  const capacity = Number(event.totalCapacity || 0);

                  return (
                    <div
                      key={event._id}
                      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {event.coverImage ? (
                          <img
                            src={event.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Calendar className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(event.startDate, {
                              dateStyle: 'medium',
                              timeStyle: undefined,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-semibold">
                            {sold}
                            {capacity ? `/${capacity}` : ''}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            sold
                          </p>
                        </div>
                        <StatusBadge status={event.status} />
                      </div>
                      {eventKey && (
                        <Link to={ROUTES.ORGANIZER.EDIT_EVENT(eventKey)}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold font-heading">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  label: 'Create New Event',
                  icon: Plus,
                  href: ROUTES.ORGANIZER.CREATE_EVENT,
                  primary: true,
                },
                {
                  label: 'View All Bookings',
                  icon: Users,
                  href: ROUTES.ORGANIZER.BOOKINGS,
                },
                {
                  label: 'Revenue Report',
                  icon: DollarSign,
                  href: ROUTES.ORGANIZER.REVENUE,
                },
                {
                  label: 'Analytics',
                  icon: TrendingUp,
                  href: ROUTES.ORGANIZER.ANALYTICS,
                },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      action.primary
                        ? 'bg-primary/10 hover:bg-primary/20'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <action.icon
                      className={`h-4 w-4 shrink-0 ${
                        action.primary ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        action.primary ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {action.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold font-heading">
                  Recent Bookings
                </CardTitle>
                <Link
                  to={ROUTES.ORGANIZER.BOOKINGS}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(data?.recentBookings || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No bookings yet
                </p>
              ) : (
                (data?.recentBookings || []).slice(0, 4).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center gap-2.5 py-2 border-b border-border last:border-0"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-xs bg-muted font-bold">
                        {booking.user?.firstName?.[0]}
                        {booking.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {booking.event?.title}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-green-600 shrink-0">
                      {formatPrice(booking.totalAmount || 0)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
