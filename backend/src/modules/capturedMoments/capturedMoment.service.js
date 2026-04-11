'use strict';

const path = require('path');
const CapturedMoment = require('./capturedMoment.model');
const { uploadImage } = require('../../infrastructure/storage/imageStorage');
const { invalidateCachePatterns } = require('../../common/middleware/cache.middleware');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../../common/errors/AppError');

const getId = (user) => user?._id?.toString() || user?.id || user?.userId;

const buildTitleFromFile = (file, fallback = 'Captured Moment') => {
  const baseName = path.parse(file?.originalname || '').name || '';
  const title = baseName.replace(/[-_]+/g, ' ').trim();

  if (!title) {
    return fallback;
  }

  return title.replace(/\b\w/g, (character) => character.toUpperCase()).slice(0, 120);
};

class CapturedMomentService {
  async _invalidatePublicMomentCaches() {
    await invalidateCachePatterns(['http-cache:GET:*/captured-moments*']);
  }

  _buildUploader(user = null) {
    if (!user) {
      return null;
    }

    const displayName =
      user.displayName ||
      user.organizationName ||
      user.name ||
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.email ||
      'Community Member';

    return {
      id: user.id || user._id || null,
      name: displayName,
      avatar: user.avatar || null,
    };
  }

  _serializeCategory(category = null) {
    if (!category) {
      return null;
    }

    if (typeof category === 'string') {
      return {
        id: category,
        slug: null,
        name: 'Community',
      };
    }

    return {
      ...category,
      id: category.id || category._id || null,
      slug: category.slug || null,
      name: category.name || category.label || category.slug || 'Community',
    };
  }

  _serializeMoment(moment, user = null) {
    if (!moment) {
      return null;
    }

    const plainMoment =
      typeof moment.toObject === 'function'
        ? moment.toObject({ virtuals: true })
        : { ...moment };
    const userId = getId(user)?.toString?.() || null;
    const reactorIds = Array.isArray(plainMoment.reactorIds)
      ? plainMoment.reactorIds
          .map((reactorId) => reactorId?._id?.toString?.() || reactorId?.toString?.() || null)
          .filter(Boolean)
      : [];

    const serializedMoment = {
      ...plainMoment,
      image: plainMoment.imageUrl,
      category: this._serializeCategory(plainMoment.category),
      uploader: this._buildUploader(plainMoment.uploader),
      reactionCount: reactorIds.length,
      hasReacted: Boolean(userId && reactorIds.includes(userId)),
    };

    delete serializedMoment.imageUrl;
    delete serializedMoment.reactorIds;

    return serializedMoment;
  }

  async listMoments(query = {}, user = null) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 12), 50);
    const skip = (page - 1) * limit;
    const filter = {
      deletedAt: null,
      isPublished: true,
    };

    if (query.category) {
      filter.category = query.category;
    }

    const [moments, total] = await Promise.all([
      CapturedMoment.find(filter)
        .populate('category', 'name slug')
        .populate('uploader', 'firstName lastName displayName avatar email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CapturedMoment.countDocuments(filter),
    ]);

    return {
      moments: moments.map((moment) => this._serializeMoment(moment, user)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async createMoments(files = [], payload = {}, user) {
    const uploaderId = getId(user);

    if (!uploaderId) {
      throw new ForbiddenError('You must be logged in to upload a photo.');
    }

    if (!Array.isArray(files) || files.length === 0) {
      throw new BadRequestError('Upload at least one image.');
    }

    const createdMoments = [];

    for (const [index, file] of files.entries()) {
      const uploadResult = await uploadImage(
        file,
        'capturedMoment',
        `moment-${uploaderId}-${Date.now()}-${index}`,
      );

      const createdMoment = await CapturedMoment.create({
        title: payload.title || buildTitleFromFile(file),
        imageUrl: uploadResult.url,
        uploader: uploaderId,
        category: payload.categoryId || null,
      });

      createdMoments.push(createdMoment);
    }

    const populatedMoments = await CapturedMoment.find({
      _id: { $in: createdMoments.map((moment) => moment._id) },
    })
      .populate('category', 'name slug')
      .populate('uploader', 'firstName lastName displayName avatar email')
      .sort({ createdAt: -1 });

    await this._invalidatePublicMomentCaches();

    return populatedMoments.map((moment) => this._serializeMoment(moment, user));
  }

  async toggleReaction(id, user) {
    const moment = await CapturedMoment.findOne({
      _id: id,
      deletedAt: null,
      isPublished: true,
    });

    if (!moment) {
      throw new NotFoundError('Captured moment not found.');
    }

    const userId = getId(user);

    if (!userId) {
      throw new ForbiddenError('You must be logged in to react to a photo.');
    }

    const normalizedUserId = userId.toString();
    const currentReactors = Array.isArray(moment.reactorIds)
      ? moment.reactorIds.map((reactorId) => reactorId.toString())
      : [];

    if (currentReactors.includes(normalizedUserId)) {
      moment.reactorIds = currentReactors.filter(
        (reactorId) => reactorId !== normalizedUserId,
      );
    } else {
      moment.reactorIds = [...currentReactors, normalizedUserId];
    }

    await moment.save();

    const populatedMoment = await CapturedMoment.findById(moment._id)
      .populate('category', 'name slug')
      .populate('uploader', 'firstName lastName displayName avatar email');

    await this._invalidatePublicMomentCaches();

    const serializedMoment = this._serializeMoment(populatedMoment, user);

    return {
      moment: serializedMoment,
      reaction: {
        count: serializedMoment.reactionCount,
        hasReacted: serializedMoment.hasReacted,
      },
    };
  }
}

module.exports = new CapturedMomentService();
