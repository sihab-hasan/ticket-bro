import React, { useEffect, useState } from "react";
import { BellRing, Eye, RefreshCw, Shield, ShieldOff } from "lucide-react";

import { moderatorService } from "@/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import DetailDrawer, {
  DetailField,
  DetailSection,
} from "@/components/shared/DetailDrawer";
import { RoleBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/components/shared/common";
import { formatDate } from "@/utils/formatters";

const UserModerationPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [note, setNote] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const payload = await moderatorService.getUsers({
        page,
        limit: 12,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      setUsers(payload.users || []);
      setTotal(payload.total || payload.pagination?.total || 0);
    } catch (error) {
      toast.error(error.message || "Failed to load moderation users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const openUser = (user) => {
    setSelectedUser(user);
    setNote(user.statusReason || "");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setNote("");
    setDrawerOpen(false);
  };

  // Perform moderation actions on a user.  The `mode` argument must be one of
  // "warn", "suspend", or "restore".  If no target is provided, the
  // currently selected user will be used.
  const handleAction = async (mode, targetUser = selectedUser) => {
    if (!mode || !targetUser?._id) return;

    if (["warn", "suspend"].includes(mode) && !note.trim()) {
      toast.error("A note is required for this action");
      return;
    }

    setSaving(true);
    try {
      if (mode === "warn") {
        await moderatorService.warnUser(targetUser._id, note.trim());
        toast.success("Warning issued");
      } else if (mode === "suspend") {
        await moderatorService.suspendUser(targetUser._id, note.trim());
        toast.success("User suspended");
      } else {
        await moderatorService.unsuspendUser(targetUser._id);
        toast.success("User restored");
      }

      closeDrawer();
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to apply user action");
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
      key: "statusReason",
      label: "Last Note",
      render: (row) => (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {row.statusReason || "No moderation note"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Actions"
        subtitle="Suspend, restore, and warn users through backend moderation endpoints."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchUsers,
            loading,
            variant: "outline",
          },
        ]}
      />

      <FilterBar
        filters={[
          { type: "search", key: "search", placeholder: "Search name or email..." },
          {
            type: "select",
            key: "status",
            placeholder: "All statuses",
            options: [
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
              { label: "Banned", value: "banned" },
              { label: "Inactive", value: "inactive" },
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
          setFilters({ search: "", status: "" });
        }}
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openUser(row)}>
              <Eye className="mr-2 h-4 w-4" />
              Review
            </Button>
            {row.status === "suspended" ? (
              <Button size="sm" variant="outline" onClick={() => handleAction("restore", row)}>
                <ShieldOff className="mr-2 h-4 w-4" />
                Restore
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => openUser({ ...row, status: row.status })}>
                <Shield className="mr-2 h-4 w-4" />
                Moderate
              </Button>
            )}
          </div>
        )}
        pagination={{ page, limit: 12, total, onPageChange: setPage }}
        emptyMessage="No users matched the moderation filters"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={
          selectedUser
            ? [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(" ")
            : "User Moderation"
        }
        description={selectedUser?.email}
        footer={
          selectedUser ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
              {selectedUser.status === "suspended" ? (
                <Button onClick={() => handleAction("restore")} disabled={saving}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  {saving ? "Processing..." : "Restore User"}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => handleAction("warn")} disabled={saving}>
                    <BellRing className="mr-2 h-4 w-4" />
                    {saving ? "Processing..." : "Issue Warning"}
                  </Button>
                  <Button onClick={() => handleAction("suspend")} disabled={saving}>
                    <Shield className="mr-2 h-4 w-4" />
                    {saving ? "Processing..." : "Suspend User"}
                  </Button>
                </>
              )}
            </div>
          ) : null
        }
      >
        {selectedUser ? (
          <div className="space-y-6">
            <DetailSection title="Account">
              <DetailField label="Email" value={selectedUser.email} />
              <DetailField label="Role" value={selectedUser.role} />
              <DetailField label="Status" value={selectedUser.status} />
              <DetailField label="Joined" value={formatDate(selectedUser.createdAt)} />
              <DetailField label="Last Status Update" value={formatDate(selectedUser.statusUpdatedAt)} />
            </DetailSection>

            <DetailSection title="Moderation Note">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add the warning or suspension reason that should be stored on the backend..."
              />
            </DetailSection>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
};

export default UserModerationPage;
