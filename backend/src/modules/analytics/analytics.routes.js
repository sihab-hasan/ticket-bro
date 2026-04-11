'use strict';
const express = require('express');
const router = express.Router();
const { requireOrganizerAccess } = require('../../common/middleware/organizerAccess.middleware');
let _c; const c = () => { if (!_c) _c = require('./analytics.controller'); return _c; };

// Organizer analytics (authenticate applied in routes.js)
router.get('/overview',   requireOrganizerAccess, (req,res,next) => c().getOverview(req,res,next));
router.get('/revenue',    requireOrganizerAccess, (req,res,next) => c().getRevenue(req,res,next));
router.get('/tickets',    requireOrganizerAccess, (req,res,next) => c().getTicketStats(req,res,next));
router.get('/events',     requireOrganizerAccess, (req,res,next) => c().getEventStats(req,res,next));
router.get('/events/:id', requireOrganizerAccess, (req,res,next) => c().getEventAnalytics(req,res,next));
router.get('/audience',   requireOrganizerAccess, (req,res,next) => c().getAudience(req,res,next));
module.exports = router;
