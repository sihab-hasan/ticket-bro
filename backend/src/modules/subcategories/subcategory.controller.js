'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const subcategoryService = require('./subcategory.service');

class SubcategoryController {
  // Public: active only (cached via route)
  getAll = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Subcategories fetched.', { subcategories: await subcategoryService.getAll(req.query) });
  });

  // Admin: all including inactive (auth header bypasses cache automatically)
  getAllAdmin = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Subcategories fetched.', { subcategories: await subcategoryService.getAllAdmin(req.query) });
  });

  getBySlug = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Subcategory fetched.', { subcategory: await subcategoryService.getBySlug(req.params.slug) });
  });

  create = asyncHandler(async (req, res) => {
    sendCreated(res, 'Subcategory created.', { subcategory: await subcategoryService.create(req.body) });
  });

  update = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Subcategory updated.', { subcategory: await subcategoryService.update(req.params.slug, req.body) });
  });

  remove = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Subcategory deleted.', await subcategoryService.remove(req.params.slug));
  });
}

module.exports = new SubcategoryController();
