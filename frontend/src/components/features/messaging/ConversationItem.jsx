// components/features/messaging/ConversationItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';
import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/utils';

const ConversationItem = ({ conversation, isActive = false }) => {
  const other = conversation?.otherParticipant;
  const name = other?.name || other?.firstName || 'Unknown';
  const initial = (name[0] || '?').toUpperCase();
  const unread = Number(conversation?.unreadCount || 0);
  const lastMsg = conversation?.lastMessage?.body || conversation?.lastMessage?.content || '';
  const time = conversation?.lastMessageAt;
  const convId = conversation?._id || conversation?.id;

  return (
    <Link
      to={ROUTES.MESSAGES.CONVERSATION(convId)}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-150 no-underline group',
        isActive
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/60',
        unread > 0 && !isActive && 'bg-muted/30'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage src={other?.avatar} alt={name} />
          <AvatarFallback className={cn(
            'text-sm font-bold',
            isActive ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
          )}>
            {initial}
          </AvatarFallback>
        </Avatar>
        {/* Online dot — placeholder, can wire presence later */}
        {isActive && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn(
            'text-sm truncate',
            unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground',
            isActive && 'text-primary'
          )}>
            {name}
          </p>
          {time && (
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              {formatDate(time, { dateStyle: undefined, timeStyle: 'short' })}
            </span>
          )}
        </div>

        {conversation?.event?.title && (
          <p className="text-[10px] text-primary/70 font-medium truncate -mt-0.5 mb-0.5">
            re: {conversation.event.title}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            'text-xs truncate',
            unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {lastMsg || <span className="italic">No messages yet</span>}
          </p>
          {unread > 0 && (
            <Badge className="h-4.5 min-w-4.5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground shrink-0 rounded-full">
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ConversationItem;
