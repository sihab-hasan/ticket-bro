// pages/tickets/TicketConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Calendar, MapPin, Share2, ArrowRight, Ticket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService } from '@/api';
import { downloadBlob } from '@/utils/downloadFile';

const TicketConfirmationPage = () => {
  const { bookingId: bookingRef } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setBooking(await bookingService.getByRef(bookingRef));
      } catch {
        // Keep the confirmation page usable even if the booking lookup fails.
      } finally { setLoading(false); }
    })();
  }, [bookingRef]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await bookingService.getInvoice(bookingRef);
      downloadBlob(blob, `tickets-${bookingRef}.pdf`);
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  };

  const handleShare = async () => {
    const text = `I'm going to ${booking?.event?.title}! 🎉`;
    if (navigator.share) {
      navigator.share({ title: 'My Ticket', text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  if (loading) return <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto">{[1,2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>;

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      {/* Success hero */}
      <div className="text-center py-6 space-y-3">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto animate-[bounceIn_0.5s_ease]">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-heading">Booking Confirmed!</h1>
          <p className="text-sm text-muted-foreground mt-1">Your tickets have been sent to your email.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Ticket className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold font-mono text-primary">{bookingRef}</span>
        </div>
      </div>

      {/* Event card */}
      {booking?.event && (
        <Card className="overflow-hidden">
          {booking.event.coverImage && (
            <div className="h-40 overflow-hidden">
              <img src={booking.event.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-bold font-heading">{booking.event.title}</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDate(booking.event.startDate)}</span>
              </div>
              {booking.event.venue && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{[booking.event.venue.name, booking.event.venue.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Tickets booked</p>
                <p className="text-sm font-bold">{booking.quantity || 1} × {booking.ticketType?.name || 'General'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total paid</p>
                <p className="text-base font-extrabold font-heading text-green-600">{formatPrice(booking.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next steps */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What's next</p>
          {[
            { num: '1', text: 'Check your email for your e-tickets' },
            { num: '2', text: 'Download or screenshot your QR code' },
            { num: '3', text: 'Show QR code at the entrance' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{step.num}</span>
              <span className="text-sm">{step.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleDownload} disabled={downloading} className="font-semibold">
          <Download className="h-4 w-4 mr-2" />{downloading ? 'Downloading…' : 'Download'}
        </Button>
        <Button variant="outline" onClick={handleShare} className="font-semibold">
          <Share2 className="h-4 w-4 mr-2" />Share
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Link to={ROUTES.BOOKINGS.ROOT}>
          <Button className="w-full font-bold">View My Bookings <ArrowRight className="h-4 w-4 ml-2" /></Button>
        </Link>
        <Link to={ROUTES.BROWSE.ROOT}>
          <Button variant="ghost" className="w-full text-muted-foreground">Browse More Events</Button>
        </Link>
      </div>
    </div>
  );
};

export default TicketConfirmationPage;
