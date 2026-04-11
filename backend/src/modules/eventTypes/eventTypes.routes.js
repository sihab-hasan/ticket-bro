// src/modules/eventTypes/eventTypes.routes.js
'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/middleware/auth.middleware');
const { cache }                   = require('../../common/middleware/cache.middleware');
const { validateRequest }         = require('../../common/middleware/validation.middleware');
const { ROLES }                   = require('../../common/constants/roles');
const {
  createEventTypeSchema,
  updateEventTypeSchema,
  eventTypeSlugParamsSchema,
} = require('./eventTypes.validation');

let _c; const c = () => { if (!_c) _c = require('./eventTypes.controller'); return _c; };

// ── Admin read — all including inactive (no cache, auth required) ──────────
router.get('/admin/all', authenticate, authorize(ROLES.SUPER_ADMIN), (req, res, next) => c().getAllAdmin(req, res, next));

// ── Public reads (cached 10 min) ──────────────────────────────────────────
router.get('/',       cache('10m'), (req, res, next) => c().getAll(req, res, next));
router.get('/:slug',  validateRequest(eventTypeSlugParamsSchema, 'params'), cache('10m'), (req, res, next) => c().getBySlug(req, res, next));

// ── Super-admin writes (cache busted inside service) ──────────────────────
router.post('/',        authenticate, authorize(ROLES.SUPER_ADMIN), validateRequest(createEventTypeSchema), (req, res, next) => c().create(req, res, next));
router.put('/:slug',    authenticate, authorize(ROLES.SUPER_ADMIN), validateRequest(eventTypeSlugParamsSchema, 'params'), validateRequest(updateEventTypeSchema), (req, res, next) => c().update(req, res, next));
router.delete('/:slug', authenticate, authorize(ROLES.SUPER_ADMIN), validateRequest(eventTypeSlugParamsSchema, 'params'), (req, res, next) => c().remove(req, res, next));

module.exports = router;
