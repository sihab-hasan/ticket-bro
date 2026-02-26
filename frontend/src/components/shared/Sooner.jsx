import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

// Toast Context
const ToastContext = createContext(null);

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
  DEFAULT: "default",
};

// Toast Component
const Toast = ({
  id,
  title,
  description,
  type = TOAST_TYPES.DEFAULT,
  duration = 5000,
  onClose,
  icon: customIcon,
  action,
  cancel,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Infinity || type === TOAST_TYPES.LOADING) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, id, onClose, type]);

  if (!isVisible) return null;

  const getIcon = () => {
    if (customIcon) return customIcon;

    const iconProps = { className: "size-5" };

    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <CircleCheckIcon {...iconProps} className="size-5 text-green-500" />
        );
      case TOAST_TYPES.ERROR:
        return <OctagonXIcon {...iconProps} className="size-5 text-red-500" />;
      case TOAST_TYPES.WARNING:
        return (
          <TriangleAlertIcon
            {...iconProps}
            className="size-5 text-yellow-500"
          />
        );
      case TOAST_TYPES.INFO:
        return <InfoIcon {...iconProps} className="size-5 text-blue-500" />;
      case TOAST_TYPES.LOADING:
        return (
          <Loader2Icon
            {...iconProps}
            className="size-5 text-primary animate-spin"
          />
        );
      default:
        return null;
    }
  };

  const getTypeStyles = () => {
    const baseStyles = "border rounded-lg shadow-lg overflow-hidden";

    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return `${baseStyles} border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900`;
      case TOAST_TYPES.ERROR:
        return `${baseStyles} border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900`;
      case TOAST_TYPES.WARNING:
        return `${baseStyles} border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900`;
      case TOAST_TYPES.INFO:
        return `${baseStyles} border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900`;
      default:
        return `${baseStyles} border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800`;
    }
  };

  return (
    <div
      className={`
        relative w-full max-w-sm
        ${getTypeStyles()}
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-top-2 fade-in
      `}
      role="alert"
      data-testid={`toast-${id}`}
    >
      {/* Progress Bar */}
      {duration !== Infinity && type !== TOAST_TYPES.LOADING && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary/30 transition-all"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="flex-shrink-0">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </p>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}

          {/* Actions */}
          {(action || cancel) && (
            <div className="flex gap-2 mt-2">
              {action && (
                <button
                  onClick={action.onClick}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {action.label}
                </button>
              )}
              {cancel && (
                <button
                  onClick={cancel.onClick}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  {cancel.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.(id);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[320px] max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          duration={toast.duration}
          icon={toast.icon}
          action={toast.action}
          cancel={toast.cancel}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = (options) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      ...options,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const remove = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const update = (id, options) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...options } : toast)),
    );
  };

  const dismiss = (id) => {
    remove(id);
  };

  const dismissAll = () => {
    setToasts([]);
  };

  // Toast Methods
  const success = (title, options = {}) => {
    return show({ type: TOAST_TYPES.SUCCESS, title, ...options });
  };

  const error = (title, options = {}) => {
    return show({ type: TOAST_TYPES.ERROR, title, ...options });
  };

  const warning = (title, options = {}) => {
    return show({ type: TOAST_TYPES.WARNING, title, ...options });
  };

  const info = (title, options = {}) => {
    return show({ type: TOAST_TYPES.INFO, title, ...options });
  };

  const loading = (title, options = {}) => {
    return show({
      type: TOAST_TYPES.LOADING,
      title,
      duration: Infinity,
      ...options,
    });
  };

  const promise = (promiseFn, options = {}) => {
    const id = loading(options.loading || "Loading...");

    Promise.resolve(promiseFn)
      .then((data) => {
        update(id, {
          type: TOAST_TYPES.SUCCESS,
          title: options.success || "Success!",
          description: options.successDescription,
          duration: 5000,
        });
        options.onSuccess?.(data);
      })
      .catch((error) => {
        update(id, {
          type: TOAST_TYPES.ERROR,
          title: options.error || "Error!",
          description: options.errorDescription || error.message,
          duration: 5000,
        });
        options.onError?.(error);
      });

    return id;
  };

  const custom = (options) => {
    return show(options);
  };

  const value = {
    toasts,
    show,
    remove,
    update,
    dismiss,
    dismissAll,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    custom,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={remove} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Standalone toast object (for components without hook access)
const toast = {
  success: (title, options) => {
    console.warn(
      "toast.success should be used within a component with useToast()",
    );
  },
  error: (title, options) => {},
  warning: (title, options) => {},
  info: (title, options) => {},
  loading: (title, options) => {},
  promise: (promiseFn, options) => {},
  dismiss: (id) => {},
  dismissAll: () => {},
};

// Initialize toast with context (call this in App.jsx)
export const initializeToast = (toastInstance) => {
  Object.assign(toast, {
    success: toastInstance.success,
    error: toastInstance.error,
    warning: toastInstance.warning,
    info: toastInstance.info,
    loading: toastInstance.loading,
    promise: toastInstance.promise,
    dismiss: toastInstance.dismiss,
    dismissAll: toastInstance.dismissAll,
  });
};

export { toast };
