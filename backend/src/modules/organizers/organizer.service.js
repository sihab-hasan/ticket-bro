'use strict';

const organizerRepository = require('./organizer.repository');
const User = require('../users/user.model');
const Event = require('../events/event.model');
const { NotFoundError, BadRequestError } = require('../../common/errors/AppError');

class OrganizerService {
  async getPublicProfile(slug) {
    const profile = await organizerRepository.findBySlug(slug);
    if (!profile) return null;

    return this._serialiseProfile(profile, { includePrivateFields: false });
  }

  async getPublicEvents(slug, query = {}) {
    const profile = await organizerRepository.findBySlug(slug);
    if (!profile) throw new NotFoundError('Organizer not found.');

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 12);
    const skip = (page - 1) * limit;

    const filter = {
      organizer: profile.user._id,
      status: 'published',
      visibility: 'public',
      deletedAt: null,
    };

    if (query.search) {
      const search = new RegExp(query.search, 'i');
      filter.$or = [
        { title: search },
        { description: search },
      ];
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .select('title slug shortDescription coverImage startDate endDate minPrice maxPrice currency location isFeatured totalSold')
        .sort(query.sort || '-startDate')
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    return {
      organizer: this._serialiseProfile(profile, { includePrivateFields: false }),
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOwnProfile(userId) {
    const profile = await this._ensureProfile(userId);
    return this._serialiseProfile(profile, { includePrivateFields: true });
  }

  async updateProfile(userId, data) {
    const profile = await this._ensureProfile(userId);
    const allowedFields = [
      'displayName',
      'bio',
      'logo',
      'coverImage',
      'website',
      'phone',
      'email',
      'socialLinks',
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        profile[field] = data[field];
      }
    }

    await profile.save();
    const updatedProfile = await organizerRepository.findByUserId(userId);
    return this._serialiseProfile(updatedProfile, { includePrivateFields: true });
  }

  async submitVerification(userId, data) {
    const profile = await this._ensureProfile(userId);

    if (profile.verificationStatus === 'verified') {
      throw new BadRequestError('Organizer profile is already verified.');
    }

    if (data.verificationDoc) {
      profile.verificationDoc = data.verificationDoc;
    }

    profile.verificationStatus = 'pending';
    await profile.save();

    return {
      status: profile.verificationStatus,
      verificationDoc: profile.verificationDoc || null,
      submittedAt: profile.updatedAt,
    };
  }

  async getVerificationStatus(userId) {
    const profile = await this._ensureProfile(userId);
    return {
      status: profile.verificationStatus,
      verificationDoc: profile.verificationDoc || null,
      verifiedAt: profile.verifiedAt || null,
      updatedAt: profile.updatedAt,
    };
  }

  async _ensureProfile(userId) {
    let profile = await organizerRepository.findByUserId(userId);
    if (profile) return profile;

    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) throw new NotFoundError('Organizer user not found.');

    const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    await organizerRepository.create({
      user: user._id,
      displayName,
      email: user.email,
      phone: user.phone || '',
    });

    profile = await organizerRepository.findByUserId(userId);
    return profile;
  }

  _serialiseProfile(profile, { includePrivateFields }) {
    const source = profile.toObject ? profile.toObject() : profile;
    const user = source.user || {};

    return {
      id: source._id,
      userId: user._id || source.user,
      displayName: source.displayName,
      slug: source.slug,
      bio: source.bio,
      logo: source.logo,
      coverImage: source.coverImage,
      website: source.website,
      phone: source.phone,
      email: includePrivateFields ? source.email : undefined,
      socialLinks: source.socialLinks || {},
      verificationStatus: source.verificationStatus,
      verifiedAt: source.verifiedAt || null,
      isActive: source.isActive,
      eventCount: source.eventCount || 0,
      totalRevenue: source.totalRevenue || 0,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      verificationDoc: includePrivateFields ? (source.verificationDoc || null) : undefined,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: includePrivateFields ? user.email : undefined,
        avatar: user.avatar || null,
      },
    };
  }
}

module.exports = new OrganizerService();
