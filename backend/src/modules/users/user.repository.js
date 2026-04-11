'use strict';

// backend/src/modules/users/user.repository.js

const User = require('./user.model');

class UserRepository {

  // ── Find ────────────────────────────────────────────────────────────────────

  async findById(id, select = '') {
    return User.findById(id).select(select);
  }

  async findByEmail(email, select = '') {
    return User.findOne({ email: email.toLowerCase(), deletedAt: null }).select(select);
  }

  async findActiveById(id) {
    return User.findOne({ _id: id, deletedAt: null, isActive: true });
  }

  // ── List with pagination + filters ──────────────────────────────────────────

  async findAll({ page = 1, limit = 20, role, status, search, isActive, sort = '-createdAt' } = {}) {
    const filter = { deletedAt: null };

    if (role)               filter.role     = role;
    if (status)             filter.status   = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { firstName: re },
        { lastName:  re },
        { email:     re },
        { phone:     re },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return {
      users,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // ── Create / Update / Delete ────────────────────────────────────────────────

  async updateById(id, data) {
    return User.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    );
  }

  async softDeleteById(id) {
    return User.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), isActive: false, status: 'inactive' } },
      { returnDocument: 'after' },
    );
  }

  async hardDeleteById(id) {
    return User.findByIdAndDelete(id);
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  async getStats() {
    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [total, activeThisMonth, activeLastMonth, byRole] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ deletedAt: null, createdAt: { $gte: thisMonth } }),
      User.countDocuments({ deletedAt: null, createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      User.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      newThisMonth: activeThisMonth,
      newLastMonth: activeLastMonth,
      byRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    };
  }
}

module.exports = new UserRepository();
