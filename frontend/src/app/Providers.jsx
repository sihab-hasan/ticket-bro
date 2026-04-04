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
import { MessagingProvider } from '@/context/MessagingContext';
import { BrowseProvider } from '@/context/BrowseContext';

// Order matters: providers that consume others must be nested inside them.
// MessagingProvider needs AuthProvider (reads isAuthenticated) and Redux store.
export const Providers = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      <LocationProvider>
        <BrowseProvider>
          <ModalProvider>
            <NotificationProvider>
              <MessagingProvider>
                <SearchProvider>
                  <BookingProvider>
                    <CartProvider>
                      {children}
                    </CartProvider>
                  </BookingProvider>
                </SearchProvider>
              </MessagingProvider>
            </NotificationProvider>
          </ModalProvider>
        </BrowseProvider>
      </LocationProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default Providers;

// Re-export hooks so consumers can import from one place
export { useTheme }          from '@/context/ThemeContext';
export { useAuth }           from '@/context/AuthContext';
export { useBooking }        from '@/context/BookingContext';
export { useCart }           from '@/context/CartContext';
export { useLocation }       from '@/context/LocationContext';
export { useModal }          from '@/context/ModalContext';
export { useSearch }         from '@/context/SearchContext';
export { useNotification }   from '@/context/NotificationContext';
export { useBrowseContext }   from '@/context/BrowseContext';

// Re-export constants
export { BookingStatus }      from '@/context/BookingContext';
export { ModalType, MODALS }  from '@/context/ModalContext';
export { SearchType, SortOption, PriceRange, DateRange } from '@/context/SearchContext';
export { NotificationType, NotificationPriority, NotificationChannel } from '@/context/NotificationContext';
