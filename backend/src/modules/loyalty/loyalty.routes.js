'use strict';
const express  = require('express');
const router   = express.Router();
const loyaltyController = require('./loyalty.controller');
const { authenticate }  = require('../auth/auth.middleware');
const { authorize }     = require('../../common/middleware/rbac.middleware');
const { ROLES }         = require('../../common/constants/roles');

router.use(authenticate);

router.get( '/',              loyaltyController.getStatus);
router.get( '/history',       loyaltyController.getHistory);
router.post('/redeem',         loyaltyController.redeem);
router.get( '/tiers',         loyaltyController.getTiers);
router.get( '/leaderboard',   loyaltyController.getLeaderboard);

// Admin
router.post('/:userId/award',  authorize([ROLES.ADMIN, ROLES.SUPER_ADMIN]), loyaltyController.awardPoints);
router.post('/:userId/deduct', authorize([ROLES.ADMIN, ROLES.SUPER_ADMIN]), loyaltyController.deductPoints);

module.exports = router;
