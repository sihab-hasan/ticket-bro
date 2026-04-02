'use strict';
const Cart = require('./cart.model');

class CartRepository {
  async findByUserId(userId) {
    return Cart.findOne({ user: userId })
      .populate('items.event', 'title slug startDate coverImage')
      .populate('items.ticketType', 'name type price available')
      .exec();
  }
  async upsert(userId, data) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $set: { ...data, expiresAt: new Date(Date.now() + 2*60*60*1000) } },
      { new: true, upsert: true, runValidators: true }
    ).populate('items.event', 'title slug startDate coverImage').exec();
  }
  async deleteByUserId(userId) { return Cart.deleteOne({ user: userId }); }
}
module.exports = new CartRepository();
