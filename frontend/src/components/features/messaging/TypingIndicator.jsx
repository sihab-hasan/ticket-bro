import React from 'react';
import { cn } from '@/lib/utils';

const TypingIndicator = ({ className, label = 'Typing' }) => (
  <div
    className={cn('flex items-end gap-2 px-4 pb-2', className)}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
    <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: `${index * 0.15}s`, animationDuration: '1s' }}
        />
      ))}
    </div>
    <span className="sr-only">{label}</span>
  </div>
);

export default TypingIndicator;
