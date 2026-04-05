// pages/tickets/SeatSelectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';
import { cartService, eventsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const SEAT_STATUS = { available: 'bg-muted hover:bg-primary/20 border-border cursor-pointer', selected: 'bg-primary border-primary text-black cursor-pointer', booked: 'bg-muted/30 border-muted cursor-not-allowed opacity-40' };

const SeatSelectionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const seatMap = await eventsService.getSeatMap(eventId);
        setSections(seatMap?.sections || seatMap || []);
      } catch { toast.error('Failed to load seats'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [eventId, navigate]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;
    setSelectedSeats((prev) =>
      prev.find((s) => s._id === seat._id) ? prev.filter((s) => s._id !== seat._id) : [...prev, seat]
    );
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return toast.error('Select at least one seat');
    try {
      for (const seat of selectedSeats) {
        await cartService.addItem({ eventId, seatId: seat._id, quantity: 1 });
      }
      navigate(ROUTES.CART.CHECKOUT);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to reserve seats'));
    }
  };

  const total = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="content-shell" aria-label="Select seats"><div className="py-5 max-w-2xl mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-lg font-extrabold font-heading">Select Your Seats</h1>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {[{ color: 'bg-muted border border-border', label: 'Available' }, { color: 'bg-primary', label: 'Selected' }, { color: 'bg-muted/30 border border-muted', label: 'Booked' }].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5"><div className={`w-4 h-4 rounded ${s.color}`} />{s.label}</div>
        ))}
      </div>
      {/* Stage */}
      <div className="w-full h-10 bg-muted rounded-xl flex items-center justify-center text-xs font-semibold text-muted-foreground border border-border">STAGE</div>
      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : sections.map((section) => (
        <Card key={section._id}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">{section.name} <span className="text-xs font-normal text-muted-foreground ml-2">({formatPrice(section.price || 0)} per seat)</span></CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {(section.seats || []).map((seat) => {
                const isSelected = selectedSeats.find((s) => s._id === seat._id);
                const status = seat.status === 'booked' ? 'booked' : isSelected ? 'selected' : 'available';
                return (
                  <button key={seat._id} onClick={() => toggleSeat({ ...seat, price: section.price, sectionName: section.name })}
                    className={`w-9 h-9 text-[11px] font-bold rounded-lg border transition-all ${SEAT_STATUS[status]}`}
                    title={`${section.name} ${seat.label}`}
                  >
                    {seat.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex items-center justify-between gap-3 z-50">
          <div>
            <p className="text-sm font-bold">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected</p>
            <p className="text-xs text-muted-foreground">{selectedSeats.map((s) => `${s.sectionName} ${s.label}`).join(', ')}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-base font-extrabold font-heading text-primary">{formatPrice(total)}</p>
            <Button onClick={handleContinue} className="font-bold">Continue <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
          </div>
        </div>
      )}
    </div></div>
  );
};

export default SeatSelectionPage;
