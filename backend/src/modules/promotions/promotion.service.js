'use strict';
const promotionRepository = require('./promotion.repository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../common/errors/AppError');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class PromotionService {
  async validateCode(code, { subtotal=0, eventId } = {}) {
    const promo = await promotionRepository.findByCode(code);
    if (!promo) throw new NotFoundError('Promotion code not found.');
    if (!promo.isValid) throw new BadRequestError('Promotion code is no longer valid.');
    if (promo.minAmount && subtotal < promo.minAmount) throw new BadRequestError(`Minimum order amount is ${promo.minAmount}.`);
    if (promo.event && eventId && promo.event.toString() !== eventId.toString()) throw new BadRequestError('Code not valid for this event.');

    let discount = promo.type === 'percentage' ? (subtotal * promo.value / 100) : promo.value;
    if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    discount = Math.round(discount * 100) / 100;

    return { valid: true, promoId: promo._id, code: promo.code, type: promo.type, value: promo.value, discount };
  }

  async create(data, user) { return promotionRepository.create({ ...data, organizer: getId(user) }); }

  async getMyPromotions(user, query={}) {
    return promotionRepository.findByOrganizer(getId(user), query.page, query.limit);
  }

  async update(id, data, user) {
    const promo = await promotionRepository.updateById(id, data);
    if (!promo || promo.organizer.toString() !== getId(user)) throw new ForbiddenError('Access denied.');
    return promo;
  }

  async remove(id, user) {
    const deleted = await promotionRepository.deleteById(id, getId(user));
    if (!deleted) throw new NotFoundError('Promotion not found.');
    return { message: 'Promotion deleted.' };
  }
}
module.exports = new PromotionService();
