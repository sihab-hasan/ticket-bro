'use strict';
const express = require('express');
const router = express.Router();
const { requireOrganizerAccess } = require('../../common/middleware/organizerAccess.middleware');

// authenticate is applied in routes.js before mount
let _c; const c = () => { if (!_c) _c = require('./booking.controller'); return _c; };

// ── User routes ──
router.post('/',                          (req,res,next) => c().createBooking(req,res,next));
router.get('/',                           (req,res,next) => c().getMyBookings(req,res,next));
router.get('/:ref',                       (req,res,next) => c().getBookingByRef(req,res,next));
router.post('/:ref/cancel',               (req,res,next) => c().cancelBooking(req,res,next));
router.post('/:ref/refund',               (req,res,next) => c().requestRefund(req,res,next));
router.get('/:ref/tickets',               (req,res,next) => c().getBookingTickets(req,res,next));
router.get('/:ref/invoice',               (req,res,next) => c().getInvoice(req,res,next));

// ── Organizer routes ──
router.get('/organizer/all',
  requireOrganizerAccess,
  (req,res,next) => c().getOrganizerBookings(req,res,next));
router.post('/organizer/:ref/checkin',
  requireOrganizerAccess,
  (req,res,next) => c().checkIn(req,res,next));

module.exports = router;
