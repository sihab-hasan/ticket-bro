'use strict';
const asyncHandler      = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const categoryService   = require('./category.service');

class CategoryController {
  getAll    = asyncHandler(async (req, res) => { sendSuccess(res, 'Categories fetched.', { categories: await categoryService.getAll() }); });
  getBySlug = asyncHandler(async (req, res) => { sendSuccess(res, 'Category fetched.', { category: await categoryService.getBySlug(req.params.slug) }); });
  create    = asyncHandler(async (req, res) => { sendCreated(res, 'Category created.', { category: await categoryService.create(req.body) }); });
  update    = asyncHandler(async (req, res) => { sendSuccess(res, 'Category updated.', { category: await categoryService.update(req.params.id, req.body) }); });
  remove    = asyncHandler(async (req, res) => { sendSuccess(res, 'Deleted.', await categoryService.remove(req.params.id)); });
}
module.exports = new CategoryController();
