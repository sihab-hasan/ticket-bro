// pages/messaging/ChatPage.jsx
// Bootstrap page — finds or creates a conversation with a user,
// then immediately redirects to the ConversationPage.
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { messagingService } from '@/api';
import { useDispatch } from 'react-redux';
import { upsertConversation } from '@/store/slices/messagingSlice';
import { ROUTES } from '@/app/AppRoutes';
import { PageLoader } from '@/components/shared/Loader';
import { toast } from '@/components/shared/common';
import Container from '@/components/layout/Container';

const ChatPage = () => {
  const navigate         = useNavigate();
  const dispatch         = useDispatch();
  const { userId }       = useParams();
  const [searchParams]   = useSearchParams();
  const didRun           = useRef(false);

  useEffect(() => {
    // Strict-mode guard — only run once
    if (didRun.current) return;
    didRun.current = true;

    if (!userId) {
      toast.error('Recipient not found');
      navigate(ROUTES.MESSAGES.ROOT, { replace: true });
      return;
    }

    const run = async () => {
      try {
        const conversation = await messagingService.startConversation({
          participantId: userId,
          eventId: searchParams.get('eventId') || undefined,
          // Don't send an empty message — only send if provided in URL
          ...(searchParams.get('message')
            ? { body: searchParams.get('message') }
            : {}),
        });

        if (!conversation?._id && !conversation?.id) {
          throw new Error('No conversation returned');
        }

        // Cache conversation in Redux so ConversationPage header loads instantly
        dispatch(upsertConversation(conversation));

        navigate(
          ROUTES.MESSAGES.CONVERSATION(conversation._id || conversation.id),
          { replace: true }
        );
      } catch (err) {
        toast.error(err?.message === 'You cannot start a conversation with yourself.'
          ? "You can't message yourself"
          : 'Failed to open chat');
        navigate(ROUTES.MESSAGES.ROOT, { replace: true });
      }
    };

    run();
  }, []); // eslint-disable-line

  return <PageLoader text="Opening chat…" subtitle="Setting up your conversation" />;
};

export default ChatPage;
