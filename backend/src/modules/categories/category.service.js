'use strict';
const categoryRepository = require('./category.repository');
const subcategoryRepository = require('../subcategories/subcategory.repository');
const { NotFoundError } = require('../../common/errors/AppError');
class CategoryService {
  async getAll()   { return categoryRepository.findAll(); }
  async getBySlug(slug) {
    const c = await categoryRepository.findBySlug(slug);
    if (!c) throw new NotFoundError('Category not found.');
    return c;
  }
  async getSubcategories(slug) {
    const category = await this.getBySlug(slug);
    const subcategories = await subcategoryRepository.findAll({ categoryId: category._id });
    return {
      category,
      subcategories,
    };
  }
  async create(data)      { return categoryRepository.create(data); }
  async update(slug, data)  { const c = await categoryRepository.updateBySlug(slug, data); if (!c) throw new NotFoundError('Category not found.'); return c; }
  async remove(slug)        { const c = await categoryRepository.deleteBySlug(slug); if (!c) throw new NotFoundError('Category not found.'); return { message: 'Category deleted.' }; }
}
module.exports = new CategoryService();
