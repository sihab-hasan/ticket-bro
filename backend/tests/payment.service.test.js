'use strict';

jest.mock('../src/modules/payments/payment.repository', () => ({
  create: jest.fn(),
  findByGatewayId: jest.fn(),
  findPendingByBookingId: jest.fn(),
  updateById: jest.fn(),
}));

jest.mock('../src/modules/bookings/booking.repository', () => ({
  updateById: jest.fn(),
}));

jest.mock('../src/modules/bookings/booking.service', () => ({
  getBookingByRef: jest.fn(),
  confirmBooking: jest.fn(),
}));

const paymentRepository = require('../src/modules/payments/payment.repository');
const bookingRepository = require('../src/modules/bookings/booking.repository');
const bookingService = require('../src/modules/bookings/booking.service');
const paymentService = require('../src/modules/payments/payment.service');

describe('payment service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('reuses an existing pending payment intent for the same booking', async () => {
    bookingService.getBookingByRef.mockResolvedValue({
      _id: 'booking-1',
      totalAmount: 120,
      paymentStatus: 'pending',
    });
    paymentRepository.findPendingByBookingId.mockResolvedValue({
      _id: 'payment-1',
      clientSecret: 'secret_123',
      gatewayPaymentId: 'pi_existing',
    });

    const result = await paymentService.createPaymentIntent({
      bookingRef: 'BK-100',
      userId: 'user-1',
      currency: 'USD',
    });

    expect(result).toEqual({
      clientSecret: 'secret_123',
      paymentId: 'payment-1',
      gatewayPaymentId: 'pi_existing',
    });
    expect(bookingRepository.updateById).toHaveBeenCalledWith('booking-1', {
      payment: 'payment-1',
      paymentStatus: 'pending',
    });
    expect(paymentRepository.create).not.toHaveBeenCalled();
  });

  test('rejects payment verification when the payment does not belong to the authenticated user', async () => {
    paymentRepository.findByGatewayId.mockResolvedValue({
      _id: 'payment-1',
      user: { _id: 'other-user' },
      booking: { bookingRef: 'BK-100', _id: 'booking-1' },
    });

    await expect(
      paymentService.verifyPayment({
        paymentIntentId: 'pi_existing',
        bookingRef: 'BK-100',
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(bookingService.getBookingByRef).not.toHaveBeenCalled();
  });

  test('confirms the booking when the payment and booking match the authenticated user', async () => {
    paymentRepository.findByGatewayId.mockResolvedValue({
      _id: 'payment-1',
      status: 'pending',
      user: { _id: 'user-1' },
      booking: {
        bookingRef: 'BK-100',
        _id: { toString: () => 'booking-1' },
      },
    });
    bookingService.getBookingByRef.mockResolvedValue({
      _id: { toString: () => 'booking-1' },
      paymentStatus: 'pending',
    });

    const result = await paymentService.verifyPayment({
      paymentIntentId: 'pi_existing',
      bookingRef: 'BK-100',
      userId: 'user-1',
    });

    expect(paymentRepository.updateById).toHaveBeenCalledWith('payment-1', {
      status: 'succeeded',
      paidAt: expect.any(Date),
    });
    expect(bookingService.confirmBooking).toHaveBeenCalledWith('BK-100', 'payment-1');
    expect(result).toEqual({
      status: 'succeeded',
      bookingRef: 'BK-100',
      paymentId: 'payment-1',
    });
  });
});
