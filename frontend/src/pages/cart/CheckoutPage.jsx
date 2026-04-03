// pages/cart/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { cartService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => {
    if (user) setContact({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const d = await cartService.getCart();
        if (!d?.items?.length) { toast.error('Your cart is empty'); navigate(ROUTES.CART.ROOT); return; }
        setCart(d);
      } catch { navigate(ROUTES.CART.ROOT); }
      finally { setLoading(false); }
    })();
  }, []);

  const setField = (key, val) => setContact((f) => ({ ...f, [key]: val }));

  const handleCheckout = async () => {
    if (!contact.firstName || !contact.email) return toast.error('Contact details required');
    setProcessing(true);
    try {
      const d = await cartService.checkout({ paymentMethod, contact });
      const bookingRef = d?.bookingRef || d?.booking?.bookingRef || d?._id;

      if (d?.paymentIntentId) {
        // Handle payment intent redirect if needed
        navigate(ROUTES.TICKETS.PAYMENT(`checkout`) + `?intentId=${d.paymentIntentId}`);
      } else {
        navigate(ROUTES.TICKETS.CONFIRM(bookingRef));
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Checkout failed'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-4 space-y-4 max-w-lg mx-auto">{[1,2,3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>;

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const discount = cart?.discount || 0;
  const serviceFee = subtotal * 0.05;
  const total = subtotal - discount + serviceFee;

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(ROUTES.CART.ROOT)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-lg font-extrabold font-heading">Checkout</h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" />Secure checkout</div>
        </div>
      </div>

      {/* Order review */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Order Review</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.event?.coverImage && <img src={item.event.coverImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{item.event?.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.ticketType?.name} × {item.quantity}</p>
              </div>
              <p className="text-sm font-bold shrink-0">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatPrice(serviceFee)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatPrice(total)}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Contact Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-semibold">First Name *</Label><Input value={contact.firstName} onChange={(e) => setField('firstName', e.target.value)} className="mt-1 h-9" /></div>
            <div><Label className="text-xs font-semibold">Last Name</Label><Input value={contact.lastName} onChange={(e) => setField('lastName', e.target.value)} className="mt-1 h-9" /></div>
          </div>
          <div><Label className="text-xs font-semibold">Email *</Label><Input type="email" value={contact.email} onChange={(e) => setField('email', e.target.value)} className="mt-1 h-9" /></div>
          <div><Label className="text-xs font-semibold">Phone</Label><Input type="tel" value={contact.phone} onChange={(e) => setField('phone', e.target.value)} className="mt-1 h-9" /></div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Payment Method</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
            {[{ value: 'card', label: 'Credit / Debit Card' }, { value: 'mobile_banking', label: 'Mobile Banking (bKash/Nagad)' }, { value: 'bank_transfer', label: 'Bank Transfer' }].map((m) => (
              <div key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${paymentMethod === m.value ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setPaymentMethod(m.value)}>
                <RadioGroupItem value={m.value} id={`checkout-${m.value}`} />
                <Label htmlFor={`checkout-${m.value}`} className="text-sm cursor-pointer">{m.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Button onClick={handleCheckout} disabled={processing} className="w-full h-12 font-bold text-base">
        {processing ? (
          <><span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Processing…</>
        ) : (
          <><Lock className="h-5 w-5 mr-2" />Place Order — {formatPrice(total)}</>
        )}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground">By placing your order you agree to our Terms of Service and Privacy Policy.</p>
    </div>
  );
};

export default CheckoutPage;
