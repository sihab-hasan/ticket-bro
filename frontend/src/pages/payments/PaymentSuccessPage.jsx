// pages/payments/PaymentSuccessPage.jsx
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/app/AppRoutes';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans space-y-5">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold font-heading">Payment Successful!</h1>
        <p className="text-sm text-muted-foreground mt-1">Your booking has been confirmed. Check your email for details.</p>
      </div>
      {ref && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Ticket className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold font-mono text-primary">{ref}</span>
        </div>
      )}
      <div className="flex flex-col w-full max-w-xs gap-2">
        <Link to={ROUTES.BOOKINGS.ROOT}><Button className="w-full font-bold">View My Bookings <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
        <Link to={ROUTES.BROWSE.ROOT}><Button variant="ghost" className="w-full text-muted-foreground">Browse More Events</Button></Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
