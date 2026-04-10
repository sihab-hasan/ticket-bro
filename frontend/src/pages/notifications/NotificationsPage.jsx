// pages/notifications/NotificationsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck, Trash2, RefreshCw, Search, X, Archive, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { notificationsService } from '@/api';
import { ROUTES } from '@/app/AppRoutes';
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
  checkin: '✅',
};

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'booking', label: 'Bookings' },
  { value: 'payment', label: 'Payments' },
  { value: 'event', label: 'Events' },
  { value: 'system', label: 'System' },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deletingIds, setDeletingIds] = useState(new Set());

  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'unread', label: 'Unread first' },
  ];

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') {
        params.type = tab;
      }
      const data = await notificationsService.getAll(params);
      setNotifications(data.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to update');
    }
  };

  const markRead = async (id) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((items) => items.map((item) => 
        (item.id === id || item._id === id ? { ...item, isRead: true } : item)
      ));
    } catch {
      // Silent fail
    }
  };

  const markUnread = async (id) => {
    try {
      await notificationsService.markUnread?.(id).catch(() => {});
      setNotifications((items) => items.map((item) => 
        (item.id === id || item._id === id ? { ...item, isRead: false } : item)
      ));
    } catch {
      // Silent fail
    }
  };

  const deleteNotif = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await notificationsService.deleteOne(id);
      setNotifications((items) => items.filter((item) => item.id !== id && item._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await notificationsService.clearAll();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear');
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = searchQuery
      ? notifications.filter(
          (n) =>
            n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : notifications;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'unread':
          if (a.isRead === b.isRead) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.isRead ? 1 : -1;
        default:
          return 0;
      }
    });
  }, [notifications, searchQuery, sortBy]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Container aria-label="Notifications" className="py-5 space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <PageHeader 
          title="Notifications" 
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} 
          className="mb-0" 
        />
        <div className="flex gap-2 flex-wrap items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? 'bg-muted' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-9" onClick={fetchNotifications} aria-label="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="h-9 font-semibold" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Read all
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="h-9 font-semibold text-destructive hover:text-destructive" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <BellOff className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No notifications match your search' : 'No notifications'}
                </p>
                {searchQuery && (
                  <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notif) => {
                const notificationId = notif.id || notif._id;
                const isDeleting = deletingIds.has(notificationId);
                return (
                  <div
                    key={notificationId}
                    className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors hover:bg-muted/60 group ${
                      !notif.isRead ? 'bg-muted/40' : ''
                    } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => {
                      markRead(notificationId);
                      navigate(ROUTES.NOTIFICATIONS.DETAIL(notificationId));
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                      {ICONS[notif.type] || '🔔'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {formatDate(notif.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markUnread(notificationId);
                          }}
                          title="Mark as unread"
                        >
                          <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteNotif(notificationId);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default NotificationsPage;