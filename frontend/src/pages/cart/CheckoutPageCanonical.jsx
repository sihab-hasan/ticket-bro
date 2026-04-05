import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';
import { formatPrice } from '@/utils/formatters';
import { getApiErrorMessage } from '@/api/client';

const EMPTY_ATTENDEE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const CheckoutPageCanonical = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, isLoading, refreshCart, checkout } = useCart();
  const [processing, setProcessing] = useState(false);
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    if (!user) return;

    setContact({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user]);

  useEffect(() => {
    refreshCart().catch(() => {});
  }, [refreshCart]);

  const items = cart?.items || [];
  const ticketCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  useEffect(() => {
    if (!isLoading && ticketCount === 0) {
      toast.error('Your cart is empty');
      navigate(ROUTES.CART.ROOT, { replace: true });
    }
  }, [isLoading, navigate, ticketCount]);

  useEffect(() => {
    const nextCount = Math.max(0, ticketCount - 1);
    setAttendees((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] || { ...EMPTY_ATTENDEE }),
    );
  }, [ticketCount]);

  const setContactField = (key, value) => {
    setContact((current) => ({ ...current, [key]: value }));
  };

  const setAttendeeField = (index, key, value) => {
    setAttendees((current) =>
      current.map((attendee, attendeeIndex) =>
        attendeeIndex === index
          ? { ...attendee, [key]: value }
          : attendee,
      ),
    );
  };

  const handleCheckout = async () => {
    if (!contact.firstName || !contact.email) {
      toast.error('Contact first name and email are required');
      return;
    }

    setProcessing(true);

    try {
      const result = await checkout({
        contact,
        attendees,
      });
      const bookingRef = result?.bookingRef || result?.booking?.bookingRef;

      if (!bookingRef) {
        throw new Error('Booking reference was not returned.');
      }

      navigate(ROUTES.PAYMENTS.ROOT(bookingRef));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Checkout failed'));
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {[1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  const subtotal = Number(cart?.subtotal ?? items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0));
  const discount = Number(cart?.discount ?? cart?.discountAmount ?? 0);
  const total = Number(cart?.total ?? Math.max(0, subtotal - discount));

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(ROUTES.CART.ROOT)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Checkout</h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Secure booking creation
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Order Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {item.event?.coverImage ? (
                  <img src={item.event.coverImage} alt={item.event?.title || 'Event cover'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    {item.event?.title?.charAt(0)?.toUpperCase() || 'E'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{item.event?.title || 'Event'}</p>
                <p className="text-[11px] text-muted-foreground">
                  {item.ticketType?.name || item.ticketTypeName || 'Ticket'} x {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold shrink-0">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">First Name *</Label>
              <Input value={contact.firstName} onChange={(event) => setContactField('firstName', event.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Last Name</Label>
              <Input value={contact.lastName} onChange={(event) => setContactField('lastName', event.target.value)} className="mt-1 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Email *</Label>
            <Input type="email" value={contact.email} onChange={(event) => setContactField('email', event.target.value)} className="mt-1 h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Phone</Label>
            <Input type="tel" value={contact.phone} onChange={(event) => setContactField('phone', event.target.value)} className="mt-1 h-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Attendees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            The primary contact above receives the booking confirmation and the first ticket.
          </div>
          {attendees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional attendee details are needed for this order.</p>
          ) : (
            attendees.map((attendee, index) => (
              <div key={`attendee-${index}`} className="space-y-3 rounded-xl border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Attendee {index + 2}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">First Name</Label>
                    <Input value={attendee.firstName} onChange={(event) => setAttendeeField(index, 'firstName', event.target.value)} className="mt-1 h-9" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Last Name</Label>
                    <Input value={attendee.lastName} onChange={(event) => setAttendeeField(index, 'lastName', event.target.value)} className="mt-1 h-9" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input type="email" value={attendee.email} onChange={(event) => setAttendeeField(index, 'email', event.target.value)} className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Phone</Label>
                  <Input type="tel" value={attendee.phone} onChange={(event) => setAttendeeField(index, 'phone', event.target.value)} className="mt-1 h-9" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold">Stripe card payment</p>
            <p className="text-xs text-muted-foreground mt-1">
              The next step opens the secure Stripe payment form for this booking.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleCheckout} disabled={processing || !items.length} className="w-full h-12 font-bold text-base">
        {processing ? (
          <>
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Creating booking...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Continue to Payment - {formatPrice(total)}
          </>
        )}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground">
        By placing your order you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default CheckoutPageCanonical;
