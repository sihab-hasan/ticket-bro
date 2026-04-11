'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ForbiddenError, UnauthorizedError } = require('../errors/AppError');
const { ROLES, normalizeRole } = require('../constants/roles');
const organizerRepository = require('../../modules/organizers/organizer.repository');

const getUserId = (user) => user?.id || user?._id || user?.userId;

const organizerRoles = new Set([
  ROLES.ORGANIZER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
]);

const requireOrganizerAccess = asyncHandler(async (req, _res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required.');
  }

  const userRole = normalizeRole(req.user.role);
  if (organizerRoles.has(userRole)) {
    return next();
  }

  const userId = getUserId(req.user);
  if (!userId) {
    throw new ForbiddenError('Organizer access is required.');
  }

  const organizerProfile = await organizerRepository.findByUserId(userId);
  if (organizerProfile) {
    req.organizerProfile = organizerProfile;
    return next();
  }

  throw new ForbiddenError(
    'Organizer access is required. Ask an admin to enable your organizer account.',
  );
});

module.exports = {
  requireOrganizerAccess,
};
