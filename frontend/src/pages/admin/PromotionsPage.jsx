// pages/admin/PromotionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Plus, MoreHorizontal, Eye, Edit, Trash2, RefreshCw, Tag, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import { StatusBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';

const EMPTY_FORM = { code: '', type: 'percentage', value: '', minOrderValue: '', maxUses: '', expiresAt: '', isActive: true, description: '' };

const PromotionsPage = () => {
  const [promos, setPromos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const LIMIT = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminService.getPromotions({ page, limit: LIMIT, ...filters });
      setPromos(d?.promotions || []);
      setTotal(d?.total || 0);
    } catch { toast.error('Failed to load promotions'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };
  const openEdit = (promo) => {
    setForm({ code: promo.code, type: promo.type, value: promo.value, minOrderValue: promo.minOrderValue || '', maxUses: promo.maxUses || '', expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '', isActive: promo.isActive, description: promo.description || '' });
    setEditingId(promo._id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) return toast.error('Code and value are required');
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase(), value: parseFloat(form.value), minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined, maxUses: form.maxUses ? parseInt(form.maxUses) : undefined };
      if (editingId) await adminService.updatePromotion(editingId, payload);
      else await adminService.createPromotion(payload);
      toast.success(`Promotion ${editingId ? 'updated' : 'created'}`);
      setDialogOpen(false); fetch();
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminService.deletePromotion(deleteConfirm._id);
      toast.success('Promotion deleted'); fetch(); setDeleteConfirm(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleteLoading(false); }
  };

  const handleToggle = async (promo) => {
    try {
      await adminService.updatePromotion(promo._id, { isActive: !promo.isActive });
      toast.success(`Promotion ${promo.isActive ? 'deactivated' : 'activated'}`); fetch();
    } catch { toast.error('Failed to update'); }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono font-bold text-sm text-primary">{r.code}</span> },
    { key: 'type', label: 'Discount', render: (r) => (<span className="text-sm font-semibold">{r.type === 'percentage' ? `${r.value}%` : formatPrice(r.value)}</span>) },
    { key: 'uses', label: 'Uses', render: (r) => (<span className="text-sm">{r.usedCount || 0}{r.maxUses ? ` / ${r.maxUses}` : ''}</span>) },
    { key: 'expires', label: 'Expires', render: (r) => (<span className="text-xs text-muted-foreground">{r.expiresAt ? formatDate(r.expiresAt, { dateStyle: 'medium', timeStyle: undefined }) : 'Never'}</span>) },
    { key: 'status', label: 'Status', render: (r) => (<Switch checked={r.isActive} onCheckedChange={() => handleToggle(r)} className="scale-75" />) },
  ];

  const rowActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openEdit(row)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setDeleteConfirm(row)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="Promotions" subtitle={`${total} active promotion codes`}
        actions={[
          { label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' },
          { label: 'New Promotion', icon: Plus, onClick: openCreate },
        ]}
      />
      <FilterBar
        filters={[{ type: 'search', key: 'search', placeholder: 'Search by code…' }]}
        values={filters}
        onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
        onClear={() => setFilters({ search: '' })}
      />
      <DataTable columns={columns} data={promos} actions={rowActions} loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No promotions created yet" emptyIcon={Gift}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Promo Code *</Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="mt-1.5 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Discount Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Value *</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? '20' : '10'} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Min Order Value</Label>
                <Input type="number" value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} placeholder="0" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Max Uses</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Expires At</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" className="mt-1.5" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <Label className="text-sm">Active immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-bold">
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Promotion?" description="This promotion code will be permanently deleted and can no longer be used."
        confirmLabel="Delete" onConfirm={handleDelete} loading={deleteLoading}
      />
    </div>
  );
};

export default PromotionsPage;
