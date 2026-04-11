'use strict';
const Cart = require('./cart.model');

class CartRepository {
  async findByUserId(userId) {
    return Cart.findOne({ user: userId })
      .populate('items.event', 'title slug startDate coverImage currency location')
      .populate('items.ticketType', 'name type price available minPerOrder maxPerOrder')
      .exec();
  }
  async upsert(userId, data) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $set: { ...data, expiresAt: new Date(Date.now() + 2*60*60*1000) } },
      { returnDocument: 'after', upsert: true, runValidators: true }
    )
      .populate('items.event', 'title slug startDate coverImage currency location')
      .populate('items.ticketType', 'name type price available minPerOrder maxPerOrder')
      .exec();
  }
  async deleteByUserId(userId) { return Cart.deleteOne({ user: userId }); }
}
module.exports = new CartRepository();
