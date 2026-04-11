// pages/payments/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, CreditCard, Wallet, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService, paymentsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import Container from '@/components/layout/Container';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const bookingRef = bookingId || searchParams.get('bookingRef') || searchParams.get('bookingId') || searchParams.get('id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!bookingRef);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('card');

  useEffect(() => {
    if (!bookingRef) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setBooking(await bookingService.getByRef(bookingRef));
      } catch {
        toast.error('Booking not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingRef, navigate]);

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (!bookingRef) throw new Error('Booking reference missing');
      const intent = await paymentsService.createIntent({ bookingRef, currency: booking?.currency || 'USD' });
      const paymentIntentId = intent.gatewayPaymentId || intent.paymentIntentId || intent.id || intent._id;
      await paymentsService.verifyPayment({ paymentIntentId, bookingRef });
      navigate(`/payments/success/${paymentIntentId}?ref=${bookingRef}`);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Payment failed'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Container><div className="py-4 space-y-4 max-w-lg mx-auto">{[1,2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div></Container>;

  const amount = booking?.totalAmount || 0;

  return (
    <Container aria-label="Payment"><div className="py-5 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold font-heading">Complete Payment</h1>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" />Secure</div>
      </div>

      {booking && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold">{booking.event?.title}</p>
            <p className="text-2xl font-extrabold font-heading text-primary mt-1">{formatPrice(amount)}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Choose Payment Method</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
            {[{ value: 'card', label: 'Credit / Debit Card' }, { value: 'mobile_banking', label: 'Mobile Banking' }, { value: 'bank_transfer', label: 'Bank Transfer' }].map((m) => (
              <div key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${method === m.value ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setMethod(m.value)}>
                <RadioGroupItem value={m.value} id={`pay-${m.value}`} />
                <Label htmlFor={`pay-${m.value}`} className="text-sm cursor-pointer">{m.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
        Your payment is secured with 256-bit SSL encryption.
      </div>

      <Button onClick={handlePay} disabled={processing} className="w-full h-12 font-bold text-base">
        {processing ? <><span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Processing…</> : <><Lock className="h-5 w-5 mr-2" />Pay {formatPrice(amount)}</>}
      </Button>
    </div></Container>
  );
};

export default PaymentPage;
