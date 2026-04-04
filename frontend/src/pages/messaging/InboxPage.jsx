// pages/messaging/InboxPage.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useDispatch } from 'react-redux';
import ConversationList from '@/components/features/messaging/ConversationList';
import useMessaging from '@/hooks/useMessaging';
import { setLoading } from '@/store/slices/messagingSlice';
import { cn } from '@/lib/utils';

const EmptyPane = () => (
  <div className="flex flex-col items-center justify-center flex-1 text-center px-8 bg-muted/10">
    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <MessageSquare className="h-7 w-7 text-muted-foreground" />
    </div>
    <p className="text-sm font-semibold text-foreground">Select a conversation</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
      Choose a conversation from the left to start messaging
    </p>
  </div>
);

const InboxPage = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { conversations, loading, loadConversations } = useMessaging();

  const hasConversation = pathname.startsWith('/messages/conversation/');

  useEffect(() => {
    dispatch(setLoading(true));
    loadConversations({ page: 1, limit: 30 })
      .catch(() => {})
      .finally(() => dispatch(setLoading(false)));
  }, []);

  return (
    // h-full fills MessagingLayout's flex-1 min-h-0 main
    <div className="flex h-full overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <aside className={cn(
        'flex flex-col shrink-0 border-r border-border bg-background overflow-hidden',
        hasConversation
          ? 'hidden md:flex md:w-[300px] lg:w-[340px]'
          : 'flex w-full md:w-[300px] lg:w-[340px]'
      )}>
        <ConversationList conversations={conversations} loading={loading} />
      </aside>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className={cn(
        'flex flex-col flex-1 min-w-0 overflow-hidden',
        !hasConversation && 'hidden md:flex'
      )}>
        {hasConversation ? <Outlet /> : <EmptyPane />}
      </div>

    </div>
  );
};

export default InboxPage;
