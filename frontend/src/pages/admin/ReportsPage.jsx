// pages/admin/ReportsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Eye, CheckCircle2, XCircle, MoreHorizontal, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import DetailDrawer, { DetailField, DetailSection } from '@/components/shared/DetailDrawer';
import { StatusBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const LIMIT = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      const d = await adminService.getReports(params);
      setReports(d?.reports || []);
      setTotal(d?.total || 0);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const openDrawer = async (id) => {
    setDrawerOpen(true); setDrawerLoading(true);
    try {
      const data = await adminService.getReportById(id);
      setSelected(data);
    } catch { toast.error('Failed to load report'); setDrawerOpen(false); }
    finally { setDrawerLoading(false); }
  };

  const handleResolve = async (id, action) => {
    setActionLoading(true);
    try {
      await adminService.updateReport(id, { status: action });
      toast.success(`Report ${action}`);
      fetch(); setConfirmAction(null); setDrawerOpen(false);
    } catch { toast.error('Failed to update report'); }
    finally { setActionLoading(false); }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (r) => <span className="text-xs font-semibold capitalize">{r.type?.replace('_', ' ')}</span> },
    { key: 'reporter', label: 'Reporter', render: (r) => <span className="text-sm">{r.reporter?.firstName} {r.reporter?.lastName}</span> },
    { key: 'target', label: 'Reported Content', render: (r) => <span className="text-sm text-muted-foreground truncate max-w-[160px] block">{r.targetTitle || r.targetId}</span> },
    {
      key: 'priority', label: 'Priority',
      render: (r) => <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.low}`}>{r.priority || 'low'}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Reported', render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.createdAt, { dateStyle: 'medium', timeStyle: undefined })}</span> },
  ];

  const rowActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => openDrawer(row._id)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
        {row.status === 'open' && (
          <>
            <DropdownMenuItem onClick={() => setConfirmAction({ id: row._id, action: 'resolved' })} className="text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Resolve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmAction({ id: row._id, action: 'dismissed' })} className="text-gray-500">
              <XCircle className="h-4 w-4 mr-2" /> Dismiss
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="Reports" subtitle={`${reports.filter((r) => r.status === 'open').length} open reports`}
        actions={[{ label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' }]}
      />
      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search reports…' },
          { type: 'select', key: 'status', placeholder: 'All statuses', options: [{ label: 'Open', value: 'open' }, { label: 'Resolved', value: 'resolved' }, { label: 'Dismissed', value: 'dismissed' }, { label: 'Escalated', value: 'escalated' }] },
          { type: 'select', key: 'type', placeholder: 'All types', options: [{ label: 'Event', value: 'event' }, { label: 'User', value: 'user' }, { label: 'Review', value: 'review' }, { label: 'Fraud', value: 'fraud' }] },
          { type: 'select', key: 'priority', placeholder: 'All priorities', options: [{ label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' }] },
        ]}
        values={filters}
        onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClear={() => { setFilters({ search: '', status: '', type: '' }); setPage(1); }}
      />
      <DataTable columns={columns} data={reports} actions={rowActions} loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No reports found" emptyIcon={Flag}
      />
      <DetailDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelected(null); }} loading={drawerLoading}
        title="Report Details" description={selected?.type}
        footer={selected?.status === 'open' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleResolve(selected._id, 'dismissed')}>Dismiss</Button>
            <Button size="sm" className="flex-1" onClick={() => handleResolve(selected._id, 'resolved')}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Resolve
            </Button>
          </div>
        )}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_STYLES[selected.priority] || PRIORITY_STYLES.low}`}>{selected.priority} priority</span>
            </div>
            <DetailSection title="Report Info">
              <DetailField label="Type" value={selected.type?.replace('_', ' ')} />
              <DetailField label="Reason" value={selected.reason} />
              <DetailField label="Description" value={selected.description} />
              <DetailField label="Reported At" value={formatDate(selected.createdAt)} />
            </DetailSection>
            <DetailSection title="Reporter">
              <DetailField label="Name" value={`${selected.reporter?.firstName} ${selected.reporter?.lastName}`} />
              <DetailField label="Email" value={selected.reporter?.email} />
            </DetailSection>
          </div>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.action === 'resolved' ? 'Resolve Report?' : 'Dismiss Report?'}
        description={confirmAction?.action === 'resolved' ? 'Mark this report as resolved and notify the reporter.' : 'Dismiss this report as no violation found.'}
        confirmLabel={confirmAction?.action === 'resolved' ? 'Resolve' : 'Dismiss'}
        variant={confirmAction?.action === 'dismissed' ? 'default' : 'default'}
        onConfirm={() => handleResolve(confirmAction?.id, confirmAction?.action)}
        loading={actionLoading}
      />
    </div>
  );
};

export default ReportsPage;
