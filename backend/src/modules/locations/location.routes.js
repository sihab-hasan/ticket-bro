'use strict';
const express = require('express');
const router = express.Router();
const { cache } = require('../../common/middleware/cache.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const { reverseLocationQuerySchema } = require('./location.validation');
let _c; const c = () => { if (!_c) _c = require('./location.controller'); return _c; };

router.get('/',           cache('10m'), (req,res,next) => c().getAll(req,res,next));
router.get('/cities',     cache('10m'), (req,res,next) => c().getCities(req,res,next));
router.get('/countries',  cache('10m'), (req,res,next) => c().getCountries(req,res,next));
router.get('/reverse',    validateRequest(reverseLocationQuerySchema, 'query'), (req,res,next) => c().reverseGeocode(req,res,next));
router.get('/:slug',      cache('5m'),  (req,res,next) => c().getBySlug(req,res,next));
module.exports = router;
