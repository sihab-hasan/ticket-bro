// components/shared/StatusBadge.jsx
import React from 'react';

const STATUS_STYLES = {
  // Booking / Payment
  confirmed:   'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  pending:     'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  cancelled:   'bg-red-500/10 text-red-500 border-red-500/20',
  failed:      'bg-red-500/10 text-red-500 border-red-500/20',
  refunded:    'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed:   'bg-green-500/10 text-green-600 border-green-500/20',
  processing:  'bg-purple-500/10 text-purple-600 border-purple-500/20',
  // Payment succeeded: treat same as completed
  succeeded:   'bg-green-500/10 text-green-600 border-green-500/20',
  // Event
  published:   'bg-green-500/10 text-green-600 border-green-500/20',
  draft:       'bg-gray-500/10 text-gray-500 border-gray-500/20',
  // Pending review or approval (events awaiting moderation)
  pending_review: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  pending:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
  postponed:   'bg-purple-500/10 text-purple-600 border-purple-500/20',
  rejected:    'bg-red-500/10 text-red-500 border-red-500/20',
  // User
  active:      'bg-green-500/10 text-green-600 border-green-500/20',
  inactive:    'bg-gray-500/10 text-gray-500 border-gray-500/20',
  suspended:   'bg-red-500/10 text-red-500 border-red-500/20',
  banned:      'bg-red-600/10 text-red-600 border-red-600/20',
  // Reports
  open:        'bg-orange-500/10 text-orange-500 border-orange-500/20',
  resolved:    'bg-green-500/10 text-green-600 border-green-500/20',
  dismissed:   'bg-gray-500/10 text-gray-500 border-gray-500/20',
  escalated:   'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export const StatusBadge = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${style} ${className}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// ── Role Badge ────────────────────────────────────────────────────────────────
const ROLE_STYLES = {
  super_admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  admin:       'bg-red-500/10 text-red-600 border-red-500/20',
  moderator:   'bg-orange-500/10 text-orange-600 border-orange-500/20',
  organizer:   'bg-blue-500/10 text-blue-600 border-blue-500/20',
  user:        'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const RoleBadge = ({ role, className = '' }) => {
  const style = ROLE_STYLES[role?.toLowerCase()] || ROLE_STYLES.user;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style} ${className}`}>
      {role?.replace('_', ' ')}
    </span>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({
  icon: Icon,
  title = 'No data found',
  description,
  action,        // { label, onClick, icon: ActionIcon }
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted-foreground/50" />
      </div>
    )}
    <h3 className="text-base font-bold text-foreground font-heading mb-1.5">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-5">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all"
      >
        {action.icon && <action.icon className="h-4 w-4" />}
        {action.label}
      </button>
    )}
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <div className={`${sizes[size]} border-2 border-muted border-t-primary rounded-full animate-spin ${className}`} />
  );
};

// ── Confirm Dialog ────────────────────────────────────────────────────────────
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'destructive', // 'destructive' | 'default'
  loading = false,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="font-heading">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={loading}
          className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90 text-white' : ''}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" /> Processing…
            </span>
          ) : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default StatusBadge;
