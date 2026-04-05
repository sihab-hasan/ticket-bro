// pages/tickets/TicketPaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService, paymentsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import Container from '@/components/layout/Container';

const TicketPaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '' });

  useEffect(() => {
    // Fetch booking details using the booking reference from the URL
    (async () => {
      try {
        const data = await bookingService.getByRef(bookingId);
        setBooking(data);
      } catch {
        toast.error('Booking not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, bookingId]);

  const setCard = (key, val) => setCardForm((f) => ({ ...f, [key]: val }));

  const formatCardNumber = (val) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) => { const v = val.replace(/\D/g, ''); return v.length >= 2 ? `${v.slice(0,2)}/${v.slice(2,4)}` : v; };

  // Promo code functionality is disabled for bookings. If future promotion support is added
  // at the booking level, handlers can be implemented here.

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (!booking) throw new Error('Booking not found');
      // Create payment intent for the current booking
      const intent = await paymentsService.createIntent({ bookingRef: booking.bookingRef, currency: booking.currency || 'USD' });
      // Determine the payment intent id from response
      const paymentIntentId = intent.gatewayPaymentId || intent.paymentIntentId || intent.id || intent._id;
      // Verify payment (mocked for non-Stripe environments)
      await paymentsService.verifyPayment({ paymentIntentId, bookingRef: booking.bookingRef });
      // Clear stored contact details from booking step
      sessionStorage.removeItem('booking_contact');
      // Navigate to confirmation page using booking reference
      navigate(ROUTES.TICKETS.CONFIRM(booking.bookingRef));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Payment failed. Please try again.'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>;

  const items = booking?.items || [];
  const subtotal = items.reduce((s, item) => s + ((item.totalPrice != null ? item.totalPrice : (item.unitPrice || 0) * (item.quantity || 0))), 0);
  const discount = 0; // Currently no discount support for bookings
  const serviceFee = subtotal * 0.05;
  const total = subtotal - discount + serviceFee;

  return (
    <Container className="py-6">
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Payment</h1>
          <p className="text-xs text-muted-foreground">Step 2 of 2 — Secure checkout</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />SSL secured
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{item.ticketType?.name} × {item.quantity}</span>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Service fee (5%)</span><span>{formatPrice(serviceFee)}</span></div>
          <Separator />
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatPrice(total)}</span></div>
        </CardContent>
      </Card>

      {/* Promo Code section disabled for bookings; implement promotions at booking level if needed */}

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment Method</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
            {[
              { value: 'card', label: 'Credit / Debit Card', icon: CreditCard },
              { value: 'mobile_banking', label: 'Mobile Banking (bKash / Nagad)', icon: Wallet },
              { value: 'bank_transfer', label: 'Bank Transfer', icon: Wallet },
            ].map((m) => (
              <div key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${paymentMethod === m.value ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setPaymentMethod(m.value)}>
                <RadioGroupItem value={m.value} id={m.value} />
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={m.value} className="text-sm font-medium cursor-pointer flex-1">{m.label}</Label>
              </div>
            ))}
          </RadioGroup>

          {paymentMethod === 'card' && (
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs font-semibold">Card Number</Label>
                <Input value={cardForm.number} onChange={(e) => setCard('number', formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" className="mt-1.5 h-9 font-mono" maxLength={19} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Cardholder Name</Label>
                <Input value={cardForm.name} onChange={(e) => setCard('name', e.target.value)} placeholder="John Doe" className="mt-1.5 h-9" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Expiry (MM/YY)</Label>
                  <Input value={cardForm.expiry} onChange={(e) => setCard('expiry', formatExpiry(e.target.value))} placeholder="MM/YY" className="mt-1.5 h-9 font-mono" maxLength={5} />
                </div>
                <div>
                  <Label className="text-xs font-semibold">CVC</Label>
                  <Input value={cardForm.cvc} onChange={(e) => setCard('cvc', e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="123" className="mt-1.5 h-9 font-mono" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handlePay} disabled={processing} className="w-full h-12 font-bold text-base">
        {processing ? (
          <><span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Processing Payment…</>
        ) : (
          <><Lock className="h-5 w-5 mr-2" />Pay {formatPrice(total)}</>
        )}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground">By completing payment you agree to our Terms of Service. All transactions are encrypted.</p>
    </div>
    </Container>
  );
};

export default TicketPaymentPage;
