'use strict';
const loyaltyRepository = require('./loyalty.repository');
const Loyalty = require('./loyalty.model');
const { BadRequestError } = require('../../common/errors/AppError');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

const POINTS_PER_DOLLAR = 10;

class LoyaltyService {
  async getAccount(userId) {
    let account = await loyaltyRepository.findByUser(userId);
    if (!account) account = await new Loyalty({ user: userId }).save();
    return account;
  }
  async getHistory(userId) {
    const account = await this.getAccount(userId);
    return { transactions: account.transactions || [], totalPoints: account.totalPoints, tier: account.tier };
  }
  async earnPoints(userId, amount, description='', bookingId=null) {
    const account = await this.getAccount(userId);
    const points = Math.floor(amount * POINTS_PER_DOLLAR);
    account.earn(points, description, bookingId);
    await account.save();
    return account;
  }
  async redeemPoints(userId, points) {
    const account = await this.getAccount(userId);
    if (account.totalPoints < points) throw new BadRequestError('Insufficient points.');
    account.totalPoints -= points;
    account.transactions.push({ type:'redeem', points: -points, balance: account.totalPoints, description: 'Points redeemed' });
    await account.save();
    const discount = points / POINTS_PER_DOLLAR;
    return { account, discount };
  }
  async getTiers() {
    return [
      { name:'bronze',   min:0,     max:999,   benefits:['5% discount'] },
      { name:'silver',   min:1000,  max:4999,  benefits:['10% discount','priority support'] },
      { name:'gold',     min:5000,  max:9999,  benefits:['15% discount','free cancellation'] },
      { name:'platinum', min:10000, max:null,  benefits:['20% discount','VIP access','dedicated support'] },
    ];
  }
}
module.exports = new LoyaltyService();
