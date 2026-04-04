import React, { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Flag,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/shared/DataTable";
import DetailDrawer, {
  DetailField,
  DetailSection,
} from "@/components/shared/DetailDrawer";
import FilterBar from "@/components/shared/FilterBar";
import PageHeader from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/StatusBadge";
import { toast } from "@/components/shared/common";
import { formatDate } from "@/utils/formatters";
import { adminService } from "@/api";

const LIMIT = 15;

const FlagBadge = ({ flagged }) => (
  <Badge
    variant="outline"
    className={
      flagged
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
        : "border-border bg-muted/40 text-muted-foreground"
    }
  >
    {flagged ? "Flagged" : "Clean"}
  </Badge>
);

const RatingStars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`h-3.5 w-3.5 ${
          value <= Number(rating || 0)
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const getReviewerName = (review) =>
  [review?.user?.firstName, review?.user?.lastName].filter(Boolean).join(" ") ||
  review?.user?.email ||
  "Unknown";

const ReviewsManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    reported: "",
    sort: "-createdAt",
  });
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews({
        page,
        limit: LIMIT,
        search: filters.search,
        reported: filters.reported,
        sort: filters.sort,
      });

      setReviews(data?.reviews || []);
      setTotal(data?.total || data?.pagination?.total || 0);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openDrawer = (review) => {
    setSelected(review);
    setDrawerOpen(true);
  };

  const handleFlag = async (review, flagged) => {
    setActionLoading(true);
    try {
      const updatedReview = await adminService.flagReview(review._id, flagged);
      setReviews((current) =>
        current.map((item) => (item._id === review._id ? updatedReview : item)),
      );
      setSelected((current) =>
        current?._id === review._id ? updatedReview : current,
      );
      toast.success(flagged ? "Review flagged" : "Review unflagged");
    } catch {
      toast.error("Failed to update review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setActionLoading(true);
    try {
      await adminService.deleteReview(reviewId);
      setReviews((current) => current.filter((item) => item._id !== reviewId));
      setTotal((current) => Math.max(0, current - 1));
      setSelected((current) => (current?._id === reviewId ? null : current));
      setDrawerOpen(false);
      setConfirmDelete(null);
      toast.success("Review deleted");
      await fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "reviewer",
      label: "Reviewer",
      render: (review) => (
        <div className="min-w-[180px]">
          <p className="text-sm font-semibold">{getReviewerName(review)}</p>
          <p className="text-xs text-muted-foreground">{review.user?.email}</p>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (review) => (
        <div className="space-y-1">
          <RatingStars rating={review.rating} />
          <span className="text-xs text-muted-foreground">
            {Number(review.rating || 0).toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      key: "body",
      label: "Review",
      render: (review) => (
        <div className="max-w-[320px]">
          {review.title ? (
            <p className="truncate text-sm font-semibold">{review.title}</p>
          ) : null}
          <p className="truncate text-sm text-muted-foreground">
            {review.body || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "reported",
      label: "Status",
      render: (review) => <FlagBadge flagged={review.reported} />,
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (review) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(review.createdAt, {
            dateStyle: "medium",
            timeStyle: undefined,
          })}
        </span>
      ),
    },
  ];

  const rowActions = (review) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => openDrawer(review)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFlag(review, !review.reported)}
          className={review.reported ? "" : "text-amber-600"}
        >
          <Flag className="mr-2 h-4 w-4" />
          {review.reported ? "Unflag Review" : "Flag Review"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setConfirmDelete(review)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6 p-4 font-sans sm:p-6">
      <PageHeader
        title="Reviews"
        subtitle={`${total} app reviews`}
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchReviews,
            variant: "outline",
          },
        ]}
      />

      <FilterBar
        filters={[
          { type: "search", key: "search", placeholder: "Search reviews..." },
          {
            type: "select",
            key: "reported",
            placeholder: "All statuses",
            options: [
              { label: "Flagged", value: "true" },
              { label: "Clean", value: "false" },
            ],
          },
          {
            type: "select",
            key: "sort",
            placeholder: "Newest first",
            options: [
              { label: "Newest first", value: "-createdAt" },
              { label: "Oldest first", value: "createdAt" },
              { label: "Highest rating", value: "-rating" },
              { label: "Lowest rating", value: "rating" },
            ],
          },
        ]}
        values={filters}
        onChange={(key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ search: "", reported: "", sort: "-createdAt" });
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={reviews}
        actions={rowActions}
        loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No reviews found"
        emptyIcon={MessageSquare}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        title="Review Details"
        description={selected?.title || "App review"}
        footer={
          selected ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                disabled={actionLoading}
                onClick={() => handleFlag(selected, !selected.reported)}
              >
                <Flag className="mr-1.5 h-3.5 w-3.5" />
                {selected.reported ? "Unflag" : "Flag"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                disabled={actionLoading}
                onClick={() => setConfirmDelete(selected)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <FlagBadge flagged={selected.reported} />
              <RatingStars rating={selected.rating} />
            </div>

            <DetailSection title="Review">
              <DetailField label="Title" value={selected.title} />
              <DetailField label="Body" value={selected.body} />
              <DetailField
                label="Submitted"
                value={formatDate(selected.createdAt)}
              />
              <DetailField
                label="Legacy Event"
                value={selected.event?.title}
              />
            </DetailSection>

            <DetailSection title="Reviewer">
              <DetailField label="Name" value={getReviewerName(selected)} />
              <DetailField label="Email" value={selected.user?.email} />
            </DetailSection>
          </div>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Delete review?"
        description="This review will be removed from the public app rating and review list."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete?._id)}
        loading={actionLoading}
      />
    </div>
  );
};

export default ReviewsManagementPage;
