import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { messagingService } from "@/api";
import { ROUTES } from "@/app/AppRoutes";
import { PageLoader } from "@/components/shared/Loader";
import { toast } from "@/components/shared/common";

const ChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let active = true;

    const bootstrapConversation = async () => {
      if (!userId) {
        toast.error("Recipient not found");
        navigate(ROUTES.MESSAGES.ROOT, { replace: true });
        return;
      }

      try {
        const conversation = await messagingService.startConversation({
          participantId: userId,
          eventId: searchParams.get("eventId") || undefined,
          message: searchParams.get("message") || "",
        });

        if (!active) {
          return;
        }

        navigate(ROUTES.MESSAGES.CONVERSATION(conversation._id || conversation.id), {
          replace: true,
        });
      } catch {
        if (!active) {
          return;
        }

        toast.error("Failed to open chat");
        navigate(ROUTES.MESSAGES.ROOT, { replace: true });
      }
    };

    bootstrapConversation();

    return () => {
      active = false;
    };
  }, [navigate, searchParams, userId]);

  return (
    <PageLoader
      text="Opening chat"
      subtitle="Preparing your conversation"
    />
  );
};

export default ChatPage;
