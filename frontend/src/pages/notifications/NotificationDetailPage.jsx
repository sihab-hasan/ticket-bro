// pages/notifications/NotificationDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { notificationsService } from '@/api';
import Container from '@/components/layout/Container';

const NotificationDetailPage = () => {
  const { notificationId: notifId } = useParams();
  const navigate = useNavigate();
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationsService.getById(notifId);
        setNotif(data);
        if (!data.isRead) await notificationsService.markRead(notifId).catch(() => {});
      } catch { toast.error('Notification not found'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [navigate, notifId]);

  const ICONS = { booking: '🎟️', payment: '💳', event: '📅', system: '⚙️', promo: '🎁', refund: '💰' };

  if (loading) return <div className="p-4 space-y-4 max-w-lg mx-auto"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-2xl" /></div>;

  return (
    <Container className="py-6">
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-lg font-extrabold font-heading">Notification</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ICONS[notif.type] || '🔔'}</span>
            <div>
              <p className="text-base font-bold font-heading">{notif.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(notif.createdAt)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
          {/*
            Metadata section

            The API normalizes notifications to expose a `metadata` property which contains any additional
            contextual data (for example eventId, bookingRef, etc.).  Historically the frontend would
            fall back to a `data` property on the notification object if `metadata` was missing.  Since
            `normalizeNotification` in `notifications.api.js` always defines `metadata`, we simplify
            the logic here and reference only `notif.metadata`.  This prevents accidental access to
            undefined `notif.data` and makes the rendering logic clearer.
          */}
          {notif.metadata && Object.keys(notif.metadata).length > 0 && (
            <div className="p-3 rounded-xl bg-muted/50 text-xs space-y-1">
              {Object.entries(notif.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-semibold">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {(notif.actionUrl || notif.link) && (
            <Link to={notif.actionUrl || notif.link}>
              <Button className="w-full font-bold"><ExternalLink className="h-4 w-4 mr-2" />{notif.actionLabel || 'View Details'}</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
    </Container>
  );
};

export default NotificationDetailPage;
