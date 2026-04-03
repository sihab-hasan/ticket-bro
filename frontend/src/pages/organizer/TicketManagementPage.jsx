import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
} from 'lucide-react';
import { eventsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { formatPrice } from '@/utils/formatters';

const EMPTY_TICKET = {
  name: '',
  price: '',
  quantity: '',
  type: 'general',
  description: '',
  salesStart: '',
  salesEnd: '',
  isActive: true,
};

const TICKET_TYPES = [
  'general',
  'vip',
  'early_bird',
  'group',
  'backstage',
  'online',
];

const TicketManagementPage = () => {
  const { eventId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_TICKET);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!eventId) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const result = await eventsService.getTicketTypes(eventId);
      setTickets(result || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load ticket types'));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openCreate = () => {
    setForm(EMPTY_TICKET);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (ticket) => {
    setForm({
      name: ticket.name || '',
      price: ticket.price ?? '',
      quantity: ticket.quantity ?? '',
      type: ticket.type || 'general',
      description: ticket.description || '',
      salesStart: ticket.salesStart?.split('T')[0] || '',
      salesEnd: ticket.salesEnd?.split('T')[0] || '',
      isActive: ticket.isActive ?? true,
    });
    setEditingId(ticket._id);
    setDialogOpen(true);
  };

  const setValue = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    if (!eventId) {
      toast.error('Open this page from a specific event to manage ticket types');
      return;
    }

    if (!form.name || !form.quantity) {
      toast.error('Name and quantity are required');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || undefined,
        type: form.type,
        price: Number.parseFloat(form.price || 0),
        quantity: Number.parseInt(form.quantity, 10),
        salesStart: form.salesStart || undefined,
        salesEnd: form.salesEnd || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await eventsService.updateTicketType(eventId, editingId, payload);
      } else {
        await eventsService.createTicketType(eventId, payload);
      }

      toast.success(editingId ? 'Ticket updated' : 'Ticket created');
      setDialogOpen(false);
      fetchTickets();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save ticket type'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId || !deleteConfirm?._id) return;

    setDeleting(true);

    try {
      await eventsService.deleteTicketType(eventId, deleteConfirm._id);
      toast.success('Ticket type deleted');
      setDeleteConfirm(null);
      fetchTickets();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete ticket type'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader
        title="Ticket Management"
        subtitle={
          eventId
            ? 'Manage ticket types and availability for this event'
            : 'Open an event first to manage its ticket types'
        }
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: fetchTickets,
            variant: 'outline',
          },
          {
            label: 'Add Ticket Type',
            icon: Plus,
            onClick: openCreate,
            loading: saving,
          },
        ]}
      />

      {!eventId ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Ticket className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              Choose an event to manage tickets
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              Ticket types are scoped to a single event, so this page works from
              the event actions menu in organizer event management.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Ticket className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground mb-3">
              No ticket types yet
            </p>
            <Button onClick={openCreate} className="font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Create First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const sold = Number(ticket.sold || ticket.soldCount || 0);
            const quantity = Number(ticket.quantity || 0);
            const fillPct = quantity ? (sold / quantity) * 100 : 0;

            return (
              <Card key={ticket._id} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    ticket.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <p className="text-base font-bold font-heading">{ticket.name}</p>
                      <Badge variant="secondary" className="text-[10px] mt-0.5 capitalize">
                        {ticket.type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(ticket)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(ticket)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-2xl font-extrabold font-heading mb-4">
                    {Number(ticket.price || 0) === 0
                      ? 'FREE'
                      : formatPrice(ticket.price)}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sold</span>
                      <span className="font-semibold">
                        {sold} / {quantity}
                      </span>
                    </div>
                    <Progress value={fillPct} className="h-2" />
                    <p className="text-[11px] text-muted-foreground">
                      {Math.max(quantity - sold, 0)} remaining
                    </p>
                  </div>
                  {ticket.description && (
                    <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                      {ticket.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingId ? 'Edit Ticket Type' : 'New Ticket Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Name *</Label>
              <Input
                value={form.name}
                onChange={(event) => setValue('name', event.target.value)}
                placeholder="General Admission, VIP..."
                className="mt-1.5 h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_TYPES.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize"
                      >
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Price</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(event) => setValue('price', event.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-9"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Quantity *</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(event) => setValue('quantity', event.target.value)}
                placeholder="100"
                className="mt-1.5 h-9"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                value={form.description}
                onChange={(event) => setValue('description', event.target.value)}
                placeholder="What's included..."
                className="mt-1.5 h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Sales Start</Label>
                <Input
                  type="date"
                  value={form.salesStart}
                  onChange={(event) => setValue('salesStart', event.target.value)}
                  className="mt-1.5 h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Sales End</Label>
                <Input
                  type="date"
                  value={form.salesEnd}
                  onChange={(event) => setValue('salesEnd', event.target.value)}
                  className="mt-1.5 h-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(value) => setValue('isActive', value)}
              />
              <Label className="text-sm">Active (visible to buyers)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="font-bold">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Ticket Type?"
        description="This ticket type will be permanently removed from the event."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
};

export default TicketManagementPage;
