// components/features/messaging/ChatMessage.jsx
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const ReadReceipt = ({ pending, isRead }) => {
  if (pending) return <Clock className="h-3 w-3 opacity-50" />;
  if (isRead) return <CheckCheck className="h-3 w-3 text-blue-400" />;
  return <Check className="h-3 w-3 opacity-60" />;
};

const Attachment = ({ attachment }) => (
  <a
    href={attachment.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors text-xs font-medium truncate max-w-[220px]"
  >
    <span className="truncate">{attachment.name || 'Attachment'}</span>
  </a>
);

const ChatMessage = ({ message, isOwn, showAvatar = false }) => {
  const time = formatDate(message.createdAt, { dateStyle: undefined, timeStyle: 'short' });
  const senderName = message.sender?.name || message.sender?.firstName || '';
  const senderInitial = (senderName[0] || '?').toUpperCase();
  const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;
  const body = message.body || message.content || '';

  return (
    <div className={cn('flex items-end gap-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar — other person only */}
      {!isOwn && (
        <div className="shrink-0 w-7">
          {showAvatar ? (
            <Avatar className="h-7 w-7">
              <AvatarImage src={message.sender?.avatar} alt={senderName} />
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                {senderInitial}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="w-7" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={cn(
        'flex flex-col max-w-[72%] sm:max-w-[65%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* Body */}
        {body && (
          <div className={cn(
            'px-3.5 py-2.5 text-sm leading-relaxed break-words',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
              : 'bg-muted text-foreground rounded-2xl rounded-bl-sm',
            message.pending && 'opacity-60'
          )}>
            {body}
          </div>
        )}

        {/* Attachments */}
        {hasAttachments && message.attachments.map((att, i) => (
          <Attachment key={i} attachment={att} />
        ))}

        {/* Meta row */}
        <div className={cn(
          'flex items-center gap-1 mt-1 px-1',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-[10px] text-muted-foreground tabular-nums">{time}</span>
          {isOwn && (
            <ReadReceipt pending={message.pending} isRead={message.isRead} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
