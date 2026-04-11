'use strict';
const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/middleware/auth.middleware');
const { cache }                   = require('../../common/middleware/cache.middleware');
const { validateRequest }         = require('../../common/middleware/validation.middleware');
const { ROLES }                   = require('../../common/constants/roles');
const {
  createCategorySchema,
  updateCategorySchema,
  categorySlugParamsSchema,
} = require('./category.validation');

let _c; const c = () => { if (!_c) _c = require('./category.controller'); return _c; };

// ── Admin read — all including inactive (no cache, auth required) ──────────
router.get('/admin/all', authenticate, authorize(ROLES.SUPER_ADMIN), (req, res, next) => c().getAllAdmin(req, res, next));

// ── Public reads (cached 10 min, unauthenticated) ─────────────────────────
router.get('/',       cache('10m'), (req, res, next) => c().getAll(req, res, next));
router.get('/:slug',  validateRequest(categorySlugParamsSchema, 'params'), cache('10m'), (req, res, next) => c().getBySlug(req, res, next));
router.get('/:slug/subcategories', validateRequest(categorySlugParamsSchema, 'params'), cache('10m'), (req, res, next) => c().getSubcategories(req, res, next));

// ── Super-admin writes (cache busted inside service after each mutation) ───
router.post('/',        authenticate, authorize(ROLES.SUPER_ADMIN), validateRequest(createCategorySchema), (req, res, next) => c().create(req, res, next));
router.put('/:slug',    authenticate, authorize(ROLES.SUPER_ADMIN), validateRequest(categorySlugParamsSchema, 'params'), validateRequest(updateCategorySchema), (req, res, next) => c().update(req, res, next));
router.delete('/:slug', authenticate, authorize(ROLES.SUPER_ADMIN), validateRequest(categorySlugParamsSchema, 'params'), (req, res, next) => c().remove(req, res, next));

module.exports = router;
