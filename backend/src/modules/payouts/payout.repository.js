'use strict';
const Payout = require('./payout.model');
class PayoutRepository {
  async create(data) { return new Payout(data).save(); }
  async findByOrganizer(organizerId, page=1, limit=20) {
    const filter = { organizer: organizerId, deletedAt: null };
    const skip = (Number(page)-1)*Number(limit);
    const [payouts, total] = await Promise.all([
      Payout.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Payout.countDocuments(filter),
    ]);
    return { payouts, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async findAll(filter={}, page=1, limit=20) {
    const skip = (Number(page)-1)*Number(limit);
    const [payouts, total] = await Promise.all([
      Payout.find({ ...filter, deletedAt: null }).populate('organizer','firstName lastName email').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Payout.countDocuments({ ...filter, deletedAt: null }),
    ]);
    return { payouts, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async updateById(id, data) { return Payout.findByIdAndUpdate(id, { $set: data }, { new: true }).exec(); }
}
module.exports = new PayoutRepository();
