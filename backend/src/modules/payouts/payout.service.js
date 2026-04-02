'use strict';
const payoutRepository = require('./payout.repository');
const { NotFoundError, BadRequestError } = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class PayoutService {
  async requestPayout(data, user) {
    const payout = await payoutRepository.create({ ...data, organizer: getId(user) });
    logger.info(`Payout requested by ${getId(user)}: $${data.amount}`);
    return payout;
  }
  async getMyPayouts(userId, query={}) { return payoutRepository.findByOrganizer(userId, query.page, query.limit); }
  async getAllPayouts(query={})        { return payoutRepository.findAll({}, query.page, query.limit); }
  async approvePayout(id, adminUser)  {
    const p = await payoutRepository.updateById(id, { status: 'completed', processedAt: new Date(), processedBy: getId(adminUser) });
    if (!p) throw new NotFoundError('Payout not found.');
    return p;
  }
  async rejectPayout(id, reason, adminUser) {
    const p = await payoutRepository.updateById(id, { status: 'failed', notes: reason, processedBy: getId(adminUser) });
    if (!p) throw new NotFoundError('Payout not found.');
    return p;
  }
}
module.exports = new PayoutService();
