'use strict';
const tagRepository = require('./tag.repository');
class TagService {
  async getPopularTags(limit=50) { return tagRepository.findPopular(limit); }
}
module.exports = new TagService();
