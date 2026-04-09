'use strict';
const Promotion = require('./promotion.model');
const eventPopulate = require('../events/event.populate');

class PromotionRepository {
  async create(data) { return new Promotion(data).save(); }
  async findByCode(code) { return Promotion.findOne({ code: code.toUpperCase(), deletedAt: null }).exec(); }
  async findByOrganizer(organizerId, page=1, limit=20) {
    const filter = { organizer: organizerId, deletedAt: null };
    const skip = (Number(page)-1)*Number(limit);
    const [promotions, total] = await Promise.all([
      Promotion.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Promotion.countDocuments(filter),
    ]);
    return { promotions, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async updateById(id, data) { return Promotion.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec(); }
  async incrementUses(id) { return Promotion.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }).exec(); }
  async deleteById(id, organizerId) { return Promotion.findOneAndUpdate({ _id: id, organizer: organizerId }, { $set: { deletedAt: new Date() } }).exec(); }
  async findPublicEventOffers({ category } = {}) {
    const now = new Date();
    const filter = {
      deletedAt: null,
      isActive: true,
      event: { $ne: null },
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        {
          $or: [
            { maxUses: null },
            { $expr: { $lt: ['$usedCount', '$maxUses'] } },
          ],
        },
      ],
    };

    const promotions = await Promotion.find(filter)
      .populate({
        path: 'event',
        match: {
          deletedAt: null,
          status: 'published',
          visibility: 'public',
          ...(category ? { category } : {}),
        },
        populate: eventPopulate,
      })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    return promotions.filter((promotion) => promotion.event);
  }
}
module.exports = new PromotionRepository();
