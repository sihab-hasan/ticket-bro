import React, { useEffect, useState } from "react";
import { Eye, FileText, RefreshCw } from "lucide-react";

import { superAdminService } from "@/api";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import DetailDrawer, {
  DetailField,
  DetailSection,
} from "@/components/shared/DetailDrawer";
import { RoleBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/components/shared/common";
import { formatDate } from "@/utils/formatters";

const AuditCenterPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: "",
    from: "",
    to: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const payload = await superAdminService.getAuditLogs({
        page,
        limit: 15,
        action: filters.action || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setLogs(payload.logs || []);
      setTotal(payload.total || payload.pagination?.total || 0);
    } catch (error) {
      toast.error(error.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const columns = [
    {
      key: "actor",
      label: "Actor",
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-foreground">
            {row.actor?.email || "System"}
          </p>
          <div className="mt-1">
            <RoleBadge role={row.actor?.role || "user"} />
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {row.action}
        </span>
      ),
    },
    {
      key: "target",
      label: "Target",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.target || row.resource}</p>
          <p className="text-xs text-muted-foreground">{row.targetId || row.resourceId || "No target id"}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
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
        title="Audit Center"
        subtitle="Review backend audit activity for privileged and system actions."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchLogs,
            loading,
            variant: "outline",
          },
        ]}
      />

      <FilterBar
        filters={[
          { type: "search", key: "action", placeholder: "Filter by action..." },
          { type: "date", key: "from", placeholder: "From" },
          { type: "date", key: "to", placeholder: "To" },
        ]}
        values={filters}
        onChange={(key, value) => {
          setPage(1);
          setFilters((current) => ({ ...current, [key]: value }));
        }}
        onClear={() => {
          setPage(1);
          setFilters({ action: "", from: "", to: "" });
        }}
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        actions={(row) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLog(row);
              setDrawerOpen(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Inspect
          </Button>
        )}
        pagination={{ page, limit: 15, total, onPageChange: setPage }}
        emptyMessage="No audit entries matched the selected filters"
        emptyIcon={FileText}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLog(null);
        }}
        title={selectedLog?.action || "Audit Entry"}
        description={selectedLog?.actor?.email || "System actor"}
      >
        {selectedLog ? (
          <div className="space-y-6">
            <DetailSection title="Event">
              <DetailField label="Action" value={selectedLog.action} />
              <DetailField label="Target" value={selectedLog.target || selectedLog.resource} />
              <DetailField label="Target Id" value={selectedLog.targetId || selectedLog.resourceId} />
              <DetailField label="Created" value={formatDate(selectedLog.createdAt)} />
            </DetailSection>

            <DetailSection title="Actor">
              <DetailField label="Email" value={selectedLog.actor?.email} />
              <DetailField label="Role" value={selectedLog.actor?.role} />
            </DetailSection>

            <DetailSection title="Metadata">
              <pre className="overflow-x-auto rounded-xl bg-muted/40 p-4 text-xs text-foreground">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </DetailSection>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
};

export default AuditCenterPage;
