'use strict';
const express = require('express');
const router = express.Router();
const { requireOrganizerAccess } = require('../../common/middleware/organizerAccess.middleware');
let _c; const c = () => { if (!_c) _c = require('./ticket.controller'); return _c; };

router.get('/',                    (req,res,next) => c().getMyTickets(req,res,next));
router.get('/:code',               (req,res,next) => c().getTicketByCode(req,res,next));
router.get('/:code/download',      (req,res,next) => c().downloadTicket(req,res,next));
router.post('/:code/validate',
  requireOrganizerAccess,
  (req,res,next) => c().validateTicket(req,res,next));
router.post('/:code/transfer',     (req,res,next) => c().transferTicket(req,res,next));
router.post('/:code/cancel',       (req,res,next) => c().cancelTicket(req,res,next));
module.exports = router;
