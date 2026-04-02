'use strict';
const express    = require('express');
const router     = express.Router();
const payoutController = require('./payout.controller');
const { authenticate } = require('../auth/auth.middleware');
const { authorize }    = require('../../common/middleware/rbac.middleware');
const { ROLES }        = require('../../common/constants/roles');

// Organizer routes
router.use(authenticate);

router.get(  '/',                     authorize([ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), payoutController.getPayouts);
router.post( '/request',              authorize([ROLES.ORGANIZER]), payoutController.requestPayout);
router.get(  '/balance',              authorize([ROLES.ORGANIZER]), payoutController.getBalance);
router.get(  '/history',              authorize([ROLES.ORGANIZER]), payoutController.getHistory);
router.get(  '/bank-accounts',        authorize([ROLES.ORGANIZER]), payoutController.getBankAccounts);
router.post( '/bank-accounts',        authorize([ROLES.ORGANIZER]), payoutController.addBankAccount);
router.delete('/bank-accounts/:id',   authorize([ROLES.ORGANIZER]), payoutController.removeBankAccount);
router.get(  '/:id',                  authorize([ROLES.ORGANIZER, ROLES.ADMIN]), payoutController.getPayoutById);

// Admin routes
router.patch('/:id/approve',  authorize([ROLES.ADMIN, ROLES.SUPER_ADMIN]), payoutController.approvePayout);
router.patch('/:id/reject',   authorize([ROLES.ADMIN, ROLES.SUPER_ADMIN]), payoutController.rejectPayout);
router.patch('/:id/process',  authorize([ROLES.ADMIN, ROLES.SUPER_ADMIN]), payoutController.processPayout);

module.exports = router;
