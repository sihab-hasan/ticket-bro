// pages/bookings/BookingDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, XCircle, MessageSquare,
  Star, Calendar, MapPin, Ticket, User, CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }       from '@/components/ui/button';
import { Skeleton }     from '@/components/ui/skeleton';
import PageHeader       from '@/components/shared/PageHeader';
import { StatusBadge }  from '@/components/shared/StatusBadge';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast }        from '@/components/shared/common';
import { ROUTES }       from '@/app/AppRoutes';
import { bookingService } from '@/api';
import { downloadBlob } from '@/utils/downloadFile';
import useAuth          from '@/context/AuthContext';
import Container from '@/components/layout/Container';

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
  const { bookingId }   = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setBooking(await bookingService.getByRef(bookingId));
      } catch {
        toast.error('Booking not found');
        navigate(ROUTES.BOOKINGS.ROOT);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, navigate]);

  const handleDownload = async () => {
    try {
      const blob = await bookingService.getInvoice(bookingId);
      downloadBlob(blob, `booking-${bookingId}.pdf`);
    } catch { toast.error('Download failed'); }
  };

  if (loading) return (
    <Container><div className="py-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div></Container>
  );

  const canCancel = booking?.status === 'confirmed' && new Date(booking?.event?.startDate) > new Date();
  const canReview = booking?.status === 'confirmed' && new Date(booking?.event?.endDate) < new Date();

  // booking.event.organizer = User ObjectId (the organizer's user _id)
  // booking.organizer = same field from booking model directly
  const organizerUserId =
    booking?.event?.organizer?._id ||
    booking?.event?.organizer?.id ||
    (typeof booking?.event?.organizer === 'string' ? booking.event.organizer : null) ||
    booking?.organizer?._id ||
    (typeof booking?.organizer === 'string' ? booking.organizer : null);

  const currentUserId = user?._id || user?.id;
  const eventId       = booking?.event?._id || booking?.event?.id;

  // Don't show message button if the current user IS the organizer
  const canMessage = organizerUserId &&
    String(organizerUserId) !== String(currentUserId);

  return (
    <Container aria-label="Booking details"><div className="py-5 space-y-5 font-sans max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9"
          onClick={() => navigate(ROUTES.BOOKINGS.ROOT)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Booking Details"
          subtitle={`Ref: ${booking?.bookingRef || bookingId?.slice(-8).toUpperCase()}`}
          className="mb-0"
        />
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-2xl flex items-center gap-3 ${
        booking?.status === 'confirmed'
          ? 'bg-green-500/8 border border-green-500/20'
          : 'bg-muted border border-border'
      }`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={booking?.status} />
          </div>
          <p className="text-sm font-bold font-heading">{booking?.event?.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(booking?.event?.startDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold font-heading text-green-600">
            {formatPrice(booking?.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking?.quantity || 1} ticket{(booking?.quantity || 1) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          {booking?.event?.coverImage && (
            <img src={booking.event.coverImage} alt=""
              className="w-full h-40 object-cover rounded-xl mb-4" />
          )}
          <InfoRow label="Event"       value={booking?.event?.title}     icon={Calendar} />
          <InfoRow label="Date & Time" value={formatDate(booking?.event?.startDate)} icon={Calendar} />
          <InfoRow label="Venue"       value={[
            booking?.event?.venue?.name, booking?.event?.venue?.city
          ].filter(Boolean).join(', ')}                                  icon={MapPin} />
          <InfoRow label="Ticket Type" value={booking?.ticketType?.name} icon={Ticket} />
          <InfoRow label="Organizer"   value={
            booking?.event?.organizer?.name ||
            booking?.event?.organizer?.displayName ||
            booking?.event?.organizer?.firstName
          }                                                               icon={User} />
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Subtotal"
            value={formatPrice((booking?.totalAmount || 0) - (booking?.serviceFee || 0))}
            icon={CreditCard} />
          <InfoRow label="Service Fee" value={formatPrice(booking?.serviceFee || 0)} />
          <div className="flex items-center justify-between py-3 mt-1">
            <span className="text-sm font-bold">Total Paid</span>
            <span className="text-lg font-extrabold font-heading text-green-600">
              {formatPrice(booking?.totalAmount)}
            </span>
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

        {canMessage && (
          <Link
            to={`${ROUTES.MESSAGES.CHAT(organizerUserId)}${eventId ? `?eventId=${eventId}` : ''}`}
            className="flex-1"
          >
            <Button variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/5">
              <MessageSquare className="h-4 w-4 mr-2" /> Message Organizer
            </Button>
          </Link>
        )}

        {canCancel && (
          <Link to={ROUTES.BOOKINGS.CANCEL(bookingId)} className="flex-1">
            <Button variant="outline"
              className="w-full border-red-500/30 text-red-500 hover:bg-red-500/5">
              <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
            </Button>
          </Link>
        )}

        {canReview && (
          <Link to={ROUTES.REVIEWS.WRITE(booking?.event?._id || booking?.event?.slug)} className="flex-1">
            <Button className="w-full font-bold">
              <Star className="h-4 w-4 mr-2" /> Write Review
            </Button>
          </Link>
        )}
      </div>
    </div></Container>
  );
};

export default BookingDetailsPage;
