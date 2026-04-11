// frontend/src/components/shared/FloatingMessengerWidget.jsx
//
// Floating messenger button — visible only on large screen (>= 1024px)
// Mirrors the FloatingCartWidget pattern

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUnreadCount } from "@/store/slices/messagingSlice";

const FloatingMessengerWidget = () => {
  const unreadCount = useSelector(selectUnreadCount);
  const location = useLocation();
  const isOnMessagesPage = location.pathname.startsWith("/messages");

  if (isOnMessagesPage) {
    return null;
  }

  return (
    <Link
      to="/messages"
      aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      className="
        hidden xl:flex
        fixed bottom-28 right-10 z-50
        flex-col items-center justify-center
        w-14 h-14
        rounded
        bg-popover text-popover-foreground
        hover:bg-accent hover:text-accent-foreground
        shadow-sm
        cursor-pointer no-underline
        gap-1
      "
    >
      <div className="relative">
        <MessageSquare size={20} strokeWidth={1.9} />
        {unreadCount > 0 && (
          <span className="
            absolute -top-1.5 -right-2
            bg-primary text-primary-foreground
            text-[8px] font-bold font-heading
            leading-none px-1 py-0.5
            rounded-full min-w-[15px] text-center
            border border-popover
          ">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      <span className="text-[7.5px] font-bold font-heading tracking-widest uppercase leading-none opacity-60">
        MESSAGES
      </span>
    </Link>
  );
};

export default FloatingMessengerWidget;