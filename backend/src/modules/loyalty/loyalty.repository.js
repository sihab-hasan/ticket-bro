'use strict';
const Loyalty = require('./loyalty.model');
class LoyaltyRepository {
  async findByUser(userId) { return Loyalty.findOne({ user: userId }).exec(); }
  async upsert(userId, update) { return Loyalty.findOneAndUpdate({ user: userId }, update, { returnDocument: 'after', upsert: true, runValidators: true }).exec(); }
  async save(doc) { return doc.save(); }
}
module.exports = new LoyaltyRepository();
