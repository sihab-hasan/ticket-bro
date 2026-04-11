'use strict';

const Organizer = require('./organizer.model');

const basePopulate = 'firstName lastName email avatar phone role isActive createdAt updatedAt';

class OrganizerRepository {
  _buildUpdateDocument(data = {}) {
    const update = {};
    const set = {};
    const unset = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        unset[key] = 1;
        return;
      }

      set[key] = value;
    });

    if (Object.keys(set).length) {
      update.$set = set;
    }

    if (Object.keys(unset).length) {
      update.$unset = unset;
    }

    return update;
  }

  async findAll(query = {}) {
    const filter = { deletedAt: null, isActive: true };
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);

    if (query.verificationStatus) {
      filter.verificationStatus = query.verificationStatus;
    }

    if (query.search) {
      filter.displayName = new RegExp(query.search, 'i');
    }

    const [organizers, total] = await Promise.all([
      Organizer.find(filter)
        .populate('user', basePopulate)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Organizer.countDocuments(filter),
    ]);

    return {
      organizers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return Organizer.findOne({ _id: id, deletedAt: null })
      .populate('user', basePopulate)
      .exec();
  }

  async findBySlug(slug) {
    return Organizer.findOne({ slug, deletedAt: null, isActive: true })
      .populate('user', basePopulate)
      .exec();
  }

  async findByUserId(userId) {
    return Organizer.findOne({ user: userId, deletedAt: null })
      .populate('user', basePopulate)
      .exec();
  }

  async create(data) {
    return new Organizer(data).save();
  }

  async updateById(id, data) {
    const update = this._buildUpdateDocument(data);
    const updated = await Organizer.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select('_id').exec();

    if (!updated) {
      return null;
    }

    return this.findById(updated._id);
  }
}

module.exports = new OrganizerRepository();
