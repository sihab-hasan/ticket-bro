// pages/messaging/InboxPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { messagingService } from '@/api';

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await messagingService.getConversations();
      setConversations(data.conversations || []);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = conversations.filter((c) => {
    const name = c.otherParticipant?.name || c.subject || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans">
      <PageHeader title="Messages" subtitle="Your conversations"
        actions={[{ label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' }]}
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…" className="h-9 pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16"><MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No messages yet</p></CardContent></Card>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv) => (
            <Link key={conv._id} to={ROUTES.MESSAGES.CONVERSATION ? ROUTES.MESSAGES.CONVERSATION(conv._id) : `#`} className="block no-underline">
              <div className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors hover:bg-muted/60 ${conv.unreadCount > 0 ? 'bg-muted/40' : ''}`}>
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                    {(conv.otherParticipant?.name || conv.subject || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>{conv.otherParticipant?.name || conv.subject || 'Unknown'}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{conv.lastMessage?.createdAt ? formatDate(conv.lastMessage.createdAt, { dateStyle: undefined, timeStyle: 'short' }) : ''}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{conv.lastMessage?.content || 'No messages yet'}</p>
                    {conv.unreadCount > 0 && <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary text-black shrink-0">{conv.unreadCount}</Badge>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxPage;
