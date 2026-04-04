// pages/admin/EventManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Eye, CheckCircle2, XCircle, MoreHorizontal, Star,
  MapPin, Users, Ticket, DollarSign, RefreshCw, Download,
  Clock, Globe, Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import DetailDrawer, { DetailField, DetailSection } from '@/components/shared/DetailDrawer';
import { StatusBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { adminService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const STATUS_OPTS = [
  { label: 'Published', value: 'published' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Draft', value: 'draft' },
  { label: 'Cancelled', value: 'cancelled' },
];

const EventManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', category: '', from: '', to: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const LIMIT = 15;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const d = await adminService.getEvents(params);
      setEvents(d?.events || []);
      setTotal(d?.total || 0);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { if (eventId) openDrawer(eventId); }, [eventId]);

  const openDrawer = async (id) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const data = await adminService.getEventBySlug(id);
      setSelectedEvent(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load event'));
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedEvent(null);
    if (eventId) navigate(ROUTES.ADMIN.EVENTS);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedEvent = await adminService.updateEvent(id, { status });
      toast.success(status === 'published' ? 'Event approved' : `Event ${status}`);
      fetchEvents();
      if (selectedEvent?._id === id) {
        setSelectedEvent(updatedEvent || { ...selectedEvent, status });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update event'));
    }
  };

  const handleFeatureToggle = async (row) => {
    try {
      const updatedEvent = await adminService.updateEvent(row._id, {
        isFeatured: !row.isFeatured,
      });
      toast.success(row.isFeatured ? 'Event removed from featured' : 'Event marked as featured');
      setEvents((current) => current.map((item) => (item._id === row._id ? { ...item, isFeatured: !row.isFeatured } : item)));
      if (selectedEvent?._id === row._id) {
        setSelectedEvent(updatedEvent || { ...selectedEvent, isFeatured: !row.isFeatured });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update featured status'));
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteEvent(confirmAction.event._id);
      toast.success('Event deleted');
      fetchEvents();
      setConfirmAction(null);
      closeDrawer();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete event'));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'event',
      label: 'Event',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0 max-w-xs">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0">
            {row.coverImage ? (
              <img src={row.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{row.title}</p>
            <p className="text-xs text-muted-foreground truncate">{row.category?.name || 'Uncategorized'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'organizer',
      label: 'Organizer',
      render: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[120px] block">
          {row.organizer?.name || row.organizer?.firstName || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(row.startDate, { dateStyle: 'medium', timeStyle: undefined })}
        </span>
      ),
    },
    {
      key: 'tickets',
      label: 'Tickets',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold">{row.ticketsSold || 0}</span>
          <span className="text-muted-foreground"> / {row.capacity || '∞'}</span>
        </div>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (row) => (
        <span className="text-sm font-semibold">
          {formatPrice(row.totalRevenue || 0)}
        </span>
      ),
    },
  ];

  const rowActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => openDrawer(row._id)}>
          <Eye className="h-4 w-4 mr-2" /> View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {row.status === 'pending_review' && (
          <>
            <DropdownMenuItem onClick={() => handleStatusChange(row._id, 'published')} className="text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row._id, 'rejected')} className="text-red-500">
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </DropdownMenuItem>
          </>
        )}
        {row.status === 'published' && (
          <DropdownMenuItem onClick={() => handleStatusChange(row._id, 'cancelled')} className="text-orange-500">
            Cancel Event
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleFeatureToggle(row)}>
          <Star className="h-4 w-4 mr-2" /> {row.isFeatured ? 'Remove Feature' : 'Mark as Featured'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setConfirmAction({ type: 'delete', event: row })}
          className="text-red-600"
        >
          Delete Event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader
        title="Event Management"
        subtitle={`${total.toLocaleString()} total events`}
        actions={[
          { label: 'Export', icon: Download, onClick: () => {}, variant: 'outline' },
          { label: 'Refresh', icon: RefreshCw, onClick: fetchEvents, variant: 'outline' },
        ]}
      />

      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search events…' },
          { type: 'select', key: 'status', placeholder: 'All statuses', options: STATUS_OPTS },
          { type: 'date', key: 'from', placeholder: 'From date' },
          { type: 'date', key: 'to', placeholder: 'To date' },
        ]}
        values={filters}
        onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClear={() => { setFilters({ search: '', status: '', category: '', from: '', to: '' }); setPage(1); }}
      />

      <DataTable
        columns={columns}
        data={events}
        actions={rowActions}
        loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No events found"
        emptyIcon={Calendar}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={selectedEvent?.title || 'Event Details'}
        description={selectedEvent?.category?.name}
        loading={drawerLoading}
        footer={
          selectedEvent?.status === 'pending_review' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/5"
                onClick={() => handleStatusChange(selectedEvent._id, 'rejected')}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => handleStatusChange(selectedEvent._id, 'published')}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
              </Button>
            </div>
          )
        }
      >
        {selectedEvent && (
          <div className="space-y-6">
            {selectedEvent.coverImage && (
              <img
                src={selectedEvent.coverImage}
                alt={selectedEvent.title}
                className="w-full h-40 object-cover rounded-xl"
              />
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={selectedEvent.status} />
              {selectedEvent.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
              {selectedEvent.isOnline && <Badge variant="secondary" className="text-xs">Online</Badge>}
            </div>

            <DetailSection title="Event Info">
              <DetailField label="Title" value={selectedEvent.title} />
              <DetailField label="Category" value={selectedEvent.category?.name} />
              <DetailField label="Organizer" value={selectedEvent.organizer?.name || selectedEvent.organizer?.firstName} />
              <DetailField label="Start Date" value={formatDate(selectedEvent.startDate)} />
              <DetailField label="End Date" value={formatDate(selectedEvent.endDate)} />
              <DetailField label="Venue" value={selectedEvent.venue?.name} />
              <DetailField label="Location" value={[selectedEvent.venue?.city, selectedEvent.venue?.country].filter(Boolean).join(', ')} />
            </DetailSection>

            <DetailSection title="Ticket Stats">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Capacity', value: selectedEvent.capacity || '—' },
                  { label: 'Sold', value: selectedEvent.ticketsSold || 0 },
                  { label: 'Revenue', value: formatPrice(selectedEvent.totalRevenue || 0) },
                  { label: 'Fill Rate', value: selectedEvent.capacity ? `${Math.round((selectedEvent.ticketsSold / selectedEvent.capacity) * 100)}%` : '—' },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-base font-extrabold font-heading">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {selectedEvent.capacity && (
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Capacity fill rate</span>
                    <span>{Math.round((selectedEvent.ticketsSold / selectedEvent.capacity) * 100)}%</span>
                  </div>
                  <Progress value={(selectedEvent.ticketsSold / selectedEvent.capacity) * 100} className="h-2" />
                </div>
              )}
            </DetailSection>
          </div>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title="Delete Event?"
        description="This will soft-delete the event, cancel it in the system, and hide it from normal listings."
        confirmLabel="Delete Event"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default EventManagementPage;
