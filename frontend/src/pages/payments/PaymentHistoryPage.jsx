// pages/payments/PaymentHistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RefreshCw, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import FilterBar from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { paymentsService } from '@/api';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentsService.getMyPayments(filters);
      setPayments(data.payments || []);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans">
      <PageHeader title="Payment History" subtitle="All your transactions"
        actions={[{ label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' }]}
      />

      <FilterBar
        filters={[
          { type: 'select', key: 'status', placeholder: 'All statuses', options: [{ label: 'Succeeded', value: 'succeeded' }, { label: 'Pending', value: 'pending' }, { label: 'Refunded', value: 'refunded' }, { label: 'Failed', value: 'failed' }] },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        onClear={() => setFilters({ status: '' })}
      />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : payments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16"><CreditCard className="h-10 w-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No payment history</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Link key={p._id} to={ROUTES.PAYMENTS.DETAILS ? ROUTES.PAYMENTS.DETAILS(p._id) : '#'} className="block no-underline">
              <Card className="hover:shadow-sm transition-all group cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.status === 'succeeded' ? 'bg-green-500/10' : p.status === 'refunded' ? 'bg-blue-500/10' : p.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                    <CreditCard className={`h-5 w-5 ${p.status === 'succeeded' ? 'text-green-500' : p.status === 'refunded' ? 'text-blue-500' : p.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.booking?.event?.title || p.event?.title || p.description || 'Payment'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt, { dateStyle: 'medium', timeStyle: undefined })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${p.status === 'refunded' ? 'text-blue-500' : 'text-foreground'}`}>
                      {p.status === 'refunded' ? '-' : ''}{formatPrice(p.amount)}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
