// pages/admin/SystemHealthPage.jsx
import React, { useState, useEffect } from 'react';
import { Server, Database, Zap, Activity, RefreshCw, CheckCircle2, AlertCircle, XCircle, Clock, HardDrive, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';

const HealthStatus = ({ status }) => {
  if (status === 'healthy') return <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" />Healthy</span>;
  if (status === 'degraded') return <span className="flex items-center gap-1.5 text-yellow-600 text-xs font-semibold"><AlertCircle className="h-3.5 w-3.5" />Degraded</span>;
  return <span className="flex items-center gap-1.5 text-red-500 text-xs font-semibold"><XCircle className="h-3.5 w-3.5" />Down</span>;
};

const MetricCard = ({ icon: Icon, label, value, unit, status, color = 'text-primary', bgColor = 'bg-primary/10', progress }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgColor}`}><Icon className={`h-4 w-4 ${color}`} /></div>
        {status && <HealthStatus status={status} />}
      </div>
      <p className="text-2xl font-extrabold font-heading">{value}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span></p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {progress != null && <Progress value={progress} className={`mt-3 h-1.5 ${progress > 80 ? '[&>div]:bg-red-500' : progress > 60 ? '[&>div]:bg-yellow-500' : ''}`} />}
    </CardContent>
  </Card>
);

const SystemHealthPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemHealth();
      setHealth(data);
      setLastCheck(new Date());
    } catch { toast.error('Failed to fetch health data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); const t = setInterval(fetch, 30000); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="System Health" subtitle={`Last checked: ${lastCheck.toLocaleTimeString()}`} className="mb-0" />
        <Button variant="outline" size="sm" onClick={fetch} disabled={loading} className="h-9">
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />) : [
          { icon: Server, label: 'Server Uptime', value: health?.uptime || '99.9', unit: '%', status: 'healthy', color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { icon: Cpu, label: 'CPU Usage', value: health?.cpuUsage || 24, unit: '%', progress: health?.cpuUsage || 24, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { icon: HardDrive, label: 'Memory Usage', value: health?.memoryUsage || 62, unit: '%', progress: health?.memoryUsage || 62, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
          { icon: Activity, label: 'API Req/min', value: health?.requestsPerMinute || 0, unit: 'rpm', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
        ].map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Service Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />) :
              [
                { name: 'API Server', status: health?.api || 'healthy', latency: health?.apiLatency || 45 },
                { name: 'Database (MongoDB)', status: health?.database || 'healthy', latency: health?.dbLatency || 12 },
                { name: 'Cache (Redis)', status: health?.cache || 'healthy', latency: health?.cacheLatency || 3 },
                { name: 'Email Service', status: health?.email || 'healthy' },
                { name: 'Payment Gateway', status: health?.payment || 'healthy' },
                { name: 'File Storage (S3)', status: health?.storage || 'healthy' },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <span className="text-sm font-medium">{s.name}</span>
                  <div className="flex items-center gap-3">
                    {s.latency && <span className="text-xs text-muted-foreground">{s.latency}ms</span>}
                    <HealthStatus status={s.status} />
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Recent Errors</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> :
              (health?.recentErrors || []).length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm font-medium">No recent errors</p>
                </div>
              ) : (health?.recentErrors || []).map((err, i) => (
                <div key={i} className="py-2 border-b border-border last:border-0">
                  <p className="text-xs font-mono text-red-500">{err.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />{err.time}</p>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealthPage;
