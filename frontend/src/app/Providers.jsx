// frontend/src/contexts/Providers.jsx
import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { CartProvider } from '@/context/CartContext';
import { LocationProvider } from '@/context/LocationContext';
import { ModalProvider } from '@/context/ModalContext';
import { SearchProvider } from '@/context/SearchContext';
import { NotificationProvider } from '@/context/NotificationContext';

// Order matters! Providers that depend on others should be nested inside
export const Providers = ({ children }) => {
  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <ModalProvider>
              <NotificationProvider>
                <SearchProvider>
                  <BookingProvider>
                    <CartProvider>
                      {children}
                    </CartProvider>
                  </BookingProvider>
                </SearchProvider>
              </NotificationProvider>
            </ModalProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
};

// Add default export
export default Providers;

// Export all hooks from a single file for convenience
export { useTheme } from '@/context/ThemeContext';
export { useAuth } from '@/context/AuthContext';
export { useBooking } from '@/context/BookingContext';
export { useCart } from '@/context/CartContext';
export { useLocation } from '@/context/LocationContext';
export { useModal } from '@/context/ModalContext';
export { useSearch } from '@/context/SearchContext';
export { useNotification } from '@/context/NotificationContext';

// Export constants
export { UserRole } from '@/context/AuthContext';
export { BookingStatus } from '@/context/BookingContext';
export { ModalType, MODALS } from '@/context/ModalContext';
export { SearchType, SortOption, PriceRange, DateRange } from '@/context/SearchContext';
export { NotificationType, NotificationPriority, NotificationChannel } from '@/context/NotificationContext';