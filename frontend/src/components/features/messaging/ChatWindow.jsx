// components/features/messaging/ChatWindow.jsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { cn } from '@/lib/utils';

const getId = (u) => u?._id || u?.id;

// Group consecutive messages by same sender, insert date separators
const buildGroups = (messages) => {
  const result = [];
  let lastDate = null;
  let lastSenderId = null;

  messages.forEach((msg, i) => {
    const date = new Date(msg.createdAt).toDateString();
    if (date !== lastDate) {
      result.push({ type: 'separator', date, key: `sep-${date}` });
      lastDate = date;
      lastSenderId = null;
    }
    const senderId = getId(msg.sender) || msg.senderId;
    const isFirst = senderId !== lastSenderId;
    result.push({ type: 'message', msg, isFirst, key: getId(msg) || msg._id || i });
    lastSenderId = senderId;
  });

  return result;
};

const DateSeparator = ({ date }) => {
  const label = (() => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  })();

  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={cn('flex gap-2', i % 2 === 0 ? '' : 'flex-row-reverse')}>
        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
        <Skeleton className={cn('h-10 rounded-2xl', i % 3 === 0 ? 'w-48' : i % 3 === 1 ? 'w-64' : 'w-36')} />
      </div>
    ))}
  </div>
);

const EmptyThread = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
      <span className="text-2xl">💬</span>
    </div>
    <p className="text-sm font-semibold text-foreground">Start the conversation</p>
    <p className="text-xs text-muted-foreground mt-1">Say hello and get things started</p>
  </div>
);

const ChatWindow = ({
  messages = [],
  currentUserId,
  loading = false,
  isTyping = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  participantAvatar = null,
  participantName = '',
  className,
}) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const previousMessageCountRef = useRef(messages.length);
  const prependAnchorRef = useRef(null);
  const didInitializeRef = useRef(false);

  const scrollToBottomPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollToBottomPosition();
    setIsAtBottom(true);
  }, [scrollToBottomPosition]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const previousMessageCount = previousMessageCountRef.current;
    const messageCountIncreased = messages.length > previousMessageCount;

    if (prependAnchorRef.current && messageCountIncreased) {
      const { scrollHeight, scrollTop } = prependAnchorRef.current;
      el.scrollTop = el.scrollHeight - scrollHeight + scrollTop;
      prependAnchorRef.current = null;
    } else if (!didInitializeRef.current) {
      scrollToBottomPosition();
      didInitializeRef.current = true;
    } else if (messageCountIncreased && isAtBottom) {
      scrollToBottomPosition();
    }

    previousMessageCountRef.current = messages.length;
  }, [messages, isAtBottom, scrollToBottomPosition]);

  useEffect(() => {
    if (isTyping && isAtBottom) {
      scrollToBottomPosition();
    }
  }, [isTyping, isAtBottom, scrollToBottomPosition]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const newIsAtBottom = distFromBottom < 80;
    setIsAtBottom(newIsAtBottom);
  }, []);

  const handleLoadMoreClick = useCallback(() => {
    if (!hasMore || loadingMore || !onLoadMore) return;

    const el = containerRef.current;
    if (el) {
      prependAnchorRef.current = {
        scrollHeight: el.scrollHeight,
        scrollTop: el.scrollTop,
      };
    }

    onLoadMore();
  }, [hasMore, loadingMore, onLoadMore]);

  const items = buildGroups(messages);
  const showScrollButton = !isAtBottom && messages.length > 0;
  const lastOwnMessageId = [...messages]
    .reverse()
    .find((message) => (getId(message.sender) || message.senderId) === currentUserId)?._id
    || [...messages]
      .reverse()
      .find((message) => (getId(message.sender) || message.senderId) === currentUserId)?.id
    || null;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('flex-1 overflow-y-auto overscroll-contain relative', className)}
    >
      {loading ? (
        <LoadingSkeleton />
      ) : messages.length === 0 ? (
        <EmptyThread />
      ) : (
        <div className="flex flex-col gap-1 p-4 pb-2">
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMoreClick}
                disabled={loadingMore}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more messages'
                )}
              </Button>
            </div>
          )}
          
          {items.map((item) => {
            if (item.type === 'separator') {
              return <DateSeparator key={item.key} date={item.date} />;
            }
            const { msg, isFirst } = item;
            const senderId = getId(msg.sender) || msg.senderId;
            const isOwn = senderId === currentUserId;
            return (
              <ChatMessage
                key={item.key}
                message={msg}
                isOwn={isOwn}
                showAvatar={isFirst && !isOwn}
                showStatus={isOwn && (getId(msg) === lastOwnMessageId)}
                readReceiptAvatar={participantAvatar}
                readReceiptName={participantName}
              />
            );
          })}
        </div>
      )}

      {isTyping && <TypingIndicator label={`${participantName || 'Someone'} is typing`} />}
      <div ref={bottomRef} className="h-1" />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            onClick={scrollToBottom}
            size="sm"
            variant="secondary"
            className="h-8 px-3 rounded-full shadow-md gap-1.5 animate-in fade-in slide-in-from-bottom-2"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            <span className="text-xs">Jump to latest</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
