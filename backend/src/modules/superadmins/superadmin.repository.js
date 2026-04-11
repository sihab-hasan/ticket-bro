'use strict';
const User = require('../users/user.model');

class SuperAdminRepository {
  async findAll(page=1, limit=50) {
    const filter = { role: { $in: ['admin','super_admin'] }, deletedAt: null };
    const skip = (Number(page)-1)*Number(limit);
    const [admins, total] = await Promise.all([
      User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);
    return { admins, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async promoteToAdmin(userId) { return User.findByIdAndUpdate(userId, { $set: { role: 'admin' } }, { returnDocument: 'after' }).exec(); }
  async demoteFromAdmin(userId){ return User.findByIdAndUpdate(userId, { $set: { role: 'user'  } }, { returnDocument: 'after' }).exec(); }
}
module.exports = new SuperAdminRepository();
