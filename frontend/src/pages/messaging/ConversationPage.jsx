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
import Container from '@/components/layout/Container';
  appendMessage,
  replaceOptimisticMessage,
  removeMessage,
  setMessagesLoading,
  removeConversation,
  selectConversations,
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
    messages, messagesLoading, isTyping,
    loadMessages, markAsRead,
    joinConversation, leaveConversation, sendTyping, sendMessage,
  } = useMessaging(conversationId);

  // Try to get conversation header from Redux cache (set by InboxPage loadConversations)
  const conversations = useSelector(selectConversations);
  const cached        = conversations.find((c) => (c._id || c.id) === conversationId);

  const [convData,      setConvData]      = useState(cached || null);
  const [headerLoading, setHeaderLoading] = useState(!cached);
  const [draft,         setDraft]         = useState('');
  const [sending,       setSending]       = useState(false);
  const recipientRef = useRef(null);

  // Sync convData from Redux cache when it becomes available
  useEffect(() => {
    if (cached && !convData) setConvData(cached);
  }, [cached]);  // eslint-disable-line

  // Main init — runs once per conversationId
  useEffect(() => {
    if (!conversationId) return;

    joinConversation(conversationId);

    let cancelled = false;

    const init = async () => {
      try {
        // Fetch header if not cached
        if (!cached) {
          const conv = await messagingService.getConversation(conversationId);
          if (!cancelled) setConvData(conv);
        }
        if (!cancelled) setHeaderLoading(false);

        // Load messages
        dispatch(setMessagesLoading(true));
        await loadMessages(conversationId, { page: 1, limit: 60 });
        // Mark read after messages arrive
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
    };
  }, [conversationId]); // eslint-disable-line

  // Keep recipient ref fresh for typing events
  useEffect(() => {
    const other = convData?.otherParticipant;
    recipientRef.current = other?._id || other?.id || null;
  }, [convData]);

  // Derived display values
  const other     = convData?.otherParticipant;
  const otherName = other
    ? (other.name || [other.firstName, other.lastName].filter(Boolean).join(' ') || 'Unknown')
    : '';
  const otherInitial = (otherName[0] || '?').toUpperCase();

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;

    const tempId     = nextTempId();
    const optimistic = {
      _id: tempId, id: tempId, conversationId,
      senderId: currentUserId,
      sender: { _id: currentUserId, id: currentUserId },
      body, content: body,
      isRead: false, pending: true,
      createdAt: new Date().toISOString(),
    };

    setDraft('');
    setSending(true);
    dispatch(appendMessage({ conversationId, message: optimistic }));

    try {
      const sent = await sendMessage(conversationId, { body });
      dispatch(replaceOptimisticMessage({ conversationId, tempId, message: sent }));
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
    <Container className="py-6">
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0 min-h-[56px]">
        {/* Back — mobile only */}
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
              {convData?.event?.title && (
                <p className="text-[11px] text-primary/70 truncate font-medium leading-tight mt-0.5">
                  re: {convData.event.title}
                </p>
              )}
            </div>
          </div>
        )}

        {/* More actions */}
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

      {/* ── Message thread ───────────────────────────────────────── */}
      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        loading={messagesLoading && messages.length === 0}
        isTyping={isTyping}
        className="flex-1 min-h-0"
      />

      {/* ── Input ────────────────────────────────────────────────── */}
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
    </Container>
  );
};

export default ConversationPage;
