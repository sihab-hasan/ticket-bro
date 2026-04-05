// pages/admin/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck, UserX, Shield, MoreHorizontal, Eye, Edit,
  Ban, RefreshCw, Download, Plus, Mail, Phone, MapPin, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import DetailDrawer, { DetailField, DetailSection } from '@/components/shared/DetailDrawer';
import { StatusBadge, RoleBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';
import { adminService, superAdminService } from '@/api';
import { useAuth } from '@/context/AuthContext';

const ROLE_OPTIONS = [
  { label: 'User', value: 'user' },
  { label: 'Organizer', value: 'organizer' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Admin', value: 'admin' },
];
const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
];

const UserManagementPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { canAccessPanel } = useAuth();
  const canManageRoles = canAccessPanel('super_admin');

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);

  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      const data = await adminService.getUsers(params);
      setUsers(data?.users || []);
      setTotal(data?.total || 0);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Open drawer if userId param
  useEffect(() => {
    if (userId) openDrawer(userId);
  }, [userId]);

  const openDrawer = async (id) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const data = await adminService.getUserById(id);
      setSelectedUser(data);
    } catch {
      toast.error('Failed to load user details');
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
    if (userId) navigate(ROUTES.ADMIN.USERS);
  };

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { type, user } = confirmAction;
    try {
      if (type === 'ban') await adminService.banUser(user._id);
      else if (type === 'activate') await adminService.updateUser(user._id, { status: 'active' });
      else if (type === 'deactivate') await adminService.updateUser(user._id, { status: 'suspended' });
      else if (type === 'unban') await adminService.unbanUser(user._id);
      else if (type === 'delete') await adminService.deleteUser(user._id);
      toast.success(`User ${type === 'delete' ? 'deleted' : 'updated'} successfully`);
      fetchUsers();
      setConfirmAction(null);
      closeDrawer();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!canManageRoles) {
      toast.error('Only super admins can change user roles');
      return;
    }

    try {
      await superAdminService.updateUserRole(userId, newRole);
      toast.success('Role updated');
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser((u) => ({ ...u, role: newRole }));
      }
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={row.avatar} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
              {`${row.firstName?.[0] || ''}${row.lastName?.[0] || ''}`.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status || 'active'} />,
    },
    {
      key: 'verified',
      label: 'Verified',
      render: (row) => (
        <span className={`text-xs font-medium ${row.isEmailVerified ? 'text-green-600' : 'text-muted-foreground'}`}>
          {row.isEmailVerified ? '✓ Yes' : '✗ No'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt, { dateStyle: 'medium', timeStyle: undefined })}
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
        {row.status !== 'active' && (
          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'activate', user: row })}>
            <UserCheck className="h-4 w-4 mr-2 text-green-500" /> Activate
          </DropdownMenuItem>
        )}
        {row.status === 'active' && (
          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'deactivate', user: row })}>
            <UserX className="h-4 w-4 mr-2 text-orange-500" /> Suspend
          </DropdownMenuItem>
        )}
        {row.status !== 'banned' && (
          <DropdownMenuItem
            onClick={() => setConfirmAction({ type: 'ban', user: row })}
            className="text-red-600"
          >
            <Ban className="h-4 w-4 mr-2" /> Ban User
          </DropdownMenuItem>
        )}
        {row.status === 'banned' && (
          <DropdownMenuItem
            onClick={() => setConfirmAction({ type: 'unban', user: row })}
            className="text-green-600"
          >
            <UserCheck className="h-4 w-4 mr-2" /> Unban User
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setConfirmAction({ type: 'delete', user: row })}
          className="text-red-600"
        >
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const CONFIRM_CONFIGS = {
    ban: { title: 'Ban User?', description: 'This user will be permanently banned from the platform.', label: 'Ban User' },
    activate: { title: 'Activate User?', description: 'This will restore full access to this user.', label: 'Activate', variant: 'default' },
    deactivate: { title: 'Suspend User?', description: 'User will lose access until reactivated.', label: 'Suspend' },
    delete: { title: 'Delete User?', description: 'This will permanently delete the user and all their data. This cannot be undone.', label: 'Delete' },
    unban: { title: 'Unban User?', description: 'This will restore access to a banned user.', label: 'Unban', variant: 'default' },
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader
        title="User Management"
        subtitle={`${total.toLocaleString()} total users`}
        actions={[
          { label: 'Export', icon: Download, onClick: () => {}, variant: 'outline' },
          { label: 'Refresh', icon: RefreshCw, onClick: fetchUsers, variant: 'outline' },
        ]}
      />

      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search by name or email…' },
          { type: 'select', key: 'role', placeholder: 'All roles', options: ROLE_OPTIONS },
          { type: 'select', key: 'status', placeholder: 'All statuses', options: STATUS_OPTIONS },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onClear={() => { setFilters({ search: '', role: '', status: '' }); setPage(1); }}
      />

      <DataTable
        columns={columns}
        data={users}
        actions={rowActions}
        loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No users found matching your filters"
        emptyIcon={Shield}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User Details'}
        description={selectedUser?.email}
        loading={drawerLoading}
        footer={
          selectedUser && (
            <div className="flex gap-2">
              {selectedUser.status !== 'active' ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmAction({ type: 'activate', user: selectedUser })}
                >
                  <UserCheck className="h-3.5 w-3.5 mr-2" /> Activate
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmAction({ type: 'deactivate', user: selectedUser })}
                >
                  <UserX className="h-3.5 w-3.5 mr-2" /> Suspend
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => setConfirmAction({ type: 'ban', user: selectedUser })}
              >
                <Ban className="h-3.5 w-3.5 mr-2" /> Ban
              </Button>
            </div>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                  {`${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold font-heading">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge status={selectedUser.status || 'active'} />
                </div>
              </div>
            </div>

            <Separator />

            <DetailSection title="Account Info">
              <DetailField label="Email" value={selectedUser.email} />
              <DetailField label="Phone" value={selectedUser.phone} />
              <DetailField label="Joined" value={formatDate(selectedUser.createdAt)} />
              <DetailField label="Last Login" value={formatDate(selectedUser.lastLoginAt)} />
              <DetailField label="Email Verified" value={selectedUser.isEmailVerified ? 'Yes ✓' : 'No ✗'} />
              <DetailField label="2FA Enabled" value={selectedUser.isTwoFactorEnabled ? 'Yes ✓' : 'No ✗'} />
            </DetailSection>

            <DetailSection title="Change Role">
              {canManageRoles ? (
                <Select
                  value={selectedUser.role}
                  onValueChange={(v) => handleRoleChange(selectedUser._id, v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.concat([{ label: 'Super Admin', value: 'super_admin' }]).map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Role assignment is restricted to the super-admin panel.
                </p>
              )}
            </DetailSection>

            {selectedUser.address && (
              <DetailSection title="Address">
                <DetailField label="City" value={selectedUser.address.city} />
                <DetailField label="Country" value={selectedUser.address.country} />
              </DetailSection>
            )}

            <DetailSection title="Stats">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Bookings', value: selectedUser.totalBookings || 0 },
                  { label: 'Total Spent', value: selectedUser.totalSpent ? `$${selectedUser.totalSpent}` : '$0' },
                  { label: 'Reviews', value: selectedUser.totalReviews || 0 },
                  { label: 'Reports', value: selectedUser.totalReports || 0 },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-lg font-extrabold font-heading">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>
        )}
      </DetailDrawer>

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          title={CONFIRM_CONFIGS[confirmAction.type]?.title}
          description={CONFIRM_CONFIGS[confirmAction.type]?.description}
          confirmLabel={CONFIRM_CONFIGS[confirmAction.type]?.label}
          variant={CONFIRM_CONFIGS[confirmAction.type]?.variant || 'destructive'}
          onConfirm={handleAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
