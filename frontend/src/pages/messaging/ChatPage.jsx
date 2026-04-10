// pages/messaging/ChatPage.jsx
// Bootstrap page — finds or creates a conversation with a user,
// then immediately redirects to the ConversationPage.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { messagingService } from '@/api';
import { useDispatch } from 'react-redux';
import { upsertConversation } from '@/store/slices/messagingSlice';
import { ROUTES } from '@/app/AppRoutes';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const navigate         = useNavigate();
  const dispatch         = useDispatch();
  const { userId }       = useParams();
  const [searchParams]   = useSearchParams();
  const didRun           = useRef(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (!userId) {
      setError('Recipient not found');
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const conversation = await messagingService.startConversation({
          participantId: userId,
          eventId: searchParams.get('eventId') || undefined,
          ...(searchParams.get('message')
            ? { body: searchParams.get('message') }
            : {}),
        });

        if (!conversation?._id && !conversation?.id) {
          throw new Error('No conversation returned');
        }

        dispatch(upsertConversation(conversation));

        navigate(
          ROUTES.MESSAGES.CONVERSATION(conversation._id || conversation.id),
          { replace: true }
        );
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || '';
        
        if (errorMessage.includes('cannot start a conversation with yourself')) {
          setError("You can't message yourself");
        } else if (errorMessage.includes('Participant not found')) {
          setError('User not found. They may have deactivated their account.');
        } else if (errorMessage.includes('not found')) {
          setError('Conversation not found');
        } else {
          setError('Failed to open chat. Please try again.');
        }
        setLoading(false);
      }
    };

    run();
  }, [dispatch, navigate, searchParams, userId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-base font-semibold mb-2">Unable to open chat</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Go back
          </Button>
          <Button size="sm" onClick={() => navigate(ROUTES.MESSAGES.ROOT)}>
            Go to inbox
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-4" />
        <h2 className="text-base font-semibold">Opening chat…</h2>
        <p className="text-sm text-muted-foreground mt-1">Setting up your conversation</p>
      </div>
    );
  }

  return null;
};

export default ChatPage;
