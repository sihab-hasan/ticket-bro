'use strict';

const organizerRepository = require('./organizer.repository');
const User = require('../users/user.model');
const Event = require('../events/event.model');
const { uploadImage, deleteImage } = require('../../infrastructure/storage/cloudinary');
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

    if (profile.verificationStatus === 'pending') {
      throw new BadRequestError('A verification request is already pending review.');
    }

    if (data.verificationDoc) {
      profile.verificationDoc = data.verificationDoc;
    }
    profile.verificationNotes = data.verificationNotes || '';
    profile.verificationStatus = 'pending';
    profile.verificationRequestedAt = new Date();
    profile.verificationReviewedAt = undefined;
    profile.verificationReviewedBy = undefined;
    profile.rejectionReason = undefined;
    profile.verifiedAt = undefined;
    await profile.save();

    return this._serialiseVerification(profile);
  }

  async getVerificationStatus(userId) {
    const profile = await this._ensureProfile(userId);
    return this._serialiseVerification(profile);
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
      verificationNotes: includePrivateFields ? (source.verificationNotes || '') : undefined,
      verificationRequestedAt: includePrivateFields ? (source.verificationRequestedAt || null) : undefined,
      verificationReviewedAt: includePrivateFields ? (source.verificationReviewedAt || null) : undefined,
      rejectionReason: includePrivateFields ? (source.rejectionReason || '') : undefined,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: includePrivateFields ? user.email : undefined,
        avatar: user.avatar || null,
      },
    };
  }

  _serialiseVerification(profile) {
    const source = profile.toObject ? profile.toObject() : profile;

    return {
      status: source.verificationStatus,
      verificationDoc: source.verificationDoc || null,
      verificationNotes: source.verificationNotes || '',
      requestedAt: source.verificationRequestedAt || null,
      reviewedAt: source.verificationReviewedAt || null,
      verifiedAt: source.verifiedAt || null,
      rejectionReason: source.rejectionReason || '',
      updatedAt: source.updatedAt,
    };
  }

  // ── Logo ─────────────────────────────────────────────────────────────────────
  async uploadLogo(userId, file) {
    if (!file?.buffer) throw new BadRequestError('No file buffer — check multer config.');
    const organizer = await this._ensureProfile(userId);
    const result = await uploadImage(file.buffer, 'organizerLogo', `logo-${organizer._id}`);
    if (organizer.logo && organizer.logo !== result.url) await deleteImage(organizer.logo);
    const updated = await organizerRepository.updateById(organizer._id, { logo: result.url });
    return this._serialiseProfile(updated, { includePrivateFields: true });
  }

  async removeLogo(userId) {
    const organizer = await this._ensureProfile(userId);
    if (organizer.logo) await deleteImage(organizer.logo);
    const updated = await organizerRepository.updateById(organizer._id, { logo: null });
    return this._serialiseProfile(updated, { includePrivateFields: true });
  }

  // ── Banner ───────────────────────────────────────────────────────────────────
  async uploadBanner(userId, file) {
    if (!file?.buffer) throw new BadRequestError('No file buffer — check multer config.');
    const organizer = await this._ensureProfile(userId);
    const result = await uploadImage(file.buffer, 'organizerBanner', `banner-${organizer._id}`);
    if (organizer.coverImage && organizer.coverImage !== result.url) await deleteImage(organizer.coverImage);
    const updated = await organizerRepository.updateById(organizer._id, { coverImage: result.url });
    return this._serialiseProfile(updated, { includePrivateFields: true });
  }

  async removeBanner(userId) {
    const organizer = await this._ensureProfile(userId);
    if (organizer.coverImage) await deleteImage(organizer.coverImage);
    const updated = await organizerRepository.updateById(organizer._id, { coverImage: null });
    return this._serialiseProfile(updated, { includePrivateFields: true });
  }
}

module.exports = new OrganizerService();
