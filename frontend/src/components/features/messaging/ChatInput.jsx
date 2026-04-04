// components/features/messaging/ChatInput.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ChatInput = ({
  value,
  onChange,
  onSend,
  onTyping,
  sending = false,
  disabled = false,
  placeholder = 'Type a message…',
}) => {
  const textareaRef = useRef(null);
  const typingTimeout = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleChange = useCallback((e) => {
    onChange(e.target.value);
    // Emit typing start
    if (onTyping) {
      onTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => onTyping(false), 1500);
    }
  }, [onChange, onTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending && value.trim()) onSend();
    }
  }, [onSend, sending, value]);

  const canSend = value.trim().length > 0 && !sending && !disabled;

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border bg-background">
      <div className={cn(
        'flex-1 flex items-end gap-2 rounded-2xl border border-border bg-muted/50 px-3 py-2',
        'focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all'
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground',
            'min-h-[24px] max-h-[140px] leading-6 py-0',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ fontFamily: 'var(--font-sans)' }}
        />
      </div>

      <Button
        onClick={onSend}
        disabled={!canSend}
        size="icon"
        className={cn(
          'h-10 w-10 rounded-xl shrink-0 transition-all duration-150',
          canSend
            ? 'bg-primary text-primary-foreground shadow-sm hover:opacity-90'
            : 'bg-muted text-muted-foreground'
        )}
        aria-label="Send message"
      >
        <Send className={cn('h-4 w-4', sending && 'animate-pulse')} />
      </Button>
    </div>
  );
};

export default ChatInput;
