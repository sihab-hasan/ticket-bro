'use strict';
const express  = require('express');
const router   = express.Router();
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { ROLES } = require('../../common/constants/roles');
const { requireOrganizerAccess } = require('../../common/middleware/organizerAccess.middleware');
const reportRepository= require('./report.repository');
const getId = (u) => u?._id || u?.id;

router.use(authenticate);

router.get('/sales', requireOrganizerAccess,
  asyncHandler(async (req, res) => {
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);
    const organizerId = isAdmin ? req.query.organizerId : getId(req.user);
    const data = await reportRepository.salesReport({ ...req.query, organizerId });
    sendSuccess(res, 'Sales report.', data);
  })
);

router.get('/attendees/:eventId', requireOrganizerAccess,
  asyncHandler(async (req, res) => {
    const data = await reportRepository.attendeesReport(req.params.eventId);
    sendSuccess(res, 'Attendees report.', { attendees: data });
  })
);

module.exports = router;
