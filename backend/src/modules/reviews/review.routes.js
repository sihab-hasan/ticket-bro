'use strict';
const express = require('express');
const router = express.Router();
const { authenticate, authorize, requireEmailVerified } = require('../../common/middleware/auth.middleware');
const { ROLES } = require('../../common/constants/roles');
let _c; const c = () => { if (!_c) _c = require('./review.controller'); return _c; };

// Public reads
router.get('/event/:slug',         (req,res,next) => c().getEventReviews(req,res,next));
router.get('/event/:slug/summary', (req,res,next) => c().getReviewSummary(req,res,next));

// Auth required
router.post('/',          authenticate, requireEmailVerified, (req,res,next) => c().createReview(req,res,next));
router.get('/my',         authenticate, requireEmailVerified, (req,res,next) => c().getMyReviews(req,res,next));
router.put('/:id',        authenticate, requireEmailVerified, (req,res,next) => c().updateReview(req,res,next));
router.delete('/:id',     authenticate, requireEmailVerified, (req,res,next) => c().deleteReview(req,res,next));
module.exports = router;
