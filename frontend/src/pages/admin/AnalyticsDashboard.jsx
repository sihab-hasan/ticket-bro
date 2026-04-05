// pages/admin/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Ticket, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { formatPrice } from '@/utils/formatters';
import { ROUTES } from '@/config/routes.config';
import { analyticsService } from '@/api';

// ── Simple bar chart visualization ───────────────────────────────────────────
const BarChart = ({ data = [], label, color = 'bg-primary' }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.slice(0, 8).map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
            <div
              className={`h-full ${color} rounded-md transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-16 text-right shrink-0">
            {label === 'revenue' ? formatPrice(item.value) : item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [overviewRes, revenueRes, ticketRes, eventRes, audienceRes] = await Promise.allSettled([
          analyticsService.getOverview({ period }),
          analyticsService.getRevenue({ period }),
          analyticsService.getTicketStats({ period }),
          analyticsService.getEventStats({ period }),
          analyticsService.getAudience({ period }),
        ]);
        setData({
          overview: overviewRes.status === 'fulfilled' ? overviewRes.value : null,
          revenue: revenueRes.status === 'fulfilled' ? revenueRes.value : null,
          tickets: ticketRes.status === 'fulfilled' ? ticketRes.value : null,
          events: eventRes.status === 'fulfilled' ? eventRes.value : null,
          audience: audienceRes.status === 'fulfilled' ? audienceRes.value : null,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [period]);

  const overviewStats = [
    { title: 'Total Revenue', value: data?.overview?.totalRevenue ? formatPrice(data.overview.totalRevenue) : '—', change: data?.overview?.revenueGrowth, icon: DollarSign, iconBg: 'bg-green-500/10', iconColor: 'text-green-500' },
    { title: 'New Users', value: data?.overview?.newUsers?.toLocaleString() || '—', change: data?.overview?.userGrowth, icon: Users, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { title: 'Tickets Sold', value: data?.overview?.ticketsSold?.toLocaleString() || '—', change: data?.overview?.ticketGrowth, icon: Ticket, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { title: 'Events Live', value: data?.overview?.activeEvents?.toLocaleString() || '—', change: data?.overview?.eventGrowth, icon: Calendar, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <PageHeader title="Analytics" subtitle="Platform performance insights" className="mb-0" />
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setPeriod(period)}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((s) => <StatCard key={s.title} {...s} loading={loading} />)}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Revenue by Category</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.revenue?.byCategory || []} label="revenue" color="bg-green-500" />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Revenue by Month</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.revenue?.byMonth || []} label="revenue" color="bg-primary" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Top Selling Events</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.tickets?.topEvents || []} color="bg-purple-500" />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Tickets by Type</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.tickets?.byType || []} color="bg-blue-500" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Events by Category</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.events?.byCategory || []} color="bg-orange-500" />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Event Status Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loading ? <Skeleton className="h-40 w-full" /> : [
                  { label: 'Published', value: data?.events?.published || 0, color: 'bg-green-500' },
                  { label: 'Pending', value: data?.events?.pending || 0, color: 'bg-yellow-500' },
                  { label: 'Draft', value: data?.events?.draft || 0, color: 'bg-gray-400' },
                  { label: 'Cancelled', value: data?.events?.cancelled || 0, color: 'bg-red-500' },
                ].map((s) => {
                  const tot = (data?.events?.published || 0) + (data?.events?.pending || 0) + (data?.events?.draft || 0) + (data?.events?.cancelled || 0) || 1;
                  return (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold">{s.value} ({Math.round((s.value / tot) * 100)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.value / tot) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Users by Country</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.audience?.byCountry || []} color="bg-teal-500" />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">User Growth</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  <BarChart data={data?.audience?.growth || []} color="bg-primary" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
