// pages/tickets/TicketBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Phone, Mail, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { cartService, bookingService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import Container from '@/components/layout/Container';

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
    {children}
  </div>
);

const TicketBookingPage = () => {
  const { ticketId: eventId } = useParams(); // route param is ticketId (treated as bookingId for payment)
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    attendees: [],
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' }));
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const d = await cartService.getCart();
        setCart(d);
        // Prefill attendee forms for each ticket
        const totalTickets = (d?.items || []).reduce((sum, item) => sum + item.quantity, 0);
        setForm((f) => ({ ...f, attendees: Array.from({ length: Math.max(0, totalTickets - 1) }, () => ({ firstName: '', lastName: '', email: '' })) }));
      } catch { toast.error('Failed to load cart'); navigate(ROUTES.CART.ROOT); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setAttendee = (i, key, val) => setForm((f) => { const a = [...f.attendees]; a[i] = { ...a[i], [key]: val }; return { ...f, attendees: a }; });

  const handleContinue = async () => {
    if (!form.firstName || !form.email) return toast.error('Primary contact details required');
    setSubmitting(true);
    try {
      // Ensure we have the latest cart data
      const currentCart = cart || (await cartService.getCart());
      if (!currentCart?.items?.length) {
        toast.error('Cart is empty');
        setSubmitting(false);
        return;
      }
      // Derive event id from the first cart item (cart items should all belong to the same event)
      const eventIdActual = currentCart.items[0]?.event?._id || currentCart.items[0]?.event || eventId;
      // Build booking items array using authoritative ticketType IDs and quantities
      const bookingItems = currentCart.items.map((item) => ({
        ticketTypeId: item?.ticketType?._id || item?.ticketType || item?.ticketTypeId,
        quantity: Number(item?.quantity ?? 0),
        seats: [],
        attendees: [],
      }));
      // Create booking on the backend; this will also reserve inventory
      const booking = await bookingService.create({
        eventId: eventIdActual,
        items: bookingItems,
        contactName: `${form.firstName} ${form.lastName}`.trim(),
        contactEmail: form.email,
        contactPhone: form.phone,
      });
      // Clear cart since booking now holds reserved inventory
      await cartService.clearCart();
      // Navigate to payment step with booking reference
      const ref = booking?.bookingRef || booking?._id;
      if (ref) {
        navigate(ROUTES.TICKETS.PAYMENT(ref));
      } else {
        navigate(ROUTES.TICKETS.PAYMENT(eventIdActual));
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to create booking'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Container><div className="py-4 space-y-4 max-w-lg mx-auto">{[1,2,3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></Container>;

  const items = cart?.items || [];
  const total = items.reduce((s, item) => s + item.totalPrice, 0);

  return (
    <Container aria-label="Ticket booking"><div className="py-5 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Booking Details</h1>
          <p className="text-xs text-muted-foreground">Step 1 of 2 — Contact info</p>
        </div>
      </div>

      {/* Order summary */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.ticketType?.name || 'Ticket'} × {item.quantity}</span>
              <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Primary contact */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><User className="h-4 w-4" />Your Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required><Input value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} className="h-9" /></Field>
            <Field label="Last Name" required><Input value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} className="h-9" /></Field>
          </div>
          <Field label="Email" required><Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className="h-9" /></Field>
          <Field label="Phone"><Input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="h-9" /></Field>
        </CardContent>
      </Card>

      {/* Additional attendees */}
      {form.attendees.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><Users className="h-4 w-4" />Additional Attendees</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.attendees.map((att, i) => (
              <div key={i} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-muted-foreground">Attendee {i + 2}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name"><Input value={att.firstName} onChange={(e) => setAttendee(i, 'firstName', e.target.value)} className="h-9" /></Field>
                  <Field label="Last Name"><Input value={att.lastName} onChange={(e) => setAttendee(i, 'lastName', e.target.value)} className="h-9" /></Field>
                </div>
                <Field label="Email"><Input type="email" value={att.email} onChange={(e) => setAttendee(i, 'email', e.target.value)} className="h-9" /></Field>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleContinue} disabled={submitting} className="w-full h-11 font-bold text-base">
        Continue to Payment <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div></Container>
  );
};

export default TicketBookingPage;
