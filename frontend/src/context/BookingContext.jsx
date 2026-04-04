// frontend/src/contexts/BookingContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useAuth from './AuthContext';

const BookingContext = createContext(null);

// Booking statuses
export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Mock bookings data
const MOCK_BOOKINGS = [
  {
    id: 'booking_1',
    userId: '3',
    eventId: 'event_1',
    eventName: 'Taylor Swift: The Eras Tour',
    eventDate: '2024-06-15T19:30:00',
    venue: 'MetLife Stadium',
    quantity: 2,
    tickets: [
      { id: 'ticket_1', seat: 'Section A, Row 10, Seat 5', price: 199.99 },
      { id: 'ticket_2', seat: 'Section A, Row 10, Seat 6', price: 199.99 }
    ],
    totalAmount: 399.98,
    status: BookingStatus.CONFIRMED,
    paymentMethod: 'visa',
    paymentId: 'pay_123456',
    bookingDate: '2024-01-15T10:30:00',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking_1'
  },
  {
    id: 'booking_2',
    userId: '3',
    eventId: 'event_2',
    eventName: 'NBA Finals: Game 7',
    eventDate: '2024-07-20T20:00:00',
    venue: 'Madison Square Garden',
    quantity: 4,
    tickets: [
      { id: 'ticket_3', seat: 'Section B, Row 5, Seat 1', price: 299.99 },
      { id: 'ticket_4', seat: 'Section B, Row 5, Seat 2', price: 299.99 },
      { id: 'ticket_5', seat: 'Section B, Row 5, Seat 3', price: 299.99 },
      { id: 'ticket_6', seat: 'Section B, Row 5, Seat 4', price: 299.99 }
    ],
    totalAmount: 1199.96,
    status: BookingStatus.PENDING,
    paymentMethod: 'paypal',
    paymentId: null,
    bookingDate: '2024-02-01T15:45:00'
  }
];

export const BookingProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    dateFrom: null,
    dateTo: null,
    search: ''
  });

  // Load user bookings
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserBookings();
    }
  }, [isAuthenticated, user]);

  const loadUserBookings = async () => {
    setIsLoading(true);
    try {
      // API call to fetch bookings
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock bookings for current user
      const userBookings = MOCK_BOOKINGS.filter(b => b.userId === user?.id);
      setBookings(userBookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new booking
  const createBooking = useCallback(async (bookingData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to create booking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBooking = {
        id: `booking_${Date.now()}`,
        userId: user?.id,
        ...bookingData,
        status: BookingStatus.PENDING,
        bookingDate: new Date().toISOString(),
        tickets: bookingData.tickets?.map((t, index) => ({
          id: `ticket_${Date.now()}_${index}`,
          ...t
        })) || []
      };
      
      setBookings(prev => [...prev, newBooking]);
      setCurrentBooking(newBooking);
      
      return { success: true, booking: newBooking };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get booking by ID
  const getBooking = useCallback(async (bookingId) => {
    setIsLoading(true);
    try {
      // Check if already in state
      let booking = bookings.find(b => b.id === bookingId);
      
      if (!booking) {
        // API call to fetch booking
        await new Promise(resolve => setTimeout(resolve, 300));
        booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
      }
      
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [bookings]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId, status) => {
    setIsLoading(true);
    try {
      // API call to update status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status }
            : booking
        )
      );
      
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(prev => ({ ...prev, status }));
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentBooking]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason) => {
    setIsLoading(true);
    try {
      // API call to cancel booking
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: BookingStatus.CANCELLED, cancellationReason: reason }
            : booking
        )
      );
      
      if (currentBooking?.id === bookingId) {
        setCurrentBooking(prev => ({ 
          ...prev, 
          status: BookingStatus.CANCELLED,
          cancellationReason: reason 
        }));
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentBooking]);

  // Request refund
  const requestRefund = useCallback(async (bookingId, reason) => {
    setIsLoading(true);
    try {
      // API call to request refund
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, refundRequested: true, refundReason: reason }
            : booking
        )
      );
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Download tickets
  const downloadTickets = useCallback(async (bookingId) => {
    setIsLoading(true);
    try {
      // API call to get ticket PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock download
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        // Generate PDF and download
        console.log('Downloading tickets for booking:', bookingId);
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [bookings]);

  // Resend tickets email
  const resendTickets = useCallback(async (bookingId) => {
    setIsLoading(true);
    try {
      // API call to resend tickets
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters
  const filteredBookings = useCallback(() => {
    return bookings.filter(booking => {
      if (filters.status && booking.status !== filters.status) return false;
      if (filters.dateFrom && new Date(booking.eventDate) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(booking.eventDate) > new Date(filters.dateTo)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return booking.eventName.toLowerCase().includes(searchLower) ||
               booking.venue.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [bookings, filters]);

  // Get upcoming bookings
  const upcomingBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(booking => 
      new Date(booking.eventDate) > now && 
      [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(booking.status)
    );
  }, [bookings]);

  // Get past bookings
  const pastBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(booking => 
      new Date(booking.eventDate) < now ||
      [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REFUNDED].includes(booking.status)
    );
  }, [bookings]);

  const value = {
    // State
    bookings,
    currentBooking,
    isLoading,
    error,
    filters,
    
    // CRUD operations
    createBooking,
    getBooking,
    updateBookingStatus,
    cancelBooking,
    
    // Ticket management
    downloadTickets,
    resendTickets,
    
    // Refunds
    requestRefund,
    
    // Filtering
    setFilters,
    filteredBookings: filteredBookings(),
    upcomingBookings: upcomingBookings(),
    pastBookings: pastBookings(),
    
    // Stats
    totalBookings: bookings.length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    activeBookings: bookings.filter(b => 
      [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(b.status)
    ).length,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};