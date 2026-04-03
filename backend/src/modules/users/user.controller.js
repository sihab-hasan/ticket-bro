'use strict';

// backend/src/modules/users/user.controller.js

const userService = require('./user.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');

class UserController {

  // ── GET /users/me ────────────────────────────────────────────────────────────
  getMe = asyncHandler(async (req, res) => {
    // req.user is set by the authenticate middleware from routes.js
    const user = await userService.getUserById(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 'Profile fetched successfully.', user);
  });

  // ── PATCH /users/me ──────────────────────────────────────────────────────────
  updateMe = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.user.id || req.user._id || req.user.userId, req.body);
    sendSuccess(res, 'Profile updated successfully.', user);
  });

  // ── DELETE /users/me ─────────────────────────────────────────────────────────
  deleteMe = asyncHandler(async (req, res) => {
    await userService.deactivateUser(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 'Account deactivated successfully.');
  });

  // ── POST /users/me/avatar ────────────────────────────────────────────────────
  uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
    }
    const user = await userService.updateAvatar(req.user.id || req.user._id || req.user.userId, req.file);
    sendSuccess(res, 'Avatar updated successfully.', user);
  });

  // ── DELETE /users/me/avatar ──────────────────────────────────────────────────
  removeAvatar = asyncHandler(async (req, res) => {
    const user = await userService.removeAvatar(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 'Avatar removed successfully.', user);
  });

  // ── GET /users/me/sessions ───────────────────────────────────────────────────
  getMySessions = asyncHandler(async (req, res) => {
    const sessions = await userService.getActiveSessions(req.user.id || req.user._id || req.user.userId);
    sendSuccess(res, 'Sessions fetched successfully.', sessions);
  });

  // ── DELETE /users/me/sessions/:sessionId ─────────────────────────────────────
  revokeSession = asyncHandler(async (req, res) => {
    await userService.revokeSession(
      req.user.id || req.user._id || req.user.userId,
      req.params.sessionId,
    );
    sendSuccess(res, 'Session revoked successfully.');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ══════════════════════════════════════════════════════════════════════════════

  // ── GET /users/stats ─────────────────────────────────────────────────────────
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();
    sendSuccess(res, 'Stats fetched successfully.', stats);
  });

  // ── GET /users ───────────────────────────────────────────────────────────────
  getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    sendSuccess(res, 'Users fetched successfully.', result);
  });

  // ── GET /users/:userId ───────────────────────────────────────────────────────
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.userId, {
      includeInactive: true,
    });
    sendSuccess(res, 'User fetched successfully.', user);
  });

  // ── PATCH /users/:userId ─────────────────────────────────────────────────────
  updateUserById = asyncHandler(async (req, res) => {
    const user = await userService.adminUpdateUser(req.params.userId, req.body);
    sendSuccess(res, 'User updated successfully.', user);
  });

  // ── DELETE /users/:userId ────────────────────────────────────────────────────
  deleteUserById = asyncHandler(async (req, res) => {
    await userService.hardDeleteUser(req.params.userId);
    sendSuccess(res, 'User deleted successfully.');
  });

  // ── PATCH /users/:userId/activate ────────────────────────────────────────────
  activateUser = asyncHandler(async (req, res) => {
    const user = await userService.setUserActive(req.params.userId, true, req.user, req.body.reason);
    sendSuccess(res, 'User activated successfully.', user);
  });

  // ── PATCH /users/:userId/deactivate ──────────────────────────────────────────
  deactivateUser = asyncHandler(async (req, res) => {
    const user = await userService.setUserActive(req.params.userId, false, req.user, req.body.reason);
    sendSuccess(res, 'User deactivated successfully.', user);
  });

  // ── PATCH /users/:userId/role ─────────────────────────────────────────────────
  changeUserRole = asyncHandler(async (req, res) => {
    const user = await userService.changeRole(req.params.userId, req.body.role, req.user);
    sendSuccess(res, 'User role updated successfully.', user);
  });
}

module.exports = new UserController();
