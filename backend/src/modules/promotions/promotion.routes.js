'use strict';
const express = require('express');
const router = express.Router();
const { authenticate } = require('../../common/middleware/auth.middleware');
const { requireOrganizerAccess } = require('../../common/middleware/organizerAccess.middleware');
let _c; const c = () => { if (!_c) _c = require('./promotion.controller'); return _c; };

router.post('/validate',      authenticate, (req,res,next) => c().validateCode(req,res,next));
router.post('/organizer',     authenticate, requireOrganizerAccess, (req,res,next) => c().create(req,res,next));
router.get('/organizer',      authenticate, requireOrganizerAccess, (req,res,next) => c().getMyPromotions(req,res,next));
router.put('/organizer/:id',  authenticate, requireOrganizerAccess, (req,res,next) => c().update(req,res,next));
router.delete('/organizer/:id',authenticate, requireOrganizerAccess, (req,res,next) => c().remove(req,res,next));
module.exports = router;
