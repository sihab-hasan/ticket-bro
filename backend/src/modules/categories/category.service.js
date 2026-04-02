'use strict';
const categoryRepository = require('./category.repository');
const { NotFoundError } = require('../../common/errors/AppError');
class CategoryService {
  async getAll()   { return categoryRepository.findAll(); }
  async getBySlug(slug) {
    const c = await categoryRepository.findBySlug(slug);
    if (!c) throw new NotFoundError('Category not found.');
    return c;
  }
  async create(data)      { return categoryRepository.create(data); }
  async update(id, data)  { const c = await categoryRepository.updateById(id, data); if (!c) throw new NotFoundError('Category not found.'); return c; }
  async remove(id)        { const c = await categoryRepository.deleteById(id); if (!c) throw new NotFoundError('Category not found.'); return { message: 'Category deleted.' }; }
}
module.exports = new CategoryService();
