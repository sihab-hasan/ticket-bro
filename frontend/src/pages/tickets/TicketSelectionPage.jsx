// pages/tickets/TicketSelectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Plus, Minus, ShoppingCart, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { cartService, eventsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const TicketSelectionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.allSettled([
          eventsService.getEventBySlug(eventId),
          eventsService.getTicketTypes(eventId),
        ]);
        if (eventRes.status === 'fulfilled') setEvent(eventRes.value);
        if (ticketsRes.status === 'fulfilled') {
          setTicketTypes(ticketsRes.value);
          setQuantities(Object.fromEntries(ticketsRes.value.map((t) => [t._id, 0])));
        }
      } catch { toast.error('Failed to load event'); }
      finally { setLoading(false); }
    })();
  }, [eventId]);

  const adjust = (id, delta) => {
    const tt = ticketTypes.find((t) => t._id === id);
    const max = Math.min(10, (tt?.quantity || 0) - (tt?.soldCount || 0));
    setQuantities((q) => ({ ...q, [id]: Math.max(0, Math.min(max, (q[id] || 0) + delta)) }));
  };

  const selected = ticketTypes.filter((t) => quantities[t._id] > 0);
  const total = selected.reduce((sum, t) => sum + (t.price * quantities[t._id]), 0);
  const totalTickets = selected.reduce((sum, t) => sum + quantities[t._id], 0);

  const handleAddToCart = async () => {
    if (totalTickets === 0) return toast.error('Select at least one ticket');
    setAdding(true);
    try {
      for (const t of selected) {
        await cartService.addItem({
          eventId: event?._id || eventId,
          ticketTypeId: t._id,
          ticketTypeName: t.name,
          quantity: quantities[t._id],
          unitPrice: t.price,
        });
      }
      toast.success('Added to cart!');
      navigate(ROUTES.CART.ROOT);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to add to cart'));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      {[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Select Tickets</h1>
          <p className="text-xs text-muted-foreground">{event?.title}</p>
        </div>
      </div>

      {/* Event summary */}
      <Card>
        <CardContent className="p-4 flex gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
            {event?.coverImage && <img src={event.coverImage} alt="" className="w-full h-full object-cover" />}
          </div>
          <div>
            <p className="text-sm font-bold">{event?.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event?.startDate, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <p className="text-xs text-muted-foreground">{event?.venue?.name || event?.venue?.city}</p>
          </div>
        </CardContent>
      </Card>

      {/* Ticket types */}
      <div className="space-y-3">
        {ticketTypes.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No tickets available</CardContent></Card>
        ) : ticketTypes.map((tt) => {
          const available = (tt.quantity || 0) - (tt.soldCount || 0);
          const qty = quantities[tt._id] || 0;
          const isSoldOut = available <= 0;
          return (
            <Card key={tt._id} className={isSoldOut ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{tt.name}</p>
                      <Badge variant="secondary" className="text-[10px] capitalize">{tt.type}</Badge>
                      {isSoldOut && <Badge variant="destructive" className="text-[10px]">Sold Out</Badge>}
                    </div>
                    <p className="text-lg font-extrabold font-heading text-primary mt-1">
                      {tt.price === 0 ? 'FREE' : formatPrice(tt.price)}
                    </p>
                    {tt.description && <p className="text-xs text-muted-foreground mt-1">{tt.description}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">{available} remaining</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => adjust(tt._id, -1)} disabled={qty === 0 || isSoldOut}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-sm font-bold w-6 text-center">{qty}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => adjust(tt._id, 1)} disabled={isSoldOut || qty >= Math.min(10, available)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order summary */}
      {totalTickets > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-2">
            {selected.map((t) => (
              <div key={t._id} className="flex justify-between text-sm">
                <span>{t.name} × {quantities[t._id]}</span>
                <span className="font-semibold">{formatPrice(t.price * quantities[t._id])}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm font-bold">
              <span>Total ({totalTickets} ticket{totalTickets > 1 ? 's' : ''})</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleAddToCart} disabled={totalTickets === 0 || adding} className="w-full h-11 font-bold text-base">
        {adding ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Adding…</> : <><ShoppingCart className="h-5 w-5 mr-2" />Add to Cart{totalTickets > 0 ? ` (${totalTickets})` : ''}</>}
      </Button>
    </div>
  );
};

export default TicketSelectionPage;
