import React, {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useAuth from './AuthContext';
import { bookingService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const BookingContext = createContext(null);

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHECKED_IN: 'checked_in',
};

export const BookingProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  const loadUserBookings = useCallback(
    async (nextFilters = filters) => {
      if (!isAuthenticated) {
        startTransition(() => {
          setBookings([]);
          setCurrentBooking(null);
        });
        setError(null);
        return [];
      }

      setIsLoading(true);

      try {
        const result = await bookingService.getMyBookings(nextFilters);
        const nextBookings = result?.bookings || [];

        startTransition(() => {
          setBookings(nextBookings);
        });
        setError(null);

        return nextBookings;
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Failed to load bookings'));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [filters, isAuthenticated],
  );

  useEffect(() => {
    loadUserBookings(filters);
  }, [filters, loadUserBookings]);

  const getBooking = useCallback(async (bookingRef) => {
    setIsLoading(true);

    try {
      const booking = await bookingService.getByRef(bookingRef);
      startTransition(() => {
        setCurrentBooking(booking);
      });
      setError(null);
      return booking;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Failed to load booking'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingRef, reason = '') => {
    setIsLoading(true);

    try {
      const booking = await bookingService.cancel(bookingRef, { reason });
      await loadUserBookings(filters);
      startTransition(() => {
        setCurrentBooking(booking);
      });
      setError(null);
      return booking;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Failed to cancel booking'));
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, [filters, loadUserBookings]);

  const requestRefund = useCallback(async (bookingRef, reason = '') => {
    setIsLoading(true);

    try {
      const booking = await bookingService.requestRefund(bookingRef, { reason });
      await loadUserBookings(filters);
      startTransition(() => {
        setCurrentBooking(booking);
      });
      setError(null);
      return booking;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Failed to request refund'));
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, [filters, loadUserBookings]);

  const filteredBookings = useMemo(() => {
    const search = String(filters.search || '').trim().toLowerCase();

    return bookings.filter((booking) => {
      if (filters.status && booking.status !== filters.status) {
        return false;
      }

      if (filters.dateFrom && booking.event?.startDate && new Date(booking.event.startDate) < new Date(filters.dateFrom)) {
        return false;
      }

      if (filters.dateTo && booking.event?.startDate && new Date(booking.event.startDate) > new Date(filters.dateTo)) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        booking.bookingRef,
        booking.event?.title,
        booking.event?.venue?.name,
        booking.event?.venue?.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [bookings, filters]);

  const upcomingBookings = useMemo(() => {
    const now = Date.now();
    return bookings.filter((booking) => {
      const eventTime = booking.event?.startDate ? new Date(booking.event.startDate).getTime() : 0;
      return (
        eventTime > now &&
        [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(booking.status)
      );
    });
  }, [bookings]);

  const pastBookings = useMemo(() => {
    const now = Date.now();
    return bookings.filter((booking) => {
      const eventTime = booking.event?.startDate ? new Date(booking.event.startDate).getTime() : 0;
      return (
        eventTime < now ||
        [BookingStatus.CANCELLED, BookingStatus.REFUNDED, BookingStatus.CHECKED_IN].includes(booking.status)
      );
    });
  }, [bookings]);

  const value = {
    bookings,
    currentBooking,
    isLoading,
    error,
    filters,
    setFilters,
    loadUserBookings,
    getBooking,
    cancelBooking,
    requestRefund,
    filteredBookings,
    upcomingBookings,
    pastBookings,
    totalBookings: bookings.length,
    totalSpent: bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0),
    activeBookings: bookings.filter((booking) =>
      [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(booking.status),
    ).length,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }

  return context;
};
