// pages/admin/PaymentManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, RefreshCcw, Download, MoreHorizontal, Eye, CheckCircle2, AlertCircle, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import DetailDrawer, { DetailField, DetailSection } from '@/components/shared/DetailDrawer';
import StatCard from '@/components/shared/StatCard';
import { StatusBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { adminService } from '@/api';

const PaymentManagementPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(null);
  const [confirmPayout, setConfirmPayout] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const LIMIT = 15;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      const [paymentsRes, payoutsRes, statsRes] = await Promise.allSettled([
        adminService.getPayments(params),
        adminService.getPayouts({ status: 'pending', limit: 10 }),
        adminService.getDashboardStats(),
      ]);
      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value?.payments || []);
        setTotal(paymentsRes.value?.total || 0);
      }
      if (payoutsRes.status === 'fulfilled') {
        setPayouts(payoutsRes.value?.payouts || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (paymentId) openDrawer(paymentId); }, [paymentId]);

  const openDrawer = async (id) => {
    setDrawerOpen(true); setDrawerLoading(true);
    try {
      const data = await adminService.getPaymentById(id);
      setSelected(data);
    } catch { toast.error('Failed to load payment'); setDrawerOpen(false); }
    finally { setDrawerLoading(false); }
  };

  const closeDrawer = () => {
    setDrawerOpen(false); setSelected(null);
    if (paymentId) navigate(ROUTES.ADMIN.PAYMENTS);
  };

  const handleRefund = async () => {
    setActionLoading(true);
    try {
      await adminService.refundPayment(confirmRefund._id);
      toast.success('Refund processed');
      fetchAll(); setConfirmRefund(null); closeDrawer();
    } catch { toast.error('Refund failed'); }
    finally { setActionLoading(false); }
  };

  const handleApprovePayout = async () => {
    setActionLoading(true);
    try {
      await adminService.updatePayout(confirmPayout._id, { status: 'approved' });
      toast.success('Payout approved');
      fetchAll(); setConfirmPayout(null);
    } catch { toast.error('Failed to approve payout'); }
    finally { setActionLoading(false); }
  };

  const paymentColumns = [
    { key: 'id', label: 'Payment ID', render: (r) => <span className="text-xs font-mono font-bold">{r._id?.slice(-10).toUpperCase()}</span> },
    { key: 'user', label: 'Customer', render: (r) => <div><p className="text-sm font-semibold">{r.user?.firstName} {r.user?.lastName}</p><p className="text-xs text-muted-foreground">{r.user?.email}</p></div> },
    { key: 'amount', label: 'Amount', render: (r) => <span className="text-sm font-bold text-green-600">{formatPrice(r.amount)}</span> },
    { key: 'method', label: 'Method', render: (r) => <span className="text-xs capitalize">{r.paymentMethod || 'stripe'}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Date', render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.createdAt, { dateStyle: 'medium', timeStyle: undefined })}</span> },
  ];

  const payoutColumns = [
    { key: 'organizer', label: 'Organizer', render: (r) => <div><p className="text-sm font-semibold">{r.organizer?.name || r.organizer?.firstName}</p><p className="text-xs text-muted-foreground">{r.organizer?.email}</p></div> },
    { key: 'amount', label: 'Amount', render: (r) => <span className="text-sm font-bold">{formatPrice(r.amount)}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'requestedAt', label: 'Requested', render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.requestedAt, { dateStyle: 'medium', timeStyle: undefined })}</span> },
  ];

  const paymentActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openDrawer(row._id)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
        {row.status === 'completed' && (
          <DropdownMenuItem onClick={() => setConfirmRefund(row)} className="text-orange-500">
            <RefreshCcw className="h-4 w-4 mr-2" /> Refund
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const payoutActions = (row) => row.status === 'pending' ? (
    <Button size="sm" className="h-7 text-xs font-bold" onClick={() => setConfirmPayout(row)}>
      <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
    </Button>
  ) : null;

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="Payment Management" subtitle="Transactions, refunds & organizer payouts"
        actions={[{ label: 'Export', icon: Download, onClick: () => {}, variant: 'outline' }, { label: 'Refresh', icon: RefreshCcw, onClick: fetchAll, variant: 'outline' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, iconBg: 'bg-green-500/10', iconColor: 'text-green-500' },
          { title: 'This Month', value: formatPrice(stats?.monthRevenue || 0), icon: ArrowUpRight, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
          { title: 'Pending Payouts', value: formatPrice(stats?.pendingPayoutAmount || 0), icon: ArrowDownLeft, iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500' },
          { title: 'Refunds Issued', value: formatPrice(stats?.totalRefunds || 0), icon: RefreshCcw, iconBg: 'bg-red-500/10', iconColor: 'text-red-500' },
        ].map((s) => <StatCard key={s.title} {...s} loading={loading} />)}
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">All Payments</TabsTrigger>
          <TabsTrigger value="payouts">
            Payout Requests
            {payouts.filter((p) => p.status === 'pending').length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {payouts.filter((p) => p.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <FilterBar
            filters={[
              { type: 'search', key: 'search', placeholder: 'Search payments…' },
              { type: 'select', key: 'status', placeholder: 'All statuses', options: [{ label: 'Completed', value: 'completed' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }, { label: 'Refunded', value: 'refunded' }] },
              { type: 'select', key: 'method', placeholder: 'All methods', options: [{ label: 'Stripe', value: 'stripe' }, { label: 'PayPal', value: 'paypal' }, { label: 'Razorpay', value: 'razorpay' }] },
            ]}
            values={filters}
            onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
            onClear={() => { setFilters({ search: '', status: '' }); setPage(1); }}
          />
          <DataTable columns={paymentColumns} data={payments} actions={paymentActions} loading={loading}
            pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
            emptyMessage="No payments found" emptyIcon={CreditCard}
          />
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <DataTable columns={payoutColumns} data={payouts} actions={payoutActions} loading={loading}
            emptyMessage="No pending payouts" emptyIcon={DollarSign}
          />
        </TabsContent>
      </Tabs>

      <DetailDrawer open={drawerOpen} onClose={closeDrawer} loading={drawerLoading}
        title={selected ? `Payment ${selected._id?.slice(-10).toUpperCase()}` : 'Payment Details'}
        description={selected?.status}
        footer={selected?.status === 'completed' && (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setConfirmRefund(selected)}>
            <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Process Refund
          </Button>
        )}
      >
        {selected && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
              <p className="text-3xl font-extrabold font-heading text-green-600">{formatPrice(selected.amount)}</p>
              <StatusBadge status={selected.status} className="mt-2" />
            </div>
            <DetailSection title="Payment Info">
              <DetailField label="Payment ID" value={selected._id} />
              <DetailField label="Method" value={selected.paymentMethod} />
              <DetailField label="Gateway Ref" value={selected.gatewayTransactionId} />
              <DetailField label="Date" value={formatDate(selected.createdAt)} />
              <DetailField label="Platform Fee" value={formatPrice(selected.platformFee)} />
              <DetailField label="Net Amount" value={formatPrice((selected.amount || 0) - (selected.platformFee || 0))} />
            </DetailSection>
            <DetailSection title="Customer">
              <DetailField label="Name" value={`${selected.user?.firstName} ${selected.user?.lastName}`} />
              <DetailField label="Email" value={selected.user?.email} />
            </DetailSection>
          </div>
        )}
      </DetailDrawer>

      <ConfirmDialog open={!!confirmRefund} onOpenChange={() => setConfirmRefund(null)} title="Process Refund?"
        description={`Refund of ${formatPrice(confirmRefund?.amount)} will be sent to the original payment method.`}
        confirmLabel="Process Refund" onConfirm={handleRefund} loading={actionLoading}
      />
      <ConfirmDialog open={!!confirmPayout} onOpenChange={() => setConfirmPayout(null)} title="Approve Payout?"
        description={`${formatPrice(confirmPayout?.amount)} will be transferred to the organizer's bank account.`}
        confirmLabel="Approve Payout" variant="default" onConfirm={handleApprovePayout} loading={actionLoading}
      />
    </div>
  );
};

export default PaymentManagementPage;
