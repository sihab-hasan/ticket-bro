'use strict';
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../common/middleware/auth.middleware');
const { cache } = require('../../common/middleware/cache.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const { ROLES } = require('../../common/constants/roles');
const {
  searchQuerySchema,
  autocompleteQuerySchema,
  nearbyQuerySchema,
  facetsQuerySchema,
} = require('./search.validation');

let _c; const c = () => { if (!_c) _c = require('./search.controller'); return _c; };

router.get('/',              validateRequest(searchQuerySchema, 'query'), (req,res,next) => c().search(req,res,next));
router.get('/autocomplete',  validateRequest(autocompleteQuerySchema, 'query'), (req,res,next) => c().autocomplete(req,res,next));
router.get('/trending',      cache('5m'), (req,res,next) => c().getTrending(req,res,next));
router.get('/nearby',        validateRequest(nearbyQuerySchema, 'query'), (req,res,next) => c().getNearby(req,res,next));
router.get('/facets',        validateRequest(facetsQuerySchema, 'query'), cache('2m'), (req,res,next) => c().getFacets(req,res,next));
router.post('/reindex',      authenticate, authorize(ROLES.ADMIN,ROLES.SUPER_ADMIN), (req,res,next) => c().reindex(req,res,next));
router.post('/reindex/:id',  authenticate, authorize(ROLES.ADMIN,ROLES.SUPER_ADMIN), (req,res,next) => c().reindexEvent(req,res,next));
router.delete('/index/:id',  authenticate, authorize(ROLES.ADMIN,ROLES.SUPER_ADMIN), (req,res,next) => c().removeFromIndex(req,res,next));
module.exports = router;
