// components/features/messaging/ConversationList.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, MessageSquarePlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ConversationItem from './ConversationItem';
import { cn } from '@/lib/utils';

const ConversationListSkeleton = () => (
  <div className="space-y-0.5 p-2">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-3.5">
        <Skeleton className="h-11 w-11 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <MessageSquarePlus className="h-6 w-6 text-muted-foreground" />
    </div>
    {query ? (
      <>
        <p className="text-sm font-semibold">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-xs text-muted-foreground mt-1">Try a different name or event</p>
      </>
    ) : (
      <>
        <p className="text-sm font-semibold">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
          Message an organizer from any event page to get started
        </p>
      </>
    )}
  </div>
);

const ConversationList = ({ conversations = [], loading = false, className }) => {
  const [search, setSearch] = useState('');
  const { conversationId: activeId } = useParams();

  const filtered = search
    ? conversations.filter((c) => {
        const name = c.otherParticipant?.name || c.otherParticipant?.firstName || '';
        const event = c.event?.title || '';
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || event.toLowerCase().includes(q);
      })
    : conversations;

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <h2 className="text-base font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Messages
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="h-8 pl-8 pr-8 text-sm bg-muted border-0 rounded-lg focus-visible:ring-1"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <ConversationListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState query={search} />
        ) : (
          <div className="space-y-0.5">
            {filtered.map((conv) => (
              <ConversationItem
                key={conv._id || conv.id}
                conversation={conv}
                isActive={(conv._id || conv.id) === activeId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
