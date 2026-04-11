import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  Clock,
  CreditCard,
  DollarSign,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { organizersService, payoutsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { formatDate, formatPrice } from '@/utils/formatters';

const RevenuePage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState({ months: [] });
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const fetchRevenue = async () => {
    setLoading(true);

    try {
      const [dashboardResult, revenueResult, payoutsResult] = await Promise.all([
        organizersService.getDashboard(),
        organizersService.getRevenue(),
        organizersService.getPayouts({ page: 1, limit: 20 }),
      ]);

      setDashboard(dashboardResult || null);
      setRevenue(revenueResult || { months: [] });
      setPayouts(payoutsResult?.payouts || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load revenue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = Number(dashboard?.overview?.totalRevenue || 0);
    const paidOut = payouts
      .filter((payout) => payout.status === 'completed')
      .reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
    const pendingPayout = payouts
      .filter((payout) => ['pending', 'processing'].includes(payout.status))
      .reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
    const latestMonth = revenue?.months?.[revenue.months.length - 1];

    return {
      totalRevenue,
      paidOut,
      pendingPayout,
      availableBalance: Math.max(totalRevenue - paidOut - pendingPayout, 0),
      monthEarnings: Number(latestMonth?.revenue || 0),
    };
  }, [dashboard, payouts, revenue]);

  const handleRequestPayout = async () => {
    const amount = Number.parseFloat(payoutAmount);

    if (!amount || amount <= 0) {
      toast.error('Enter a valid payout amount');
      return;
    }

    if (amount > summary.availableBalance) {
      toast.error('Requested amount exceeds your available balance');
      return;
    }

    setRequesting(true);

    try {
      await payoutsService.request({ amount });
      toast.success('Payout request submitted');
      setPayoutDialog(false);
      setPayoutAmount('');
      fetchRevenue();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to request payout'));
    } finally {
      setRequesting(false);
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(summary.totalRevenue),
      icon: DollarSign,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'This Month',
      value: formatPrice(summary.monthEarnings),
      icon: TrendingUp,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Available Balance',
      value: formatPrice(summary.availableBalance),
      icon: CreditCard,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Pending Payout',
      value: formatPrice(summary.pendingPayout),
      icon: Clock,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title="Revenue"
          subtitle="Organizer revenue and payout activity from shared API services"
          className="mb-0"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={fetchRevenue}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => setPayoutDialog(true)}
            disabled={summary.availableBalance <= 0}
            className="h-9 font-bold"
          >
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-10" />
                ))}
              </div>
            ) : (revenue?.months || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No revenue data yet
              </p>
            ) : (
              (revenue?.months || []).map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.bookings || 0} bookings
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-600">
                      {formatPrice(item.revenue || 0)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-14" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No payouts yet</p>
              </div>
            ) : (
              payouts.map((payout) => (
                <div
                  key={payout._id}
                  className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {formatPrice(payout.amount || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payout.createdAt || payout.requestedAt, {
                        dateStyle: 'medium',
                        timeStyle: undefined,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={payout.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={payoutDialog} onOpenChange={setPayoutDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Request Payout</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-extrabold font-heading text-green-600">
                {formatPrice(summary.availableBalance)}
              </p>
            </div>
            <div>
              <Label className="text-xs font-semibold">Amount to Withdraw</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(event) => setPayoutAmount(event.target.value)}
                  placeholder="0.00"
                  className="h-9"
                  min="1"
                  max={summary.availableBalance}
                  step="0.01"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Payout requests are submitted to the backend payout workflow and
              will appear in your history after creation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestPayout}
              disabled={requesting}
              className="font-bold"
            >
              {requesting ? 'Requesting...' : 'Request Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RevenuePage;
