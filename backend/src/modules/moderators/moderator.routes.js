'use strict';

const express = require('express');
const controller = require('./moderator.controller');
const {
  authenticate,
  authorize,
  requirePermission,
} = require('../../common/middleware/auth.middleware');
const { ROLES } = require('../../common/constants/roles');
const { PERMISSIONS } = require('../../common/constants/permissions');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.getUsers);

router.post(
  '/users/:userId/suspend',
  requirePermission(PERMISSIONS.USER_BLOCK),
  controller.suspendUser,
);
router.post(
  '/users/:userId/unsuspend',
  requirePermission(PERMISSIONS.USER_BLOCK),
  controller.unsuspendUser,
);
router.post(
  '/users/:userId/warn',
  requirePermission(PERMISSIONS.REPORT_UPDATE),
  controller.warnUser,
);

router.get(
  '/reports',
  requirePermission(PERMISSIONS.REPORT_READ),
  controller.getReportsQueue,
);
router.put(
  '/reports/:reportId/resolve',
  requirePermission(PERMISSIONS.REPORT_RESOLVE),
  controller.resolveReport,
);

router.get(
  '/events/pending',
  requirePermission(PERMISSIONS.EVENT_APPROVE),
  controller.getPendingEvents,
);
router.post(
  '/events/:eventId/approve',
  requirePermission(PERMISSIONS.EVENT_APPROVE),
  controller.approveEvent,
);
router.post(
  '/events/:eventId/reject',
  requirePermission(PERMISSIONS.EVENT_REJECT),
  controller.rejectEvent,
);

module.exports = router;
