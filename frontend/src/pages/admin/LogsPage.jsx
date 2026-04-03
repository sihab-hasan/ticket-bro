// pages/admin/LogsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Download, Search, ChevronDown, ChevronRight, Clock, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import FilterBar from '@/components/shared/FilterBar';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';

const LOG_STYLES = {
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/5 border-red-500/20' },
  warn:  { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/5 border-yellow-500/20' },
  info:  { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/5 border-blue-500/20' },
  debug: { icon: Activity, color: 'text-gray-400', bg: 'bg-gray-500/5 border-gray-500/10' },
};

const LogEntry = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const style = LOG_STYLES[log.level] || LOG_STYLES.info;
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border p-3 ${style.bg} mb-2 cursor-pointer`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-2.5">
        <Icon className={`h-4 w-4 ${style.color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.color} border border-current/20`}>{log.level}</span>
            <span className="text-xs font-medium text-foreground truncate">{log.message}</span>
            <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />{formatDate(log.timestamp)}
            </span>
          </div>
          {log.service && <span className="text-[11px] text-muted-foreground mt-0.5 block">{log.service}</span>}
          {expanded && log.details && (
            <pre className="mt-2 text-[11px] font-mono bg-muted/50 rounded p-2 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
              {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
            </pre>
          )}
        </div>
        {(log.details || log.stack) && (
          expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
      </div>
    </div>
  );
};

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', level: '', service: '' });
  const LIMIT = 50;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      const d = await adminService.getSystemLogs(params);
      setLogs(d?.logs || []);
      setTotal(d?.total || 0);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="System Logs" subtitle={`${total.toLocaleString()} total log entries`}
        actions={[
          { label: 'Export', icon: Download, onClick: () => {}, variant: 'outline' },
          { label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' },
        ]}
      />

      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search log messages…' },
          { type: 'select', key: 'level', placeholder: 'All levels', options: [{ label: 'Error', value: 'error' }, { label: 'Warning', value: 'warn' }, { label: 'Info', value: 'info' }, { label: 'Debug', value: 'debug' }] },
          { type: 'select', key: 'service', placeholder: 'All services', options: [{ label: 'API', value: 'api' }, { label: 'Auth', value: 'auth' }, { label: 'Payment', value: 'payment' }, { label: 'Email', value: 'email' }] },
          { type: 'date', key: 'from', placeholder: 'From' },
          { type: 'date', key: 'to', placeholder: 'To' },
        ]}
        values={filters}
        onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClear={() => { setFilters({ search: '', level: '', service: '' }); setPage(1); }}
      />

      <div>
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2 rounded-xl" />)
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <Activity className="h-8 w-8 opacity-30 mb-2" />
              <p className="text-sm font-medium">No logs found</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log, i) => <LogEntry key={log._id || i} log={log} />)
        )}
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / LIMIT) || loading}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
