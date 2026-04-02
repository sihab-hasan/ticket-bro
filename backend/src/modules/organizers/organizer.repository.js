'use strict';
const User = require('../users/user.model');
class OrganizerRepository {
  async findAll(query={}) {
    const filter = { role: 'organizer', deletedAt: null };
    const page=Number(query.page||1), limit=Number(query.limit||20);
    const [organizers, total] = await Promise.all([
      User.find(filter).select('-password').sort('-createdAt').skip((page-1)*limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return { organizers, pagination: { total, page, limit, totalPages: Math.ceil(total/limit) } };
  }
  async findById(id) { return User.findOne({ _id: id, role: 'organizer', deletedAt: null }).select('-password').exec(); }
  async updateById(id, data) { return User.findByIdAndUpdate(id, { $set: data }, { new: true }).select('-password').exec(); }
}
module.exports = new OrganizerRepository();
