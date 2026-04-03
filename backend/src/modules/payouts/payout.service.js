'use strict';
const payoutRepository = require('./payout.repository');
const { NotFoundError, BadRequestError } = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const userRepository = require('../users/user.repository');
const emailService = require('../../infrastructure/mail/emailService');
const {
  formatDateTime,
  buildFrontendUrl,
  getPayoutDestination,
  getUserFirstName,
} = require('../../infrastructure/mail/templateData');
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

    const organizer = await userRepository.findById(p.organizer);
    if (organizer?.email) {
      await emailService.sendPayoutSentEmail({
        to: organizer.email,
        firstName: getUserFirstName(organizer),
        amount: p.amount,
        currency: p.currency,
        payoutReference: p._id?.toString?.(),
        destination: getPayoutDestination(p),
        processedAt: formatDateTime(p.processedAt || new Date()),
        dashboardUrl: buildFrontendUrl('/organizer/revenue'),
      });
    }

    return p;
  }
  async rejectPayout(id, reason, adminUser) {
    const p = await payoutRepository.updateById(id, { status: 'failed', notes: reason, processedBy: getId(adminUser) });
    if (!p) throw new NotFoundError('Payout not found.');
    return p;
  }
}
module.exports = new PayoutService();
