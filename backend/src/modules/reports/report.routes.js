'use strict';
const express  = require('express');
const router   = express.Router();
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const { authenticate }= require('../auth/auth.middleware');
const { authorize }   = require('../../common/middleware/rbac.middleware');
const { ROLES }       = require('../../common/constants/roles');
const reportRepository= require('./report.repository');
const getId = (u) => u?._id || u?.id;

router.use(authenticate);

router.get('/sales', authorize([ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  asyncHandler(async (req, res) => {
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);
    const organizerId = isAdmin ? req.query.organizerId : getId(req.user);
    const data = await reportRepository.salesReport({ ...req.query, organizerId });
    sendSuccess(res, 'Sales report.', data);
  })
);

router.get('/attendees/:eventId', authorize([ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  asyncHandler(async (req, res) => {
    const data = await reportRepository.attendeesReport(req.params.eventId);
    sendSuccess(res, 'Attendees report.', { attendees: data });
  })
);

module.exports = router;
