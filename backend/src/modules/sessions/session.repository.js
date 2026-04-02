'use strict';
const Session = require('./session.model');

class SessionRepository {
  async create(data)              { return new Session(data).save(); }
  async findByToken(token)        { return Session.findOne({ token, isActive: true }).exec(); }
  async findByUser(userId)        { return Session.find({ user: userId, isActive: true }).sort('-lastSeenAt').lean(); }
  async deactivate(token)         { return Session.findOneAndUpdate({ token }, { $set: { isActive: false } }).exec(); }
  async deactivateAll(userId)     { return Session.updateMany({ user: userId }, { $set: { isActive: false } }); }
  async touch(token)              { return Session.findOneAndUpdate({ token }, { $set: { lastSeenAt: new Date() } }).exec(); }
}
module.exports = new SessionRepository();
