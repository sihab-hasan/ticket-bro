// pages/notifications/NotificationDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Trash2, Archive, Bell, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { notificationsService } from '@/api';
import Container from '@/components/layout/Container';

const ICONS = {
  booking_confirmed: '🎟️',
  booking_cancelled: '❌',
  booking_refunded: '💰',
  event_reminder: '⏰',
  event_updated: '📅',
  event_cancelled: '🚫',
  payment_success: '✅',
  payment_failed: '❌',
  waitlist_update: '📋',
  ticket_available: '🎉',
  system_notification: '⚙️',
  promotional: '🎁',
  booking: '🎟️',
  payment: '💳',
  event: '📅',
  system: '⚙️',
  promo: '🎁',
  refund: '💰',
};

const NotificationDetailPage = () => {
  const { notificationId: notifId } = useParams();
  const navigate = useNavigate();
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationsService.getById(notifId);
        setNotif(data);
        if (!data.isRead) {
          await notificationsService.markRead(notifId).catch(() => {});
        }
      } catch (err) { 
        toast.error('Notification not found'); 
        navigate(-1); 
      }
      finally { setLoading(false); }
    })();
  }, [navigate, notifId]);

  const handleDelete = async () => {
    if (!confirm('Delete this notification?')) return;
    setDeleting(true);
    try {
      await notificationsService.deleteOne(notifId);
      toast.success('Notification deleted');
      navigate('/notifications');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const getActionLink = () => {
    return notif?.link || notif?.actionUrl || null;
  };

  if (loading) return (
    <Container>
      <div className="py-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </Container>
  );

  if (!notif) return null;

  const actionLink = getActionLink();

  return (
    <Container aria-label="Notification detail">
      <div className="py-5 max-w-lg mx-auto space-y-5 font-sans">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-extrabold font-heading">Notification</h1>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className={`h-1 ${notif.isRead ? 'bg-muted' : 'bg-primary'}`} />
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
                {ICONS[notif.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold font-heading leading-tight">{notif.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Bell className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {formatDate(notif.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {notif.readAt && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <p className="text-xs text-muted-foreground">
                        Read {formatDate(notif.readAt, { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Message</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{notif.message}</p>
              </div>
            </div>

            {notif.metadata && Object.keys(notif.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Details</p>
                  <div className="p-3 rounded-xl bg-muted/50 text-xs space-y-2">
                    {Object.entries(notif.metadata).map(([k, v]) => {
                      if (k === 'link' || k === 'actionUrl') return null;
                      return (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-muted-foreground capitalize">
                            {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className="font-semibold">{String(v)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {actionLink && (
              <div className="pt-2">
                <Link to={actionLink}>
                  <Button className="w-full font-bold">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {notif.actionLabel || 'View Details'}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/notifications')}>
            Back to Notifications
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default NotificationDetailPage;