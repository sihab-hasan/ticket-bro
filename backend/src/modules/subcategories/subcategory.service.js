'use strict';
const subcategoryRepository = require('./subcategory.repository');
const { invalidateCachePatterns } = require('../../common/middleware/cache.middleware');
const { NotFoundError } = require('../../common/errors/AppError');

const SUBCATEGORY_CACHE_PATTERNS = [
  'http-cache:GET:*/subcategories*',
  'http-cache:GET:*/categories*', // category/:slug/subcategories also needs busting
];

class SubcategoryService {
  async getAll(query = {})          { return subcategoryRepository.findAll(query); }
  async getAllAdmin(query = {})      { return subcategoryRepository.findAllAdmin(query); }
  async getByCategoryId(categoryId) { return subcategoryRepository.findAll({ categoryId }); }

  async getBySlug(slug) {
    const s = await subcategoryRepository.findBySlug(slug);
    if (!s) throw new NotFoundError('Subcategory not found.');
    return s;
  }

  async create(data) {
    const result = await subcategoryRepository.create(data);
    await invalidateCachePatterns(SUBCATEGORY_CACHE_PATTERNS);
    return result;
  }

  async update(slug, data) {
    const s = await subcategoryRepository.updateBySlug(slug, data);
    if (!s) throw new NotFoundError('Subcategory not found.');
    await invalidateCachePatterns(SUBCATEGORY_CACHE_PATTERNS);
    return s;
  }

  async remove(slug) {
    const deleted = await subcategoryRepository.deleteBySlug(slug);
    if (!deleted) throw new NotFoundError('Subcategory not found.');
    await invalidateCachePatterns(SUBCATEGORY_CACHE_PATTERNS);
    return { message: 'Subcategory deleted.' };
  }
}

module.exports = new SubcategoryService();
