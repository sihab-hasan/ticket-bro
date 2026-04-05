// pages/bookings/WaitlistPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Bell, CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { bookingService, eventsService } from '@/api';
import Container from '@/components/layout/Container';

const WaitlistPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [form, setForm] = useState({ quantity: 1, emailNotify: true, smsNotify: false });

  useEffect(() => {
    (async () => {
      try {
        setEvent(await eventsService.getEventBySlug(eventId));
      } catch { toast.error('Event not found'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [eventId, navigate]);

  const handleJoin = async () => {
    setSubmitting(true);
    try {
      await bookingService.joinWaitlist(eventId, form);
      setJoined(true);
    } catch (e) {
      if (e.status === 409) setAlreadyJoined(true);
      else toast.error(e.message || 'Failed to join waitlist');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Container><div className="py-4 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-2xl" /></div></Container>;

  if (joined || alreadyJoined) return (
    <Container><div className="py-12 max-w-md mx-auto text-center space-y-4 font-sans">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-extrabold font-heading">{alreadyJoined ? 'Already on Waitlist' : "You're on the Waitlist!"}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {alreadyJoined ? "You're already on the waitlist for this event. We'll notify you as soon as tickets become available." : "We'll notify you as soon as a ticket becomes available. You'll have 24 hours to complete your purchase once notified."}
      </p>
      <Button onClick={() => navigate(ROUTES.BOOKINGS.ROOT)} className="w-full font-bold">View My Bookings</Button>
    </div></Container>
  );

  return (
    <Container aria-label="Join waitlist"><div className="py-5 max-w-md mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Join Waitlist" subtitle={event?.title} className="mb-0" />
      </div>

      {/* Event card */}
      <Card>
        <CardContent className="p-4 flex gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
            {event?.coverImage && <img src={event.coverImage} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{event?.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event?.startDate, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-orange-500 font-semibold">
              <Users className="h-3 w-3" />
              {event?.waitlistCount || 0} people waiting
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="grid grid-cols-1 gap-3">
        {[
          { icon: Bell, title: 'Instant notification', desc: "Get notified the moment a ticket opens up" },
          { icon: Clock, title: '24-hour window', desc: "You'll have 24 hours to complete purchase" },
          { icon: CheckCircle2, title: 'No commitment', desc: "You can leave the waitlist any time" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Number of tickets needed</Label>
            <Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} min={1} max={10} className="h-9 w-24" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notification preferences</p>
            {[
              { key: 'emailNotify', label: 'Email notification' },
              { key: 'smsNotify', label: 'SMS notification' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <Label className="text-sm">{n.label}</Label>
                <Switch checked={form[n.key]} onCheckedChange={(v) => setForm((f) => ({ ...f, [n.key]: v }))} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleJoin} disabled={submitting} className="w-full font-bold h-11">
        {submitting ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Joining…</> : <><Bell className="h-4 w-4 mr-2" />Join Waitlist</>}
      </Button>
    </div></Container>
  );
};

export default WaitlistPage;
