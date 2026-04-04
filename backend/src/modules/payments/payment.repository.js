'use strict';
const Payment = require('./payment.model');

class PaymentRepository {
  async create(data) {
    return new Payment(data).save();
  }

  async findById(id) {
    return Payment.findOne({ _id: id, deletedAt: null })
      .populate('booking', 'bookingRef status paymentStatus items totalAmount refundedAt refundAmount')
      .populate('event', 'title slug startDate endDate location')
      .populate('user', 'firstName lastName email')
      .exec();
  }

  async findByGatewayId(gatewayPaymentId) {
    return Payment.findOne({ gatewayPaymentId, deletedAt: null })
      .populate('booking', 'bookingRef status paymentStatus user totalAmount refundedAt refundAmount')
      .populate('event', 'title slug startDate endDate location')
      .populate('user', 'firstName lastName email')
      .exec();
  }

  async findByBookingId(bookingId) {
    return Payment.findOne({ booking: bookingId, deletedAt: null }).exec();
  }

  async findPendingByBookingId(bookingId) {
    return Payment.findOne({
      booking: bookingId,
      deletedAt: null,
      status: { $in: ['pending', 'processing'] },
    })
      .select('+clientSecret')
      .exec();
  }

  async findByUserId({ userId, page = 1, limit = 20, sort = '-createdAt' }) {
    const filter = { user: userId, deletedAt: null };
    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('booking', 'bookingRef status')
        .populate('event', 'title slug')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Payment.countDocuments(filter),
    ]);
    return { payments, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async findAll({ status, gateway, page = 1, limit = 20, sort = '-createdAt' } = {}) {
    const filter = { deletedAt: null };
    if (status)  filter.status  = status;
    if (gateway) filter.gateway = gateway;
    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('booking', 'bookingRef')
        .populate('event', 'title slug startDate endDate location')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Payment.countDocuments(filter),
    ]);
    return { payments, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async updateById(id, data) {
    return Payment.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async getStats() {
    const [total, succeeded, refunded, revenue] = await Promise.all([
      Payment.countDocuments({ deletedAt: null }),
      Payment.countDocuments({ deletedAt: null, status: 'succeeded' }),
      Payment.countDocuments({ deletedAt: null, status: 'refunded' }),
      Payment.aggregate([
        { $match: { deletedAt: null, status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    return { total, succeeded, refunded, totalRevenue: revenue[0]?.total || 0 };
  }
}

module.exports = new PaymentRepository();
