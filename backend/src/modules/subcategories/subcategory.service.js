'use strict';
const subcategoryRepository = require('./subcategory.repository');
const { NotFoundError } = require('../../common/errors/AppError');

class SubcategoryService {
  async getByCategoryId(categoryId) { return subcategoryRepository.findAll(categoryId); }
  async create(data)                { return subcategoryRepository.create(data); }
  async update(id, data)            {
    const s = await subcategoryRepository.updateById(id, data);
    if (!s) throw new NotFoundError('Subcategory not found.');
    return s;
  }
  async remove(id) {
    await subcategoryRepository.deleteById(id);
    return { message: 'Subcategory deleted.' };
  }
}
module.exports = new SubcategoryService();
