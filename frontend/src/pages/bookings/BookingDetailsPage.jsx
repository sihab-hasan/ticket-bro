// pages/bookings/BookingDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, XCircle, MessageSquare, Star, Calendar, MapPin, Ticket, User, CreditCard, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService } from '@/api';
import { downloadBlob } from '@/utils/downloadFile';

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setBooking(await bookingService.getByRef(bookingId));
      } catch { toast.error('Booking not found'); navigate(ROUTES.BOOKINGS.ROOT); }
      finally { setLoading(false); }
    })();
  }, [bookingId, navigate]);

  const handleDownload = async () => {
    try {
      const blob = await bookingService.getInvoice(bookingId);
      downloadBlob(blob, `booking-${bookingId}.pdf`);
    } catch { toast.error('Download failed'); }
  };

  if (loading) return (
    <div className="p-4 sm:p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
  );

  const totalTickets = Array.isArray(booking?.items) ? booking.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : (booking?.totalTickets || booking?.quantity || 0);
  const canCancel = booking?.status === 'confirmed' && booking?.event?.startDate && new Date(booking.event.startDate) > new Date();
  const canReview = booking?.status === 'confirmed' && booking?.event?.endDate && new Date(booking.event.endDate) < new Date();

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(ROUTES.BOOKINGS.ROOT)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Booking Details" subtitle={`Ref: ${booking?.bookingRef || bookingId?.slice(-8).toUpperCase()}`} className="mb-0" />
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-2xl flex items-center gap-3 ${booking?.status === 'confirmed' ? 'bg-green-500/8 border border-green-500/20' : 'bg-muted border border-border'}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={booking?.status} />
          </div>
          <p className="text-sm font-bold font-heading">{booking?.event?.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(booking?.event?.startDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold font-heading text-green-600">{formatPrice(booking?.totalAmount)}</p>
          <p className="text-xs text-muted-foreground">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Event Details</CardTitle></CardHeader>
        <CardContent>
          {booking?.event?.coverImage && (
            <img src={booking.event.coverImage} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />
          )}
          <InfoRow label="Event" value={booking?.event?.title} icon={Calendar} />
          <InfoRow label="Date & Time" value={formatDate(booking?.event?.startDate)} icon={Calendar} />
          <InfoRow label="Venue" value={[booking?.event?.venue?.name, booking?.event?.venue?.city].filter(Boolean).join(', ')} icon={MapPin} />
          {/* Display ticket types summary. If multiple types, show count or label. */}
          <InfoRow
            label="Ticket Type"
            value={(() => {
              if (Array.isArray(booking?.items)) {
                const unique = Array.from(new Set(booking.items.map((it) => it.ticketTypeName))).filter(Boolean);
                return unique.length === 1 ? `${unique[0]} × ${totalTickets}` : `${unique.length} types`; }
              return booking?.ticketType?.name;
            })()}
            icon={Ticket}
          />
          <InfoRow label="Organizer" value={booking?.event?.organizer?.name} icon={User} />
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Payment Summary</CardTitle></CardHeader>
        <CardContent>
          <InfoRow label="Subtotal" value={formatPrice((booking?.totalAmount || 0) - (booking?.serviceFee || 0))} icon={CreditCard} />
          <InfoRow label="Service Fee" value={formatPrice(booking?.serviceFee || 0)} />
          <div className="flex items-center justify-between py-3 mt-1">
            <span className="text-sm font-bold">Total Paid</span>
            <span className="text-lg font-extrabold font-heading text-green-600">{formatPrice(booking?.totalAmount)}</span>
          </div>
          <InfoRow label="Payment Method" value={booking?.paymentMethod || 'Card'} />
          <InfoRow label="Transaction ID" value={booking?.payment?.gatewayTransactionId} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" /> Download Invoice
        </Button>
        {canCancel && (
          <Link to={ROUTES.BOOKINGS.CANCEL(bookingId)} className="flex-1">
            <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/5">
              <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
            </Button>
          </Link>
        )}
        {canReview && (
          <Link to={ROUTES.REVIEWS.WRITE} className="flex-1">
            <Button className="w-full font-bold">
              <Star className="h-4 w-4 mr-2" /> Leave App Review
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsPage;
