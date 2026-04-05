// pages/tickets/TicketDownloadPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, ArrowLeft, QrCode, Calendar, MapPin, Ticket, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';
import { bookingService, ticketsService } from '@/api';
import { downloadBlob } from '@/utils/downloadFile';

const TicketCard = ({ ticket, onDownload }) => (
  <Card className="overflow-hidden border-2 border-border">
    {/* Ticket header */}
    <div className="bg-primary p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-black/60 uppercase tracking-wider">Ticket-Bro</p>
        <p className="text-lg font-extrabold font-heading text-black">{ticket.event?.title}</p>
      </div>
      <Ticket className="h-8 w-8 text-black/40" />
    </div>
    {/* Dashed separator (ticket tear-off effect) */}
    <div className="relative border-t-2 border-dashed border-border flex items-center">
      <div className="absolute -left-3.5 w-7 h-7 rounded-full bg-background border-2 border-border" />
      <div className="absolute -right-3.5 w-7 h-7 rounded-full bg-background border-2 border-border" />
    </div>
    <CardContent className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Date</p><p className="font-semibold mt-0.5">{formatDate(ticket.event?.startDate, { dateStyle: 'medium', timeStyle: undefined })}</p></div>
        <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Time</p><p className="font-semibold mt-0.5">{ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p></div>
        <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Venue</p><p className="font-semibold mt-0.5">{ticket.event?.venue?.name || ticket.event?.venue?.city || 'Online'}</p></div>
        <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Type</p><p className="font-semibold mt-0.5">{ticket.ticketType?.name || ticket.ticketTypeName || 'General'}</p></div>
        <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Holder</p><p className="font-semibold mt-0.5">{ticket.holderName || ticket.user?.firstName + ' ' + ticket.user?.lastName}</p></div>
        <div><p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p><Badge className="mt-0.5 bg-green-500/10 text-green-600 border-0 text-[11px]">{ticket.isUsed ? 'Used' : 'Valid'}</Badge></div>
      </div>
      <Separator />
      {/* QR Code placeholder */}
      <div className="flex flex-col items-center py-3">
        {ticket.qrCodeUrl ? (
          <img src={ticket.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
        ) : (
          <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
            <QrCode className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <p className="text-xs font-mono font-bold text-muted-foreground mt-2">{ticket.ticketCode || ticket.code || ticket._id?.slice(-12).toUpperCase()}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Show this QR code at the entrance</p>
      </div>
      <Button onClick={() => onDownload(ticket)} variant="outline" size="sm" className="w-full font-semibold">
        <Download className="h-3.5 w-3.5 mr-2" />Download Ticket PDF
      </Button>
    </CardContent>
  </Card>
);

const TicketDownloadPage = () => {
  const { ticketId: bookingId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tickRes, bookRes] = await Promise.allSettled([
          bookingService.getTickets(bookingId),
          bookingService.getByRef(bookingId),
        ]);
        if (tickRes.status === 'fulfilled') setTickets(tickRes.value?.tickets || tickRes.value || []);
        if (bookRes.status === 'fulfilled') setBooking(bookRes.value);
      } catch { toast.error('Failed to load tickets'); }
      finally { setLoading(false); }
    })();
  }, [bookingId]);

  const downloadTicket = async (ticket) => {
    try {
      const blob = await ticketsService.download(ticket.code || ticket._id);
      downloadBlob(blob, `ticket-${ticket.code || ticket._id}.pdf`);
    } catch { toast.error('Download failed'); }
  };

  const downloadAll = async () => {
    try {
      const blob = await bookingService.getInvoice(bookingId);
      downloadBlob(blob, `all-tickets-${bookingId}.pdf`);
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="content-shell" aria-label="Download tickets"><div className="py-5 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Link to={ROUTES.BOOKINGS.DETAIL(bookingId)}>
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Your Tickets</h1>
          <p className="text-xs text-muted-foreground">{booking?.event?.title}</p>
        </div>
      </div>

      {tickets.length > 1 && (
        <Button onClick={downloadAll} className="w-full font-bold">
          <Download className="h-4 w-4 mr-2" />Download All Tickets ({tickets.length})
        </Button>
      )}

      {loading ? (
        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14">
            <Ticket className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No tickets found for this booking</p>
          </CardContent>
        </Card>
      ) : tickets.map((t) => <TicketCard key={t._id} ticket={t} onDownload={downloadTicket} />)}
    </div></div>
  );
};

export default TicketDownloadPage;
