// pages/bookings/CancelBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import Container from '@/components/layout/Container';

const CANCEL_REASONS = [
  "I can no longer attend", "Change of plans", "Found better alternative",
  "Emergency / illness", "Event not as described", "Duplicate booking", "Other",
];

const CancelBookingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setBooking(await bookingService.getByRef(bookingId));
      } catch { toast.error('Booking not found'); navigate(ROUTES.BOOKINGS.ROOT); }
      finally { setLoading(false); }
    })();
  }, [bookingId, navigate]);

  // Calculate refund amount based on event date
  const getRefundInfo = () => {
    if (!booking?.event?.startDate) return { amount: 0, pct: 0, label: 'No refund' };
    const now = new Date();
    const eventDate = new Date(booking.event.startDate);
    const daysUntil = (eventDate - now) / (1000 * 60 * 60 * 24);
    if (daysUntil < 0) return { amount: 0, pct: 0, label: 'Event already passed' };
    if (daysUntil >= 7) return { amount: booking.totalAmount * 0.9, pct: 90, label: '90% refund (7+ days before event)' };
    if (daysUntil >= 2) return { amount: booking.totalAmount * 0.5, pct: 50, label: '50% refund (2-7 days before event)' };
    return { amount: 0, pct: 0, label: 'No refund (less than 2 days before event)' };
  };

  const refundInfo = getRefundInfo();

  const handleCancel = async () => {
    if (!reason) return toast.error('Please select a reason');
    setCancelling(true);
    try {
      await bookingService.cancel(bookingId, { reason, note });
      setCancelled(true);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Cancellation failed'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Container><div className="py-4 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-2xl" /></div></Container>;

  if (cancelled) return (
    <Container><div className="py-6 max-w-md mx-auto text-center space-y-4 font-sans">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-xl font-extrabold font-heading">Booking Cancelled</h2>
      <p className="text-sm text-muted-foreground">Your booking has been cancelled. {refundInfo.amount > 0 ? `A refund of ${formatPrice(refundInfo.amount)} will be processed to your original payment method within 5-10 business days.` : 'No refund is applicable for this cancellation.'}</p>
      <Button onClick={() => navigate(ROUTES.BOOKINGS.ROOT)} className="w-full font-bold">Back to My Bookings</Button>
    </div></Container>
  );

  return (
    <Container aria-label="Cancel booking"><div className="py-5 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(ROUTES.BOOKINGS.DETAIL(bookingId))}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Cancel Booking" subtitle={booking?.event?.title} className="mb-0" />
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/8 border border-destructive/20">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-destructive">Are you sure you want to cancel?</p>
          <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone. Please review the refund policy below.</p>
        </div>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
            {booking?.event?.coverImage && <img src={booking.event.coverImage} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{booking?.event?.title}</p>
            <p className="text-xs text-muted-foreground">{formatDate(booking?.event?.startDate, { dateStyle: 'medium', timeStyle: undefined })}</p>
            <p className="text-xs font-semibold text-green-600 mt-0.5">Paid: {formatPrice(booking?.totalAmount)}</p>
          </div>
          <StatusBadge status={booking?.status} />
        </CardContent>
      </Card>

      {/* Refund Policy */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Refund Estimate</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: '7+ days before event', amount: '90% refund', active: refundInfo.pct === 90 },
            { label: '2-7 days before event', amount: '50% refund', active: refundInfo.pct === 50 },
            { label: 'Under 2 days / after event', amount: 'No refund', active: refundInfo.pct === 0 },
          ].map((r) => (
            <div key={r.label} className={`flex justify-between py-2 px-3 rounded-lg text-sm ${r.active ? 'bg-primary/10 font-semibold' : 'text-muted-foreground'}`}>
              <span>{r.label}</span>
              <span>{r.amount}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-border text-sm font-bold">
            <span>Your Refund</span>
            <span className="text-green-600">{formatPrice(refundInfo.amount)} ({refundInfo.pct}%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Form */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reason for cancellation *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Additional notes (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tell us more…" rows={3} className="text-sm resize-none" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate(ROUTES.BOOKINGS.DETAIL(bookingId))}>Keep Booking</Button>
        <Button variant="destructive" className="flex-1 font-bold" onClick={handleCancel} disabled={cancelling || !reason}>
          {cancelling ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Cancelling…</> : <><XCircle className="h-4 w-4 mr-2" />Confirm Cancel</>}
        </Button>
      </div>
    </div></Container>
  );
};

export default CancelBookingPage;
