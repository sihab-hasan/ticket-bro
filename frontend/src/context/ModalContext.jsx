// frontend/src/contexts/ModalContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

// Modal types
export const ModalType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CONFIRM: 'confirm',
  CUSTOM: 'custom'
};

// Predefined modals
export const MODALS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgotPassword',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
  VERIFY_PHONE: 'verifyPhone',
  BOOKING_DETAILS: 'bookingDetails',
  TICKET_DETAILS: 'ticketDetails',
  PAYMENT_METHOD: 'paymentMethod',
  CONFIRM_BOOKING: 'confirmBooking',
  CANCEL_BOOKING: 'cancelBooking',
  REQUEST_REFUND: 'requestRefund',
  WRITE_REVIEW: 'writeReview',
  SHARE_EVENT: 'shareEvent',
  REPORT_ISSUE: 'reportIssue',
  CONTACT_SUPPORT: 'contactSupport',
  NEWSLETTER: 'newsletter',
  COOKIE_CONSENT: 'cookieConsent',
  LOCATION_PERMISSION: 'locationPermission',
  NOTIFICATION_PERMISSION: 'notificationPermission'
};

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({});
  const [history, setHistory] = useState([]);
  const [zIndex, setZIndex] = useState(1000);

  // Open a modal
  const openModal = useCallback((id, props = {}) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        id,
        isOpen: true,
        props,
        zIndex: zIndex,
        openedAt: Date.now()
      }
    }));
    
    setHistory(prev => [...prev, id]);
    setZIndex(prev => prev + 1);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }, [zIndex]);

  // Close a modal
  const closeModal = useCallback((id) => {
    setModals(prev => {
      const newModals = { ...prev };
      if (newModals[id]) {
        newModals[id] = { ...newModals[id], isOpen: false };
      }
      return newModals;
    });
    
    setHistory(prev => prev.filter(modalId => modalId !== id));
    
    // Restore body scroll if no modals open
    if (Object.values(modals).filter(m => m.isOpen).length <= 1) {
      document.body.style.overflow = 'unset';
    }
  }, [modals]);

  // Toggle a modal
  const toggleModal = useCallback((id, props = {}) => {
    if (modals[id]?.isOpen) {
      closeModal(id);
    } else {
      openModal(id, props);
    }
  }, [modals, openModal, closeModal]);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals({});
    setHistory([]);
    document.body.style.overflow = 'unset';
  }, []);

  // Close the most recent modal
  const closeRecentModal = useCallback(() => {
    const recentId = history[history.length - 1];
    if (recentId) {
      closeModal(recentId);
    }
  }, [history, closeModal]);

  // Update modal props
  const updateModalProps = useCallback((id, props) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        props: { ...prev[id]?.props, ...props }
      }
    }));
  }, []);

  // Check if modal is open
  const isModalOpen = useCallback((id) => {
    return modals[id]?.isOpen || false;
  }, [modals]);

  // Get modal props
  const getModalProps = useCallback((id) => {
    return modals[id]?.props || {};
  }, [modals]);

  // Show confirmation modal
  const confirm = useCallback((options = {}) => {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = ModalType.CONFIRM,
      onConfirm,
      onCancel,
      ...rest
    } = options;

    const id = `confirm_${Date.now()}`;
    
    openModal(id, {
      type,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm?.();
        closeModal(id);
      },
      onCancel: () => {
        onCancel?.();
        closeModal(id);
      },
      ...rest
    });

    return id;
  }, [openModal, closeModal]);

  // Show alert modal
  const alert = useCallback((options = {}) => {
    const {
      title = 'Alert',
      message,
      type = ModalType.INFO,
      buttonText = 'OK',
      onClose,
      ...rest
    } = options;

    const id = `alert_${Date.now()}`;
    
    openModal(id, {
      type,
      title,
      message,
      buttonText,
      onClose: () => {
        onClose?.();
        closeModal(id);
      },
      ...rest
    });

    return id;
  }, [openModal, closeModal]);

  // Show toast-like notification
  const toast = useCallback((options = {}) => {
    const {
      message,
      type = ModalType.INFO,
      duration = 3000,
      position = 'top-right',
      ...rest
    } = options;

    const id = `toast_${Date.now()}`;
    
    openModal(id, {
      type,
      message,
      duration,
      position,
      isToast: true,
      ...rest
    });

    // Auto close after duration
    setTimeout(() => {
      closeModal(id);
    }, duration);

    return id;
  }, [openModal, closeModal]);

  // Show drawer (slide-in panel)
  const openDrawer = useCallback((options = {}) => {
    const {
      id = `drawer_${Date.now()}`,
      position = 'right',
      size = 'md',
      ...rest
    } = options;

    openModal(id, {
      ...rest,
      isDrawer: true,
      drawerPosition: position,
      drawerSize: size
    });

    return id;
  }, [openModal]);

  // Show bottom sheet
  const openBottomSheet = useCallback((options = {}) => {
    const {
      id = `sheet_${Date.now()}`,
      ...rest
    } = options;

    openModal(id, {
      ...rest,
      isBottomSheet: true
    });

    return id;
  }, [openModal]);

  const value = {
    // State
    modals,
    history,
    
    // Core methods
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    closeRecentModal,
    updateModalProps,
    
    // Utilities
    isModalOpen,
    getModalProps,
    
    // Predefined modals
    confirm,
    alert,
    toast,
    openDrawer,
    openBottomSheet,
    
    // Constants
    ModalType,
    MODALS,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};