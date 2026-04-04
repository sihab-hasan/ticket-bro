// pages/tickets/SeatSelectionPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Armchair } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/app/AppRoutes';

const SeatSelectionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-lg font-extrabold font-heading">Reserved Seating</h1>
      </div>
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Armchair className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-bold font-heading">Seat locking is not enabled yet</p>
            <p className="text-sm text-muted-foreground">
              Reserved seating is temporarily unavailable while we finish real-time seat holds.
              You can still continue with general admission tickets for this event.
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.TICKETS.SELECT(eventId))} className="font-bold">
            Choose General Admission <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatSelectionPage;
