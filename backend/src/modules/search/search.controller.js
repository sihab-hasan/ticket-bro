'use strict';
const asyncHandler  = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const searchService = require('./search.service');

class SearchController {
  search         = asyncHandler(async (req, res) => { sendSuccess(res, 'Search results.', await searchService.search(req.query)); });
  autocomplete   = asyncHandler(async (req, res) => { sendSuccess(res, 'Suggestions.', await searchService.autocomplete(req.query.q)); });
  getTrending    = asyncHandler(async (req, res) => { sendSuccess(res, 'Trending events.', await searchService.getTrending()); });
  getNearby      = asyncHandler(async (req, res) => { sendSuccess(res, 'Nearby events.', await searchService.getNearby(req.query)); });
  getFacets      = asyncHandler(async (req, res) => { sendSuccess(res, 'Search facets.', await searchService.getFacets()); });
  reindex        = asyncHandler(async (req, res) => { sendSuccess(res, 'Reindex started.', await searchService.reindex()); });
  reindexEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Reindexed.', await searchService.reindexEvent(req.params.id)); });
  removeFromIndex= asyncHandler(async (req, res) => { sendSuccess(res, 'Removed.', await searchService.removeFromIndex(req.params.id)); });
}
module.exports = new SearchController();
