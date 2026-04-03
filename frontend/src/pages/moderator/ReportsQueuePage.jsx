import React, { useEffect, useState } from "react";
import { Eye, FileText, RefreshCw, Save } from "lucide-react";

import { moderatorService } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import DetailDrawer, {
  DetailField,
  DetailSection,
} from "@/components/shared/DetailDrawer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/components/shared/common";
import { formatDate } from "@/utils/formatters";

const PRIORITY_STYLES = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const PriorityBadge = ({ priority = "low" }) => (
  <span
    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${
      PRIORITY_STYLES[priority] || PRIORITY_STYLES.low
    }`}
  >
    {priority}
  </span>
);

const DEFAULT_RESOLUTION = {
  status: "resolved",
  decision: "resolved",
  action: "none",
  note: "",
};

const ReportsQueuePage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: "", status: "", entityType: "" });
  const [selectedReport, setSelectedReport] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolution, setResolution] = useState(DEFAULT_RESOLUTION);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const payload = await moderatorService.getReports({
        page,
        limit: 12,
        search: filters.search || undefined,
        status: filters.status || undefined,
        entityType: filters.entityType || undefined,
      });
      setReports(payload.reports || []);
      setTotal(payload.total || payload.pagination?.total || 0);
    } catch (error) {
      toast.error(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const openReport = (report) => {
    setSelectedReport(report);
    setResolution({
      status: report.status === "open" ? "resolved" : report.status,
      decision: report.status === "open" ? "resolved" : report.status,
      action: report.actionTaken || "none",
      note: report.resolutionNote || "",
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedReport(null);
    setResolution(DEFAULT_RESOLUTION);
  };

  const handleResolve = async () => {
    if (!selectedReport) return;

    setSaving(true);
    try {
      await moderatorService.resolveReport(selectedReport._id, resolution);
      toast.success("Report resolution saved");
      closeDrawer();
      fetchReports();
    } catch (error) {
      toast.error(error.message || "Failed to resolve report");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "reason",
      label: "Report",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {row.reason || row.targetTitle || "Report"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.description || "No description provided"}
          </p>
        </div>
      ),
    },
    {
      key: "entityType",
      label: "Type",
      render: (row) => (
        <span className="text-xs font-medium capitalize text-muted-foreground">
          {row.type || row.entityType || "general"}
        </span>
      ),
    },
    {
      key: "reporter",
      label: "Reporter",
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium text-foreground">
            {[row.reporter?.firstName, row.reporter?.lastName].filter(Boolean).join(" ") || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">{row.reporter?.email || "No email"}</p>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      label: "Opened",
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
        title="Reports Queue"
        subtitle="Review and resolve live moderation reports from the backend queue."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchReports,
            loading,
            variant: "outline",
          },
        ]}
      />

      <FilterBar
        filters={[
          { type: "search", key: "search", placeholder: "Search reason or description..." },
          {
            type: "select",
            key: "status",
            placeholder: "All statuses",
            options: [
              { label: "Open", value: "open" },
              { label: "Under Review", value: "under_review" },
              { label: "Resolved", value: "resolved" },
              { label: "Dismissed", value: "dismissed" },
              { label: "Escalated", value: "escalated" },
            ],
          },
          {
            type: "select",
            key: "entityType",
            placeholder: "All targets",
            options: [
              { label: "User", value: "user" },
              { label: "Event", value: "event" },
              { label: "Review", value: "review" },
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
          setFilters({ search: "", status: "", entityType: "" });
        }}
      />

      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        actions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => openReport(row)}>
            <Eye className="mr-2 h-4 w-4" />
            Review
          </Button>
        )}
        pagination={{ page, limit: 12, total, onPageChange: setPage }}
        emptyMessage="No reports matched the selected filters"
        emptyIcon={FileText}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={selectedReport?.reason || "Report Review"}
        description={selectedReport?.description || "Moderation details"}
        footer={
          selectedReport ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
              <Button onClick={handleResolve} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Resolution"}
              </Button>
            </div>
          ) : null
        }
      >
        {selectedReport ? (
          <div className="space-y-6">
            <DetailSection title="Report Details">
              <DetailField label="Type" value={selectedReport.type || selectedReport.entityType} />
              <DetailField label="Priority" value={selectedReport.priority} />
              <DetailField label="Reporter" value={selectedReport.reporter?.email} />
              <DetailField label="Target Id" value={selectedReport.targetId} />
              <DetailField label="Opened" value={formatDate(selectedReport.createdAt)} />
            </DetailSection>

            <DetailSection title="Resolution">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <Select
                    value={resolution.status}
                    onValueChange={(value) =>
                      setResolution((current) => ({
                        ...current,
                        status: value,
                        decision: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Action Taken
                  </p>
                  <Select
                    value={resolution.action}
                    onValueChange={(value) =>
                      setResolution((current) => ({ ...current, action: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No action</SelectItem>
                      <SelectItem value="warning">Warning issued</SelectItem>
                      <SelectItem value="suspended">User suspended</SelectItem>
                      <SelectItem value="content_removed">Content removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Resolution Note
                  </p>
                  <Textarea
                    value={resolution.note}
                    onChange={(event) =>
                      setResolution((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Capture what happened and why..."
                  />
                </div>
              </div>
            </DetailSection>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
};

export default ReportsQueuePage;
