// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, Ticket, CreditCard, TrendingUp, AlertCircle,
  ArrowRight, RefreshCw, UserCheck, Flag, Star, ShieldAlert,
  Activity, DollarSign, Clock, CheckCircle2, XCircle, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { StatusBadge, RoleBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { ROUTES } from '@/config/routes.config';
import { adminService } from '@/api';

// ── Revenue Mini Chart Bar ────────────────────────────────────────────────────
const MiniBar = ({ value, max, color = 'bg-primary' }) => (
  <div className="flex-1 flex flex-col items-center gap-1">
    <div className="w-full h-16 bg-muted rounded-md flex flex-col justify-end overflow-hidden">
      <div
        className={`w-full ${color} rounded-md transition-all duration-700`}
        style={{ height: `${Math.round((value / max) * 100)}%` }}
      />
    </div>
  </div>
);

// ── Pending Action Item ────────────────────────────────────────────────────────
const PendingItem = ({ icon: Icon, iconBg, iconColor, title, desc, time, href, onAction }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
      <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
        <Clock className="h-3 w-3" /> {time}
      </p>
    </div>
    {href && (
      <Link to={href}>
        <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
          Review <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </Link>
    )}
  </div>
);

// ── User Row ──────────────────────────────────────────────────────────────────
const UserRow = ({ user }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={user.avatar} />
      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
        {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">
        {user.firstName} {user.lastName}
      </p>
      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <RoleBadge role={user.role} />
      <StatusBadge status={user.status || 'active'} />
    </div>
  </div>
);

// ── Event Row ─────────────────────────────────────────────────────────────────
const EventRow = ({ event }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Calendar className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
      <p className="text-xs text-muted-foreground truncate">
        {event.organizer?.name || 'Unknown organizer'} · {formatDate(event.startDate, { timeStyle: undefined })}
      </p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <StatusBadge status={event.status} />
      <span className="text-xs text-muted-foreground">{event.ticketsSold || 0} sold</span>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getUsers({ limit: 8, sort: '-createdAt' }),
        adminService.getEvents({ limit: 8, sort: '-createdAt' }),
      ]);
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
      if (usersRes.status === 'fulfilled') {
        setRecentUsers(usersRes.value?.users || []);
      }
      if (eventsRes.status === 'fulfilled') {
        setRecentEvents(eventsRes.value?.events || []);
      }
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '—',
      change: stats?.userGrowth,
      icon: Users,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      href: ROUTES.ADMIN.USERS,
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents?.toLocaleString() || '—',
      change: stats?.eventGrowth,
      icon: Calendar,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      href: ROUTES.ADMIN.EVENTS,
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings?.toLocaleString() || '—',
      change: stats?.bookingGrowth,
      icon: Ticket,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      href: ROUTES.ADMIN.BOOKINGS,
    },
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue ? formatPrice(stats.totalRevenue) : '—',
      change: stats?.revenueGrowth,
      icon: DollarSign,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      href: ROUTES.ADMIN.PAYMENTS,
    },
  ];

  const pendingActions = [
    {
      icon: UserCheck, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500',
      title: `${stats?.pendingOrganizers || 0} Organizer Approvals`,
      desc: 'New organizer verification requests pending',
      time: 'Requires review', href: ROUTES.ADMIN.USERS,
    },
    {
      icon: Flag, iconBg: 'bg-red-500/10', iconColor: 'text-red-500',
      title: `${stats?.openReports || 0} Open Reports`,
      desc: 'User-submitted content reports',
      time: 'SLA: 24h', href: ROUTES.ADMIN.REPORTS,
    },
    {
      icon: CreditCard, iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500',
      title: `${stats?.pendingPayouts || 0} Pending Payouts`,
      desc: 'Organizer payout requests awaiting approval',
      time: 'Requires approval', href: ROUTES.ADMIN.PAYMENTS,
    },
    {
      icon: Calendar, iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-500',
      title: `${stats?.pendingEvents || 0} Events Pending Review`,
      desc: 'Events awaiting publication approval',
      time: 'Queue', href: ROUTES.ADMIN.EVENTS,
    },
  ];

  const revenueWeekly = stats?.revenueWeekly || [12, 18, 14, 22, 19, 25, 21];
  const maxRevenue = Math.max(...revenueWeekly);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Platform overview and management hub"
          className="mb-0"
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to={ROUTES.ADMIN.ANALYTICS}>
            <Button size="sm" className="h-9 font-bold">
              <Activity className="h-3.5 w-3.5 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert banner */}
      {(stats?.criticalAlerts || 0) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/8 border border-destructive/20">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {stats.criticalAlerts} critical alert{stats.criticalAlerts > 1 ? 's' : ''} require immediate attention
            </p>
            <p className="text-xs text-destructive/80 mt-0.5">
              Check system health and security for details
            </p>
          </div>
          <Link to={ROUTES.ADMIN.SYSTEM_LOGS}>
            <Button variant="destructive" size="sm" className="h-8">View</Button>
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.title} to={s.href} className="block no-underline">
            <StatCard {...s} loading={loading} changeLabel="vs last month" />
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — pending + revenue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold font-heading">
                  Weekly Revenue
                </CardTitle>
                <Link to={ROUTES.ADMIN.ANALYTICS} className="text-xs text-primary hover:underline font-medium">
                  Full report →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-24 mb-2">
                {revenueWeekly.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <MiniBar value={v} max={maxRevenue} color={i === revenueWeekly.length - 1 ? 'bg-primary' : 'bg-primary/40'} />
                    <span className="text-[10px] text-muted-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">This week</p>
                  <p className="text-lg font-extrabold font-heading text-foreground">
                    {formatPrice(stats?.weekRevenue || 0)}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">This month</p>
                  <p className="text-lg font-extrabold font-heading text-foreground">
                    {formatPrice(stats?.monthRevenue || 0)}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">All time</p>
                  <p className="text-lg font-extrabold font-heading text-foreground">
                    {formatPrice(stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Data Tabs */}
          <Card>
            <Tabs defaultValue="users">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <TabsList className="h-8">
                    <TabsTrigger value="users" className="text-xs">Recent Users</TabsTrigger>
                    <TabsTrigger value="events" className="text-xs">Recent Events</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="users" className="mt-0">
                  {recentUsers.length === 0 && !loading ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No recent users</p>
                  ) : (
                    recentUsers.map((u) => <UserRow key={u._id} user={u} />)
                  )}
                  <Link to={ROUTES.ADMIN.USERS} className="block mt-3">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View all users <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </TabsContent>
                <TabsContent value="events" className="mt-0">
                  {recentEvents.length === 0 && !loading ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No recent events</p>
                  ) : (
                    recentEvents.map((e) => <EventRow key={e._id} event={e} />)
                  )}
                  <Link to={ROUTES.ADMIN.EVENTS} className="block mt-3">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View all events <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right — pending actions + platform health */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold font-heading">
                  Action Required
                </CardTitle>
                <Badge variant="destructive" className="text-xs">
                  {pendingActions.reduce((a, p) => a + (parseInt(p.title) || 0), 0) || '—'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {pendingActions.map((p, i) => (
                <PendingItem key={i} {...p} />
              ))}
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold font-heading">
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Server Uptime', value: stats?.uptime || 99.9, color: 'bg-green-500' },
                { label: 'API Success Rate', value: stats?.apiSuccessRate || 98.2, color: 'bg-blue-500' },
                { label: 'Event Fill Rate', value: stats?.avgFillRate || 72, color: 'bg-primary' },
                { label: 'Payment Success', value: stats?.paymentSuccessRate || 96.5, color: 'bg-purple-500' },
              ].map((h) => (
                <div key={h.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{h.label}</span>
                    <span className="font-semibold text-foreground">{h.value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${h.color} rounded-full transition-all duration-700`}
                      style={{ width: `${h.value}%` }}
                    />
                  </div>
                </div>
              ))}

              <Separator />
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { label: 'Active Sessions', value: stats?.activeSessions || 0, icon: Users, color: 'text-blue-500' },
                  { label: 'Queue Jobs', value: stats?.queueJobs || 0, icon: Activity, color: 'text-purple-500' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-bold font-heading">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={ROUTES.ADMIN.SYSTEM_LOGS}>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs mt-1">
                  View System Logs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
