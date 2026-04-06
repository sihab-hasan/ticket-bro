import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
} from 'lucide-react';
import { eventsService, organizersService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import { ConfirmDialog, StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { formatDate, formatPrice } from '@/utils/formatters';

const LIMIT = 12;

const getEventKey = (event) => event?.slug || event?._id;

const formatEventPrice = (event) => {
  if (event?.isFree) return 'Free';

  const minPrice = Number(event?.minPrice || 0);
  const maxPrice = Number(event?.maxPrice || 0);

  if (maxPrice > minPrice) {
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }

  return formatPrice(minPrice);
};

const EventManagementPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionKey, setActionKey] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);

    try {
      const result = await organizersService.getMyEvents({
        page,
        limit: LIMIT,
        ...filters,
      });

      setEvents(result?.events || []);
      setTotal(result?.total || result?.pagination?.total || 0);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);

    try {
      await eventsService.deleteEvent(getEventKey(deleteConfirm));
      toast.success('Event deleted');
      setDeleteConfirm(null);
      fetchEvents();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete event'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitForReview = async (row) => {
    const eventKey = getEventKey(row);
    if (!eventKey) return;

    setActionKey(`submit:${eventKey}`);

    try {
      await eventsService.publishEvent(eventKey);
      toast.success('Event submitted for review');
      fetchEvents();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit draft for review'));
    } finally {
      setActionKey('');
    }
  };

  const columns = [
    {
      key: 'event',
      label: 'Event',
      render: (row) => (
        <div className="flex items-center gap-3 max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
            {row.coverImage ? (
              <img
                src={row.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Calendar className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{row.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(row.startDate, {
                dateStyle: 'medium',
                timeStyle: undefined,
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'sold',
      label: 'Sold',
      render: (row) => {
        const sold = Number(row.totalSold || 0);
        const capacity = Number(row.totalCapacity || 0);

        return (
          <div className="space-y-1 min-w-[80px]">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">{sold}</span>
              <span className="text-muted-foreground">
                {capacity ? `/${capacity}` : '/∞'}
              </span>
            </div>
            {capacity > 0 && (
              <Progress value={(sold / capacity) * 100} className="h-1.5" />
            )}
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => (
        <span className="text-sm font-semibold text-green-600">
          {formatEventPrice(row)}
        </span>
      ),
    },
  ];

  const rowActions = (row) => {
    const eventKey = getEventKey(row);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={ROUTES.ORGANIZER.EDIT_EVENT(eventKey)}>
              <Edit className="h-4 w-4 mr-2" />
              {row.status === 'draft' ? 'Continue Draft' : 'Edit Event'}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={ROUTES.ORGANIZER.TICKET_MGMT(eventKey)}>
              <Ticket className="h-4 w-4 mr-2" />
              Manage Tickets
            </Link>
          </DropdownMenuItem>
          {['draft', 'rejected'].includes(row.status) && (
            <DropdownMenuItem
              onClick={() => handleSubmitForReview(row)}
              disabled={actionKey === `submit:${eventKey}`}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {actionKey === `submit:${eventKey}` ? 'Submitting...' : 'Submit for Review'}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteConfirm(row)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader
        title="My Events"
        subtitle={`${total.toLocaleString()} events`}
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: fetchEvents,
            variant: 'outline',
          },
          {
            label: 'Create Event',
            icon: Plus,
            onClick: () => navigate(ROUTES.ORGANIZER.CREATE_EVENT),
          },
        ]}
      />

      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search events…' },
          {
            type: 'select',
            key: 'status',
            placeholder: 'All statuses',
            options: [
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
              { label: 'Pending', value: 'pending' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
        values={filters}
        onChange={(key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ search: '', status: '' });
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={events}
        actions={rowActions}
        loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No events yet. Create your first event."
        emptyIcon={Calendar}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Event?"
        description="This will soft-delete the event, cancel it, and deactivate its ticket types."
        confirmLabel="Delete Event"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
};

export default EventManagementPage;
