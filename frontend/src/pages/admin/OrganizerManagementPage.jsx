import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FilterBar from '@/components/shared/FilterBar';
import DetailDrawer, {
  DetailField,
  DetailSection,
} from '@/components/shared/DetailDrawer';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { formatDate } from '@/utils/formatters';
import { ROUTES } from '@/app/AppRoutes';

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Unverified', value: 'unverified' },
];

const getInitials = (organizer) => {
  const displayName =
    organizer?.displayName ||
    `${organizer?.user?.firstName || ''} ${organizer?.user?.lastName || ''}`.trim() ||
    organizer?.user?.email ||
    'O';

  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const OrganizerManagementPage = () => {
  const { organizerId } = useParams();
  const navigate = useNavigate();

  const [organizers, setOrganizers] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    verificationStatus: '',
  });
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewReason, setReviewReason] = useState('');

  const LIMIT = 15;

  const fetchOrganizers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.search) params.search = filters.search;
      if (filters.verificationStatus) {
        params.verificationStatus = filters.verificationStatus;
      }

      const [result, analytics] = await Promise.allSettled([
        adminService.getOrganizers(params),
        adminService.getAnalyticsOrganizers(),
      ]);

      if (result.status === 'fulfilled') {
        setOrganizers(result.value?.organizers || []);
        setTotal(result.value?.total || 0);
      } else {
        throw result.reason;
      }

      if (analytics.status === 'fulfilled') {
        setSummary(analytics.value || null);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load organizers'));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  useEffect(() => {
    if (organizerId) {
      openDrawer(organizerId);
    }
  }, [organizerId]);

  const openDrawer = async (id) => {
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const organizer = await adminService.getOrganizerById(id);
      setSelectedOrganizer(organizer);
      setReviewReason(organizer?.rejectionReason || '');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load organizer request'));
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrganizer(null);
    setReviewReason('');

    if (organizerId) {
      navigate(ROUTES.ADMIN.ORGANIZERS);
    }
  };

  const syncOrganizerState = (updatedOrganizer) => {
    if (!updatedOrganizer?._id) return;

    setOrganizers((current) =>
      current.map((organizer) =>
        organizer._id === updatedOrganizer._id ? updatedOrganizer : organizer,
      ),
    );

    if (selectedOrganizer?._id === updatedOrganizer._id) {
      setSelectedOrganizer(updatedOrganizer);
    }
  };

  const handleApprove = async (organizer = selectedOrganizer) => {
    if (!organizer?._id) return;

    setActionLoading(true);
    try {
      const updatedOrganizer = await adminService.verifyOrganizer(organizer._id);
      syncOrganizerState(updatedOrganizer);
      toast.success('Trusted organizer badge approved');
      fetchOrganizers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to approve organizer'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (organizer = selectedOrganizer) => {
    if (!organizer?._id) return;

    setActionLoading(true);
    try {
      const updatedOrganizer = await adminService.rejectOrganizer(organizer._id, {
        reason: reviewReason.trim() || undefined,
      });
      syncOrganizerState(updatedOrganizer);
      toast.success('Organizer request rejected');
      fetchOrganizers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject organizer'));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'organizer',
      label: 'Organizer',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={row.logo} alt={row.displayName} />
            <AvatarFallback className="bg-primary/10 font-bold text-primary">
              {getInitials(row)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{row.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.user?.email || row.email || 'No contact email'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      label: 'Status',
      render: (row) => <StatusBadge status={row.verificationStatus} />,
    },
    {
      key: 'verificationRequestedAt',
      label: 'Requested',
      render: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {row.verificationRequestedAt
            ? formatDate(row.verificationRequestedAt, {
                dateStyle: 'medium',
                timeStyle: undefined,
              })
            : 'Not submitted'}
        </span>
      ),
    },
    {
      key: 'verificationDoc',
      label: 'Proof',
      render: (row) =>
        row.verificationDoc ? (
          <a
            href={row.verificationDoc}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Open Link
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No proof link</span>
        ),
    },
    {
      key: 'eventCount',
      label: 'Events',
      render: (row) => (
        <span className="text-sm font-semibold">{row.eventCount || 0}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => openDrawer(row._id)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {row.verificationStatus !== 'verified' && (
        <Button
          size="sm"
          className="h-8 font-bold"
          onClick={() => handleApprove(row)}
          disabled={actionLoading}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>
      )}
    </div>
  );

  const showReviewActions =
    selectedOrganizer &&
    ['pending', 'rejected', 'unverified'].includes(
      selectedOrganizer.verificationStatus,
    );

  return (
    <div className="space-y-6 p-4 font-sans sm:p-6">
      <PageHeader
        title="Organizer Verification"
        subtitle="Review trusted badge requests from organizers and approve only verified hosts."
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: fetchOrganizers,
            variant: 'outline',
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Pending Review',
            value: summary?.pending || 0,
            icon: Shield,
            tone: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          },
          {
            label: 'Trusted Organizers',
            value: summary?.verified || 0,
            icon: BadgeCheck,
            tone: 'bg-green-500/10 text-green-600 border-green-500/20',
          },
          {
            label: 'Rejected Requests',
            value: summary?.rejected || 0,
            icon: XCircle,
            tone: 'bg-red-500/10 text-red-500 border-red-500/20',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${stat.tone}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-extrabold">{stat.value}</p>
              </div>
              <stat.icon className="h-6 w-6 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'search',
            placeholder: 'Search organizers...',
          },
          {
            type: 'select',
            key: 'verificationStatus',
            placeholder: 'All statuses',
            options: STATUS_OPTIONS,
          },
        ]}
        values={filters}
        onChange={(key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ search: '', verificationStatus: '' });
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={organizers}
        actions={rowActions}
        loading={loading}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyMessage="No organizer verification requests found"
        emptyIcon={Building2}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        loading={drawerLoading}
        title={selectedOrganizer?.displayName || 'Organizer Request'}
        description={
          selectedOrganizer?.verificationStatus
            ? `Status: ${selectedOrganizer.verificationStatus}`
            : undefined
        }
        footer={
          showReviewActions ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/5"
                onClick={() => handleReject(selectedOrganizer)}
                disabled={actionLoading}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
              <Button
                size="sm"
                className="flex-1 font-bold"
                onClick={() => handleApprove(selectedOrganizer)}
                disabled={actionLoading}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Approve Trusted Badge
              </Button>
            </div>
          ) : null
        }
      >
        {selectedOrganizer && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage
                  src={selectedOrganizer.logo}
                  alt={selectedOrganizer.displayName}
                />
                <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                  {getInitials(selectedOrganizer)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold">
                    {selectedOrganizer.displayName}
                  </p>
                  <StatusBadge status={selectedOrganizer.verificationStatus} />
                  {selectedOrganizer.verificationStatus === 'verified' && (
                    <Badge className="bg-green-500 text-white hover:bg-green-500">
                      Trusted Organizer
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {selectedOrganizer.user?.email || selectedOrganizer.email}
                </p>
              </div>
            </div>

            <DetailSection title="Organizer Profile">
              <DetailField
                label="Display Name"
                value={selectedOrganizer.displayName}
              />
              <DetailField
                label="Public Contact"
                value={
                  selectedOrganizer.email ||
                  selectedOrganizer.user?.email ||
                  'No public contact'
                }
              />
              <DetailField
                label="Phone"
                value={selectedOrganizer.phone || 'Not provided'}
              />
              <DetailField
                label="Published Events"
                value={selectedOrganizer.eventCount || 0}
              />
            </DetailSection>

            <DetailSection title="Verification Request">
              <DetailField
                label="Requested At"
                value={
                  selectedOrganizer.verificationRequestedAt
                    ? formatDate(selectedOrganizer.verificationRequestedAt)
                    : 'Not submitted'
                }
              />
              <DetailField
                label="Reviewed At"
                value={
                  selectedOrganizer.verificationReviewedAt
                    ? formatDate(selectedOrganizer.verificationReviewedAt)
                    : 'Not reviewed yet'
                }
              />
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Proof Link
                </p>
                {selectedOrganizer.verificationDoc ? (
                  <a
                    href={selectedOrganizer.verificationDoc}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Open verification proof
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    No proof link submitted
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Organizer Note
                </p>
                <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                  {selectedOrganizer.verificationNotes || 'No note provided'}
                </p>
              </div>
            </DetailSection>

            {showReviewActions && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Rejection Note
                </p>
                <Textarea
                  value={reviewReason}
                  onChange={(event) => setReviewReason(event.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                  placeholder="Optional feedback for the organizer if you reject this request."
                />
              </div>
            )}

            {selectedOrganizer.verificationStatus === 'verified' && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-sm font-semibold text-green-600">
                  Public badge is active
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Event details now show a trusted organizer badge beside this
                  organizer name for attendees.
                </p>
              </div>
            )}

            {selectedOrganizer.rejectionReason && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                  Latest Rejection Reason
                </p>
                <p className="mt-2 text-sm text-red-600">
                  {selectedOrganizer.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default OrganizerManagementPage;
