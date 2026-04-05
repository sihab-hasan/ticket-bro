import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService, paymentsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#111827',
      '::placeholder': {
        color: '#6b7280',
      },
    },
  },
};

const StripeCardForm = ({ booking, intent, onVerified }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error('Stripe is still loading. Please wait a moment.');
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error('Card details are required.');
      return;
    }

    setProcessing(true);

    try {
      const result = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: booking?.contact?.name || booking?.contactName || 'Ticket Bro Customer',
            email: booking?.contact?.email || booking?.contactEmail || undefined,
            phone: booking?.contact?.phone || booking?.contactPhone || undefined,
          },
        },
      });

      if (result.error) {
        throw result.error;
      }

      if (!result.paymentIntent?.id) {
        throw new Error('Stripe did not return a payment confirmation.');
      }

      await onVerified(result.paymentIntent.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Payment failed'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Card Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border bg-white px-3 py-4">
          <CardElement options={cardElementOptions} />
        </div>
        <Button onClick={handleSubmit} disabled={processing || !stripe} className="w-full h-12 font-bold text-base">
          {processing ? (
            <>
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Processing payment...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Pay {formatPrice(booking?.totalAmount || 0)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const StubPaymentForm = ({ booking, intent, onVerified, processing, setProcessing }) => {
  const handleSubmit = async () => {
    setProcessing(true);

    try {
      await onVerified(intent.gatewayPaymentId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Payment failed'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          Stripe public key is not configured in this environment, so this page is using the backend demo payment flow.
        </div>
        <Button onClick={handleSubmit} disabled={processing} className="w-full h-12 font-bold text-base">
          {processing ? (
            <>
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Finalizing payment...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Confirm Payment - {formatPrice(booking?.totalAmount || 0)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const PaymentPageCanonical = () => {
  const navigate = useNavigate();
  const { bookingId: bookingRef } = useParams();
  const [booking, setBooking] = useState(null);
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!bookingRef) {
      navigate(ROUTES.BOOKINGS.ROOT, { replace: true });
      return;
    }

    (async () => {
      setLoading(true);

      try {
        const nextBooking = await bookingService.getByRef(bookingRef);
        setBooking(nextBooking);

        if (nextBooking?.paymentStatus === 'succeeded' || nextBooking?.status === 'confirmed' || nextBooking?.status === 'checked_in') {
          navigate(ROUTES.TICKETS.CONFIRM(bookingRef), { replace: true });
          return;
        }

        if (nextBooking?.status !== 'pending') {
          throw new Error('This booking is no longer payable.');
        }

        const nextIntent = await paymentsService.createIntent({ bookingRef });
        setIntent(nextIntent);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to start payment'));
        navigate(ROUTES.BOOKINGS.DETAIL(bookingRef), { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingRef, navigate]);

  const handleVerified = async (paymentIntentId) => {
    const verification = await paymentsService.verifyPayment({
      paymentIntentId,
      bookingRef,
    });

    if (verification?.status === 'succeeded') {
      toast.success('Payment successful');
      navigate(ROUTES.TICKETS.CONFIRM(bookingRef), { replace: true });
      return;
    }

    throw new Error('Payment could not be verified.');
  };

  const eventVenue = useMemo(() => {
    return [booking?.event?.venue?.name, booking?.event?.venue?.city].filter(Boolean).join(', ');
  }, [booking]);
  const usesStripeElements =
    !!stripePromise &&
    !!intent.clientSecret &&
    !String(intent.gatewayPaymentId || '').startsWith('pi_stub_');

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {[1, 2].map((index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!booking || !intent) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold font-heading">Complete Payment</h1>
          <p className="text-xs text-muted-foreground">Booking ref: {booking.bookingRef || bookingRef}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-semibold">{booking.event?.title}</p>
          {eventVenue && <p className="text-xs text-muted-foreground">{eventVenue}</p>}
          <div className="flex items-end justify-between gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Tickets</p>
              <p className="text-sm font-semibold">{booking.ticketCount || booking.quantity || 1}</p>
            </div>
            <p className="text-2xl font-extrabold font-heading text-primary">
              {formatPrice(booking.totalAmount || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
        Card payments are processed securely by Stripe.
      </div>

      {usesStripeElements ? (
        <Elements stripe={stripePromise}>
          <StripeCardForm booking={booking} intent={intent} onVerified={handleVerified} />
        </Elements>
      ) : (
        <StubPaymentForm
          booking={booking}
          intent={intent}
          onVerified={handleVerified}
          processing={processing}
          setProcessing={setProcessing}
        />
      )}
    </div>
  );
};

export default PaymentPageCanonical;
