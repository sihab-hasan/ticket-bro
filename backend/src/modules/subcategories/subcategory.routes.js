'use strict';
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../common/middleware/auth.middleware');
const { cache } = require('../../common/middleware/cache.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const { ROLES } = require('../../common/constants/roles');
const {
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategorySlugParamsSchema,
  subcategoryListQuerySchema,
} = require('./subcategory.validation');
let _c; const c = () => { if (!_c) _c = require('./subcategory.controller'); return _c; };

router.get('/',       validateRequest(subcategoryListQuerySchema, 'query'), cache('10m'), (req,res,next) => c().getAll(req,res,next));
router.post('/',      authenticate, authorize(ROLES.ADMIN,ROLES.SUPER_ADMIN), validateRequest(createSubcategorySchema), (req,res,next) => c().create(req,res,next));
router.get('/:slug',  validateRequest(subcategorySlugParamsSchema, 'params'), cache('10m'), (req,res,next) => c().getBySlug(req,res,next));
router.put('/:slug',  authenticate, authorize(ROLES.ADMIN,ROLES.SUPER_ADMIN), validateRequest(subcategorySlugParamsSchema, 'params'), validateRequest(updateSubcategorySchema), (req,res,next) => c().update(req,res,next));
router.delete('/:slug',authenticate, authorize(ROLES.ADMIN,ROLES.SUPER_ADMIN), validateRequest(subcategorySlugParamsSchema, 'params'), (req,res,next) => c().remove(req,res,next));
module.exports = router;
