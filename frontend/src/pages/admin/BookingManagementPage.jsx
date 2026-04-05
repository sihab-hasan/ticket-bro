// pages/admin/BookingManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, MoreHorizontal, Eye, XCircle, RefreshCcw, Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import DetailDrawer, { DetailField, DetailSection } from '@/components/shared/DetailDrawer';
import { StatusBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';
import { adminService } from '@/api';

const BookingManagementPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '' });
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
      const d = await adminService.getBookings(params);
      setBookings(d?.bookings || []);
      setTotal(d?.total || 0);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { if (bookingId) openDrawer(bookingId); }, [bookingId]);

  const openDrawer = async (id) => {
    setDrawerOpen(true); setDrawerLoading(true);
    try {
      const data = await adminService.getBookingById(id);
      setSelected(data);
    } catch { toast.error('Failed to load booking'); setDrawerOpen(false); }
    finally { setDrawerLoading(false); }
  };

  const closeDrawer = () => {
    setDrawerOpen(false); setSelected(null);
    if (bookingId) navigate(ROUTES.ADMIN.BOOKINGS);
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await adminService.cancelBooking(confirmAction.booking.bookingRef || confirmAction.booking._id);
      toast.success('Booking cancelled and refund initiated');
      fetch(); setConfirmAction(null); closeDrawer();
    } catch { toast.error('Failed to cancel booking'); }
    finally { setActionLoading(false); }
  };

  const handleRefund = async () => {
    setActionLoading(true);
    try {
      await adminService.refundBooking(confirmAction.booking.bookingRef || confirmAction.booking._id);
      toast.success('Refund processed successfully');
      fetch(); setConfirmAction(null);
    } catch { toast.error('Failed to process refund'); }
    finally { setActionLoading(false); }
  };

  const columns = [
    { key: 'bookingRef', label: 'Ref#', render: (r) => <span className="text-xs font-mono font-bold text-primary">{r.bookingRef || r._id?.slice(-8).toUpperCase()}</span> },
    { key: 'user', label: 'Customer', render: (r) => (<div><p className="text-sm font-semibold">{r.user?.firstName} {r.user?.lastName}</p><p className="text-xs text-muted-foreground">{r.user?.email}</p></div>) },
    { key: 'event', label: 'Event', render: (r) => <span className="text-sm truncate max-w-[160px] block">{r.event?.title || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'totalAmount', label: 'Amount', render: (r) => <span className="text-sm font-semibold">{formatPrice(r.totalAmount || 0)}</span> },
    { key: 'createdAt', label: 'Booked', render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.createdAt, { dateStyle: 'medium', timeStyle: undefined })}</span> },
  ];

  const rowActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => openDrawer(row._id)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
        <DropdownMenuSeparator />
        {row.status !== 'cancelled' && (
          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'cancel', booking: row })} className="text-orange-500">
            <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
          </DropdownMenuItem>
        )}
        {row.status === 'confirmed' && (
          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'refund', booking: row })} className="text-blue-500">
            <RefreshCcw className="h-4 w-4 mr-2" /> Process Refund
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="Booking Management" subtitle={`${total.toLocaleString()} total bookings`}
        actions={[{ label: 'Export', icon: Download, onClick: () => {}, variant: 'outline' }, { label: 'Refresh', icon: RefreshCcw, onClick: fetch, variant: 'outline' }]}
      />
      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search by ref or customer…' },
          { type: 'select', key: 'status', placeholder: 'All statuses', options: [{ label: 'Confirmed', value: 'confirmed' }, { label: 'Pending', value: 'pending' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Refunded', value: 'refunded' }] },
          { type: 'date', key: 'from', placeholder: 'From' },
          { type: 'date', key: 'to', placeholder: 'To' },
        ]}
        values={filters}
        onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClear={() => { setFilters({ search: '', status: '' }); setPage(1); }}
      />
      <DataTable columns={columns} data={bookings} actions={rowActions} loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No bookings found" emptyIcon={Ticket}
      />
      <DetailDrawer open={drawerOpen} onClose={closeDrawer} loading={drawerLoading}
        title={selected ? `Booking #${selected.bookingRef || selected._id?.slice(-8).toUpperCase()}` : 'Booking Details'}
        description={selected?.event?.title}
        footer={selected && selected.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmAction({ type: 'refund', booking: selected })}>
              <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Refund
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => setConfirmAction({ type: 'cancel', booking: selected })}>
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancel
            </Button>
          </div>
        )}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><StatusBadge status={selected.status} /></div>
            <DetailSection title="Booking">
              <DetailField label="Reference" value={selected.bookingRef} />
              <DetailField label="Booked On" value={formatDate(selected.createdAt)} />
              <DetailField label="Total Amount" value={formatPrice(selected.totalAmount)} />
              <DetailField label="Tickets" value={`${selected.quantity || 1} ticket(s)`} />
            </DetailSection>
            <DetailSection title="Customer">
              <DetailField label="Name" value={`${selected.user?.firstName} ${selected.user?.lastName}`} />
              <DetailField label="Email" value={selected.user?.email} />
            </DetailSection>
            <DetailSection title="Event">
              <DetailField label="Event" value={selected.event?.title} />
              <DetailField label="Date" value={formatDate(selected.event?.startDate)} />
              <DetailField label="Venue" value={selected.event?.venue?.name} />
            </DetailSection>
          </div>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.type === 'cancel' ? 'Cancel Booking?' : 'Process Refund?'}
        description={confirmAction?.type === 'cancel' ? 'Booking will be cancelled and refund initiated.' : 'Full refund will be processed to the original payment method.'}
        confirmLabel={confirmAction?.type === 'cancel' ? 'Cancel Booking' : 'Process Refund'}
        onConfirm={confirmAction?.type === 'cancel' ? handleCancel : handleRefund}
        loading={actionLoading}
      />
    </div>
  );
};

export default BookingManagementPage;
