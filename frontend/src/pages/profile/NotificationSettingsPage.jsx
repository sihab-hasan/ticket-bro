// pages/profile/NotificationSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from '@/components/shared/common';
import { notificationsService } from '@/api';

const PREFS = [
  { group: 'Bookings', items: [
    { key: 'email.bookingConfirmed', label: 'Booking Confirmed', hint: 'When your booking is confirmed' },
    { key: 'email.bookingCancelled', label: 'Booking Cancelled', hint: 'When a booking is cancelled' },
    { key: 'push.bookingReminder', label: 'Event Reminder', hint: 'Reminder 24h before the event' },
  ]},
  { group: 'Payments', items: [
    { key: 'email.paymentSuccess', label: 'Payment Successful', hint: 'Confirmation of successful payment' },
    { key: 'email.refundProcessed', label: 'Refund Processed', hint: 'When a refund is issued' },
  ]},
  { group: 'Events', items: [
    { key: 'email.eventUpdated', label: 'Event Updates', hint: 'Changes to events you booked' },
    { key: 'push.newEvents', label: 'New Events', hint: 'New events matching your interests' },
  ]},
  { group: 'Marketing', items: [
    { key: 'email.promotions', label: 'Promotions & Deals', hint: 'Special offers and discount codes' },
    { key: 'email.newsletter', label: 'Newsletter', hint: 'Weekly event highlights' },
  ]},
];

const DEFAULT_PREF_VALUES = { soundEnabled: true };

const NotificationSettingsPage = () => {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationsService.getPreferences();
        setPrefs({ ...DEFAULT_PREF_VALUES, ...(data || {}) });
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationsService.updatePreferences(prefs);
      toast.success('Preferences saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="content-shell" aria-label="Notification settings"><div className="py-5 space-y-5 font-sans max-w-lg mx-auto">
      <PageHeader title="Notification Settings" subtitle="Control what you hear from us" />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : PREFS.map((group) => (
        <Card key={group.group}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">{group.group}</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            {group.items.map((item, i) => (
              <div key={item.key}>
                {i > 0 && <Separator className="my-0" />}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.hint}</p>
                  </div>
                  <Switch checked={!!prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">General</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <p className="text-sm font-semibold">Notification sound</p>
              <p className="text-xs text-muted-foreground mt-0.5">Play a short sound for important alerts</p>
            </div>
            <Switch checked={!!prefs.soundEnabled} onCheckedChange={() => toggle('soundEnabled')} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full font-bold">
        {saving ? 'Saving…' : <><Save className="h-4 w-4 mr-2" />Save Preferences</>}
      </Button>
    </div></div>
  );
};

export default NotificationSettingsPage;
