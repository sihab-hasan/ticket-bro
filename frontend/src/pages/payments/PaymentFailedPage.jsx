// pages/payments/PaymentFailedPage.jsx
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/app/AppRoutes';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Your payment could not be processed.';
  const bookingRef = searchParams.get('bookingRef') || searchParams.get('bookingId');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans space-y-5">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold font-heading">Payment Failed</h1>
        <p className="text-sm text-muted-foreground mt-1">{reason}</p>
      </div>
      <Card className="w-full max-w-sm border-red-500/20 bg-red-500/5">
        <CardContent className="p-4 text-left space-y-2 text-sm">
          <p className="font-semibold text-red-500">Common reasons:</p>
          {['Insufficient funds', 'Card expired or blocked', 'Incorrect card details', 'Bank declined the transaction'].map((r) => (
            <div key={r} className="flex items-center gap-2 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{r}</div>
          ))}
        </CardContent>
      </Card>
      <div className="flex flex-col w-full max-w-xs gap-2">
        {bookingRef && (
          <Button onClick={() => navigate('/payments/' + bookingRef)} className="w-full font-bold">
            <RefreshCw className="h-4 w-4 mr-2" />Try Again
          </Button>
        )}
        <Link to={ROUTES.BOOKINGS.ROOT}><Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Back to Bookings</Button></Link>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
