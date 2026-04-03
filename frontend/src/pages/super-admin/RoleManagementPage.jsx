import React, { useEffect, useState } from "react";
import { Eye, RefreshCw, Save, Shield, Users } from "lucide-react";

import { superAdminService } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import DetailDrawer, {
  DetailField,
  DetailSection,
} from "@/components/shared/DetailDrawer";
import { RoleBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/shared/common";
import { formatDate } from "@/utils/formatters";

const ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Organizer", value: "organizer" },
  { label: "Moderator", value: "moderator" },
  { label: "Admin", value: "admin" },
  { label: "Super Admin", value: "super_admin" },
];

const RoleManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersPayload, adminsPayload] = await Promise.all([
        superAdminService.getUsers({
          page,
          limit: 12,
          search: filters.search || undefined,
          role: filters.role || undefined,
          status: filters.status || undefined,
        }),
        superAdminService.getAdmins({ limit: 8 }),
      ]);

      setUsers(usersPayload.users || []);
      setTotal(usersPayload.total || usersPayload.pagination?.total || 0);
      setAdmins(adminsPayload.admins || []);
    } catch (error) {
      toast.error(error.message || "Failed to load role management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const openDrawer = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role || "user");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setSelectedRole("user");
    setDrawerOpen(false);
  };

  const handleSaveRole = async () => {
    if (!selectedUser?._id || !selectedRole) return;

    setSaving(true);
    try {
      await superAdminService.updateUserRole(selectedUser._id, selectedRole);
      toast.success("User role updated");
      closeDrawer();
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to update user role");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-foreground">
            {[row.firstName, row.lastName].filter(Boolean).join(" ") || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastLoginAt",
      label: "Last Login",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.lastLoginAt ? formatDate(row.lastLoginAt) : "Never"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        subtitle="Assign and review privileged access through backend-enforced role workflows."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchData,
            loading,
            variant: "outline",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <FilterBar
            filters={[
              { type: "search", key: "search", placeholder: "Search users..." },
              {
                type: "select",
                key: "role",
                placeholder: "All roles",
                options: ROLE_OPTIONS,
              },
              {
                type: "select",
                key: "status",
                placeholder: "All statuses",
                options: [
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Suspended", value: "suspended" },
                  { label: "Banned", value: "banned" },
                ],
              },
            ]}
            values={filters}
            onChange={(key, value) => {
              setPage(1);
              setFilters((current) => ({ ...current, [key]: value }));
            }}
            onClear={() => {
              setPage(1);
              setFilters({ search: "", role: "", status: "" });
            }}
          />

          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            actions={(row) => (
              <Button variant="ghost" size="sm" onClick={() => openDrawer(row)}>
                <Eye className="mr-2 h-4 w-4" />
                Review
              </Button>
            )}
            pagination={{ page, limit: 12, total, onPageChange: setPage }}
            emptyMessage="No users matched the selected filters"
            emptyIcon={Users}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Privileged Staff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No privileged staff accounts found.
              </p>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin._id}
                  className="rounded-2xl border border-border/70 bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {[admin.firstName, admin.lastName].filter(Boolean).join(" ") || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                    <RoleBadge role={admin.role} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last login: {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={
          selectedUser
            ? [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(" ")
            : "Role Review"
        }
        description={selectedUser?.email}
        footer={
          selectedUser ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
              <Button onClick={handleSaveRole} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Role"}
              </Button>
            </div>
          ) : null
        }
      >
        {selectedUser ? (
          <div className="space-y-6">
            <DetailSection title="Account">
              <DetailField label="Role" value={selectedUser.role} />
              <DetailField label="Status" value={selectedUser.status} />
              <DetailField label="Joined" value={formatDate(selectedUser.createdAt)} />
              <DetailField label="Last Login" value={selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : "Never"} />
            </DetailSection>

            <DetailSection title="Role Assignment">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Role
                </p>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                  Role changes are validated and audited on the backend before they take effect.
                </div>
              </div>
            </DetailSection>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
};

export default RoleManagementPage;
