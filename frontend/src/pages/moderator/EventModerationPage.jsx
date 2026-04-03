import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, RefreshCw, XCircle } from "lucide-react";

import { moderatorService } from "@/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import DetailDrawer, {
  DetailField,
  DetailSection,
} from "@/components/shared/DetailDrawer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "@/components/shared/common";
import { formatDate } from "@/utils/formatters";

const EventModerationPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const payload = await moderatorService.getPendingEvents({
        page,
        limit: 12,
      });
      setEvents(payload.events || []);
      setTotal(payload.total || payload.pagination?.total || 0);
    } catch (error) {
      toast.error(error.message || "Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const openEvent = (event) => {
    setSelectedEvent(event);
    setRejectionReason(event.rejectionReason || "");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedEvent(null);
    setRejectionReason("");
    setDrawerOpen(false);
  };

  const handleApprove = async (eventId = selectedEvent?._id) => {
    if (!eventId) return;
    setSaving(true);
    try {
      await moderatorService.approveEvent(eventId);
      toast.success("Event approved");
      closeDrawer();
      fetchEvents();
    } catch (error) {
      toast.error(error.message || "Failed to approve event");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent?._id) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setSaving(true);
    try {
      await moderatorService.rejectEvent(selectedEvent._id, rejectionReason.trim());
      toast.success("Event rejected");
      closeDrawer();
      fetchEvents();
    } catch (error) {
      toast.error(error.message || "Failed to reject event");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Event",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{row.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.slug || row.location?.city || "No slug"}
          </p>
        </div>
      ),
    },
    {
      key: "organizer",
      label: "Organizer",
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium text-foreground">
            {[row.organizer?.firstName, row.organizer?.lastName].filter(Boolean).join(" ") || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">{row.organizer?.email || "No email"}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-xs font-medium text-muted-foreground">
          {row.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Starts",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.startDate)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Review"
        subtitle="Approve or reject pending events using backend moderation rules."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchEvents,
            loading,
            variant: "outline",
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={events}
        loading={loading}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEvent(row)}>
              <Eye className="mr-2 h-4 w-4" />
              Review
            </Button>
            <Button size="sm" onClick={() => handleApprove(row._id)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
        pagination={{ page, limit: 12, total, onPageChange: setPage }}
        emptyMessage="No pending events are waiting for moderation"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={selectedEvent?.title || "Event Review"}
        description={selectedEvent?.summary || selectedEvent?.description || "Moderation details"}
        footer={
          selectedEvent ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
              <Button variant="outline" onClick={handleReject} disabled={saving}>
                <XCircle className="mr-2 h-4 w-4" />
                {saving ? "Submitting..." : "Reject"}
              </Button>
              <Button onClick={() => handleApprove()} disabled={saving}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {saving ? "Submitting..." : "Approve"}
              </Button>
            </div>
          ) : null
        }
      >
        {selectedEvent ? (
          <div className="space-y-6">
            <DetailSection title="Event Details">
              <DetailField label="Organizer" value={selectedEvent.organizer?.email} />
              <DetailField label="Category" value={selectedEvent.category?.name} />
              <DetailField label="Start Date" value={formatDate(selectedEvent.startDate)} />
              <DetailField
                label="Location"
                value={
                  selectedEvent.location?.name ||
                  selectedEvent.location?.city ||
                  "No venue provided"
                }
              />
              <DetailField label="Status" value={selectedEvent.status} />
            </DetailSection>

            <DetailSection title="Moderation Notes">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Rejection Reason
                </p>
                <Textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Explain why this event should be rejected..."
                />
              </div>
            </DetailSection>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
};

export default EventModerationPage;
