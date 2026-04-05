// pages/payments/PaymentDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCcw, CreditCard, Calendar, Hash, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { paymentsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import Container from '@/components/layout/Container';

const Row = ({ label, value, icon: Icon, mono }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium mt-0.5 break-words ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  </div>
);

const PaymentDetailsPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setPayment(await paymentsService.getById(paymentId));
      } catch { toast.error('Payment not found'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [navigate, paymentId]);

  const handleRefund = async () => {
    if (!confirm('Request a refund for this payment?')) return;
    setRefunding(true);
    try {
      await paymentsService.requestRefund(paymentId);
      toast.success('Refund request submitted');
      setPayment(await paymentsService.getById(paymentId));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Refund request failed'));
    } finally {
      setRefunding(false);
    }
  };

  if (loading) return <Container aria-label="Payment details loading"><div className="py-4 space-y-4 max-w-lg mx-auto">{[1,2].map((i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}</div></Container>;

  const canRefund = payment?.status === 'succeeded' && payment?.booking?.event?.startDate && new Date(payment.booking.event.startDate) > new Date();

  return (
    <Container aria-label="Payment details"><div className="py-5 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Payment Details</h1>
          <StatusBadge status={payment?.status} />
        </div>
      </div>

      {/* Amount hero */}
      <div className="text-center py-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Amount</p>
        <p className={`text-3xl font-extrabold font-heading ${payment?.status === 'refunded' ? 'text-blue-500' : 'text-foreground'}`}>
          {payment?.status === 'refunded' ? '-' : ''}{formatPrice(payment?.amount || 0)}
        </p>
        {payment?.refundAmount > 0 && payment.status !== 'refunded' && (
          <p className="text-xs text-blue-500 mt-1">Partially refunded: {formatPrice(payment.refundAmount)}</p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Transaction Info</CardTitle></CardHeader>
        <CardContent>
          <Row label="Transaction ID" value={payment?.gatewayPaymentId || payment?.gatewayTransactionId || payment?._id} icon={Hash} mono />
          <Row label="Date" value={formatDate(payment?.createdAt)} icon={Calendar} />
          <Row label="Payment Method" value={(payment?.paymentMethod?.type || payment?.gateway || 'stripe').replace(/_/g, ' ')} icon={CreditCard} />
          <Row label="Gateway" value={payment?.gateway} />
        </CardContent>
      </Card>

      {payment?.booking && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Booking Info</CardTitle></CardHeader>
          <CardContent>
            <Row label="Event" value={payment.booking.event?.title} icon={Ticket} />
            <Row label="Booking Ref" value={payment.booking.bookingRef} mono />
          <Row label="Tickets" value={`${payment.booking?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}` } />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {(payment?.booking?.bookingRef || payment?.booking?._id) && (
          <Link
            to={ROUTES.BOOKINGS.DETAIL(
              payment.booking.bookingRef || payment.booking._id,
            )}
            className="flex-1"
          >
            <Button variant="outline" className="w-full font-semibold"><Ticket className="h-4 w-4 mr-2" />View Booking</Button>
          </Link>
        )}
        {canRefund && (
          <Button variant="outline" className="flex-1 border-blue-500/30 text-blue-500" onClick={handleRefund} disabled={refunding}>
            <RefreshCcw className="h-4 w-4 mr-2" />{refunding ? 'Requesting…' : 'Request Refund'}
          </Button>
        )}
      </div>
    </div></Container>
  );
};

export default PaymentDetailsPage;
