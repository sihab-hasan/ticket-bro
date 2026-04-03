'use strict';

// backend/src/modules/users/user.controller.js

const userService = require('./user.service');

// ── catchAsync ─────────────────────────────────────────────────────────────────
// Inline — avoids dependency on a util we haven't seen.
// If you already have src/common/utils/catchAsync.js, replace with:
//   const catchAsync = require('../../common/utils/catchAsync');
const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── sendSuccess ────────────────────────────────────────────────────────────────
// Matches the response shape used in auth.controller: { status, message, data }
const sendSuccess = (res, statusCode, message, data = undefined) => {
  const body = { status: 'success', message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

class UserController {

  // ── GET /users/me ────────────────────────────────────────────────────────────
  getMe = catchAsync(async (req, res) => {
    // req.user is set by the authenticate middleware from routes.js
    const user = await userService.getUserById(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 200, 'Profile fetched successfully.', user);
  });

  // ── PATCH /users/me ──────────────────────────────────────────────────────────
  updateMe = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.user.id || req.user._id || req.user.userId, req.body);
    sendSuccess(res, 200, 'Profile updated successfully.', user);
  });

  // ── DELETE /users/me ─────────────────────────────────────────────────────────
  deleteMe = catchAsync(async (req, res) => {
    await userService.deactivateUser(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 200, 'Account deactivated successfully.');
  });

  // ── POST /users/me/avatar ────────────────────────────────────────────────────
  uploadAvatar = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
    }
    const user = await userService.updateAvatar(req.user.id || req.user._id || req.user.userId, req.file);
    sendSuccess(res, 200, 'Avatar updated successfully.', user);
  });

  // ── DELETE /users/me/avatar ──────────────────────────────────────────────────
  removeAvatar = catchAsync(async (req, res) => {
    const user = await userService.removeAvatar(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 200, 'Avatar removed successfully.', user);
  });

  // ── GET /users/me/sessions ───────────────────────────────────────────────────
  getMySessions = catchAsync(async (req, res) => {
    const sessions = await userService.getActiveSessions(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 200, 'Sessions fetched successfully.', sessions);
  });

  // ── DELETE /users/me/sessions/:sessionId ─────────────────────────────────────
  revokeSession = catchAsync(async (req, res) => {
    await userService.revokeSession(
      req.user.id || req.user._id || req.user.userId,
      req.params.sessionId,
    );
    sendSuccess(res, 200, 'Session revoked successfully.');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ══════════════════════════════════════════════════════════════════════════════

  // ── GET /users/stats ─────────────────────────────────────────────────────────
  getUserStats = catchAsync(async (req, res) => {
    const stats = await userService.getUserStats();
    sendSuccess(res, 200, 'Stats fetched successfully.', stats);
  });

  // ── GET /users ───────────────────────────────────────────────────────────────
  getAllUsers = catchAsync(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    sendSuccess(res, 200, 'Users fetched successfully.', result);
  });

  // ── GET /users/:userId ───────────────────────────────────────────────────────
  getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId, {
      includeInactive: true,
    });
    sendSuccess(res, 200, 'User fetched successfully.', user);
  });

  // ── PATCH /users/:userId ─────────────────────────────────────────────────────
  updateUserById = catchAsync(async (req, res) => {
    const user = await userService.adminUpdateUser(req.params.userId, req.body);
    sendSuccess(res, 200, 'User updated successfully.', user);
  });

  // ── DELETE /users/:userId ────────────────────────────────────────────────────
  deleteUserById = catchAsync(async (req, res) => {
    await userService.hardDeleteUser(req.params.userId);
    sendSuccess(res, 200, 'User deleted successfully.');
  });

  // ── PATCH /users/:userId/activate ────────────────────────────────────────────
  activateUser = catchAsync(async (req, res) => {
    const user = await userService.setUserActive(req.params.userId, true, req.user, req.body.reason);
    sendSuccess(res, 200, 'User activated successfully.', user);
  });

  // ── PATCH /users/:userId/deactivate ──────────────────────────────────────────
  deactivateUser = catchAsync(async (req, res) => {
    const user = await userService.setUserActive(req.params.userId, false, req.user, req.body.reason);
    sendSuccess(res, 200, 'User deactivated successfully.', user);
  });

  // ── PATCH /users/:userId/role ─────────────────────────────────────────────────
  changeUserRole = catchAsync(async (req, res) => {
    const user = await userService.changeRole(req.params.userId, req.body.role, req.user);
    sendSuccess(res, 200, 'User role updated successfully.', user);
  });
}

module.exports = new UserController();
