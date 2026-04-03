'use strict';
const subcategoryRepository = require('./subcategory.repository');
const { NotFoundError } = require('../../common/errors/AppError');

class SubcategoryService {
  async getAll(query = {})          { return subcategoryRepository.findAll(query); }
  async getByCategoryId(categoryId) { return subcategoryRepository.findAll({ categoryId }); }
  async getBySlug(slug) {
    const s = await subcategoryRepository.findBySlug(slug);
    if (!s) throw new NotFoundError('Subcategory not found.');
    return s;
  }
  async create(data)                { return subcategoryRepository.create(data); }
  async update(slug, data)          {
    const s = await subcategoryRepository.updateBySlug(slug, data);
    if (!s) throw new NotFoundError('Subcategory not found.');
    return s;
  }
  async remove(slug) {
    const deleted = await subcategoryRepository.deleteBySlug(slug);
    if (!deleted) throw new NotFoundError('Subcategory not found.');
    return { message: 'Subcategory deleted.' };
  }
}
module.exports = new SubcategoryService();
