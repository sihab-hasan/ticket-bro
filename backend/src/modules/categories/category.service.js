'use strict';
const categoryRepository    = require('./category.repository');
const subcategoryRepository = require('../subcategories/subcategory.repository');
const { invalidateCachePatterns } = require('../../common/middleware/cache.middleware');
const { NotFoundError } = require('../../common/errors/AppError');

// Cache key patterns that must be busted whenever categories change
const CATEGORY_CACHE_PATTERNS = [
  'http-cache:GET:*/categories*',
  'http-cache:GET:*/subcategories*',
];

class CategoryService {
  // Public: active only (browse pages, events)
  async getAll()          { return categoryRepository.findAll(); }
  // Admin: all non-deleted (super-admin management page)
  async getAllAdmin()      { return categoryRepository.findAllAdmin(); }

  async getBySlug(slug) {
    const c = await categoryRepository.findBySlug(slug);
    if (!c) throw new NotFoundError('Category not found.');
    return c;
  }

  async getSubcategories(slug) {
    const category = await this.getBySlug(slug);
    const subcategories = await subcategoryRepository.findAll({ categoryId: category._id });
    return { category, subcategories };
  }

  async create(data) {
    const result = await categoryRepository.create(data);
    await invalidateCachePatterns(CATEGORY_CACHE_PATTERNS);
    return result;
  }

  async update(slug, data) {
    const c = await categoryRepository.updateBySlug(slug, data);
    if (!c) throw new NotFoundError('Category not found.');
    await invalidateCachePatterns(CATEGORY_CACHE_PATTERNS);
    return c;
  }

  async remove(slug) {
    const c = await categoryRepository.deleteBySlug(slug);
    if (!c) throw new NotFoundError('Category not found.');
    await invalidateCachePatterns(CATEGORY_CACHE_PATTERNS);
    return { message: 'Category deleted.' };
  }
}

module.exports = new CategoryService();
