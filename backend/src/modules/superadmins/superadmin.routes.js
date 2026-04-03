'use strict';

const express = require('express');
const controller = require('./superadmin.controller');
const {
  authenticate,
  authorize,
} = require('../../common/middleware/auth.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/dashboard', controller.getDashboard);
router.get('/admins', controller.getAllAdmins);
router.get('/users', controller.getAllUsers);
router.post('/admins/:userId/assign', controller.assignAdminRole);
router.delete('/admins/:userId/revoke', controller.revokeAdminRole);
router.patch('/users/:userId/role', controller.updateUserRole);

router.get('/settings', controller.getPlatformSettings);
router.put('/settings', controller.updatePlatformSettings);
router.get('/audit-logs', controller.getFullAuditLog);
router.post('/force-logout-all', controller.forceLogoutAll);
router.get('/health', controller.getSystemHealth);

module.exports = router;
