'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const categoryService = require('./category.service');

class CategoryController {
  // Public list — active only, cached
  getAll = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Categories fetched.', { categories: await categoryService.getAll() });
  });

  // Admin list — all (including inactive), bypasses cache (auth header triggers cache skip)
  getAllAdmin = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Categories fetched.', { categories: await categoryService.getAllAdmin() });
  });

  getBySlug = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Category fetched.', { category: await categoryService.getBySlug(req.params.slug) });
  });

  getSubcategories = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Category subcategories fetched.', await categoryService.getSubcategories(req.params.slug));
  });

  create = asyncHandler(async (req, res) => {
    sendCreated(res, 'Category created.', { category: await categoryService.create(req.body) });
  });

  update = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Category updated.', { category: await categoryService.update(req.params.slug, req.body) });
  });

  remove = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Deleted.', await categoryService.remove(req.params.slug));
  });
}

module.exports = new CategoryController();
