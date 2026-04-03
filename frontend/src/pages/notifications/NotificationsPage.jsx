// pages/notifications/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Check, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { notificationsService } from '@/api';

const ICONS = {
  booking: '🎟️', payment: '💳', event: '📅', system: '⚙️', promo: '🎁', refund: '💰', checkin: '✅',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsService.getAll({
        type: tab === 'all' ? undefined : tab,
      });
      setNotifications(data.notifications || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetch(); }, [fetch]);

  const markAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((n) => n.map((item) => ({ ...item, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed to update'); }
  };

  const markRead = async (id) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((n) => n.map((item) => item._id === id ? { ...item, isRead: true } : item));
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await notificationsService.deleteOne(id);
      setNotifications((n) => n.filter((item) => item._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans">
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} className="mb-0" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={fetch}><RefreshCw className="h-3.5 w-3.5" /></Button>
          {unreadCount > 0 && <Button variant="outline" size="sm" className="h-9 font-semibold" onClick={markAllRead}><CheckCheck className="h-3.5 w-3.5 mr-1.5" />Read all</Button>}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : notifications.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-16"><BellOff className="h-10 w-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No notifications</p></CardContent></Card>
          ) : (
            <div className="space-y-1">
              {notifications.map((notif) => (
                <div key={notif._id} onClick={() => markRead(notif._id)} className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors hover:bg-muted/60 group ${!notif.isRead ? 'bg-muted/40' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                    {ICONS[notif.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{formatDate(notif.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
