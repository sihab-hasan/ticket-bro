// pages/messaging/ConversationPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button }     from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton }   from '@/components/ui/skeleton';
import ChatWindow     from '@/components/features/messaging/ChatWindow';
import ChatInput      from '@/components/features/messaging/ChatInput';
import { toast }      from '@/components/shared/common';
import { ROUTES }     from '@/app/AppRoutes';
import useMessaging   from '@/hooks/useMessaging';
import useAuth        from '@/context/AuthContext';
import { messagingService } from '@/api';
import {
  appendMessage,
  replaceOptimisticMessage,
  removeMessage,
  setMessagesLoading,
  removeConversation,
  updateConversationLastMessage,
  selectConversations,
  selectMessagesLoading,
} from '@/store/slices/messagingSlice';

let _tempId = 0;
const nextTempId = () => `opt-${++_tempId}-${Date.now()}`;

const HeaderSkeleton = () => (
  <div className="flex items-center gap-2.5 flex-1">
    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
    <div className="space-y-1.5 flex-1">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-2.5 w-24" />
    </div>
  </div>
);

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate           = useNavigate();
  const dispatch           = useDispatch();
  const { user }           = useAuth();
  const currentUserId      = user?._id || user?.id;

  const {
    messages, isTyping,
    loadMessages, markAsRead,
    joinConversation, leaveConversation, sendTyping, sendMessage,
  } = useMessaging(conversationId);

  const messagesLoading = useSelector(selectMessagesLoading);
  const conversations = useSelector(selectConversations);
  const cached = conversations.find((c) => (c._id || c.id) === conversationId);

  const [convData, setConvData] = useState(cached || null);
  const [headerLoading, setHeaderLoading] = useState(!cached);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recipientRef = useRef(null);
  const initializedRef = useRef(false);
  const cachedRef = useRef(cached);

  useEffect(() => {
    cachedRef.current = cached;
    if (cached) {
      setConvData((current) => (current ? { ...current, ...cached } : cached));
    }
  }, [cached]);

  useEffect(() => {
    if (!conversationId || initializedRef.current) return;
    initializedRef.current = true;
    setConvData(cachedRef.current || null);
    setHeaderLoading(!cachedRef.current);

    joinConversation(conversationId);

    let cancelled = false;

    const init = async () => {
      try {
        if (!cachedRef.current) {
          const conv = await messagingService.getConversation(conversationId);
          if (!cancelled) setConvData(conv);
        }
        if (!cancelled) setHeaderLoading(false);

        dispatch(setMessagesLoading(true));
        const firstPage = await loadMessages(conversationId, { page: 1, limit: 60 });
        if (!cancelled) {
          const page = Number(firstPage?.pagination?.page || 1);
          const totalPages = Number(firstPage?.pagination?.totalPages || 1);
          setCurrentPage(page);
          setHasMoreMessages(page < totalPages);
        }
        
        await markAsRead(conversationId);
      } catch {
        if (!cancelled) {
          toast.error('Failed to load conversation');
          navigate(ROUTES.MESSAGES.ROOT, { replace: true });
        }
      } finally {
        if (!cancelled) {
          dispatch(setMessagesLoading(false));
          setHeaderLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      leaveConversation(conversationId);
      initializedRef.current = false;
    };
  }, [
    conversationId,
    dispatch,
    joinConversation,
    leaveConversation,
    loadMessages,
    markAsRead,
    navigate,
  ]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMoreMessages || !conversationId) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await loadMessages(conversationId, { page: nextPage, limit: 60 });
      const page = Number(result?.pagination?.page || nextPage);
      const totalPages = Number(result?.pagination?.totalPages || page);

      setCurrentPage(page);
      setHasMoreMessages(page < totalPages);
    } catch {
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreMessages, conversationId, currentPage, loadMessages]);

  useEffect(() => {
    const other = convData?.otherParticipant;
    recipientRef.current = other?._id || other?.id || null;
  }, [convData]);

  const other = convData?.otherParticipant;
  const otherName = other
    ? (other.name || [other.firstName, other.lastName].filter(Boolean).join(' ') || 'Unknown')
    : '';
  const otherInitial = (otherName[0] || '?').toUpperCase();

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;

    const tempId = nextTempId();
    const optimistic = {
      _id: tempId, id: tempId, conversationId,
      senderId: currentUserId,
      sender: { _id: currentUserId, id: currentUserId },
      body, content: body,
      isRead: false, pending: true, status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setDraft('');
    setSending(true);
    dispatch(appendMessage({ conversationId, message: optimistic }));
    dispatch(updateConversationLastMessage({ conversationId, message: optimistic }));

    try {
      const sent = await sendMessage(conversationId, { body });
      dispatch(replaceOptimisticMessage({ conversationId, tempId, message: { ...sent, status: 'sent' } }));
      dispatch(updateConversationLastMessage({ conversationId, message: sent }));
    } catch {
      toast.error('Failed to send');
      dispatch(removeMessage({ conversationId, messageId: tempId }));
      setDraft(body);
    } finally {
      setSending(false);
    }
  }, [draft, sending, conversationId, currentUserId, dispatch, sendMessage]);

  const handleTyping = useCallback((active) => {
    if (recipientRef.current) sendTyping(conversationId, recipientRef.current, active);
  }, [conversationId, sendTyping]);

  const handleDelete = useCallback(async () => {
    try {
      await messagingService.deleteConversation(conversationId);
      dispatch(removeConversation(conversationId));
      navigate(ROUTES.MESSAGES.ROOT, { replace: true });
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }, [conversationId, dispatch, navigate]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0 min-h-[56px]">
        <Button variant="ghost" size="icon"
          className="md:hidden h-8 w-8 shrink-0 -ml-1"
          onClick={() => navigate(ROUTES.MESSAGES.ROOT)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {headerLoading ? <HeaderSkeleton /> : (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={other?.avatar} alt={otherName} />
              <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                {otherInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}>
                {otherName || <span className="text-muted-foreground">Unknown</span>}
              </p>
              {isTyping ? (
                <p className="text-[11px] text-primary/70 font-medium leading-tight mt-0.5 animate-pulse">
                  typing...
                </p>
              ) : convData?.event?.title && (
                <p className="text-[11px] text-primary/70 truncate font-medium leading-tight mt-0.5">
                  re: {convData.event.title}
                </p>
              )}
            </div>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive gap-2 cursor-pointer"
              onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        loading={messagesLoading && messages.length === 0}
        isTyping={isTyping}
        hasMore={hasMoreMessages}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        participantAvatar={other?.avatar}
        participantName={otherName}
        className="flex-1 min-h-0"
      />

      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={handleTyping}
        sending={sending}
        disabled={false}
        placeholder={otherName ? `Message ${otherName}…` : 'Type a message…'}
      />
    </div>
  );
};

export default ConversationPage;
