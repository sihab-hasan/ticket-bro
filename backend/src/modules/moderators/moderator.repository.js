'use strict';
const User = require('../users/user.model');
class ModeratorRepository {
  async findAll() { return User.find({ role: 'moderator', deletedAt: null }).select('-password').lean(); }
  async findById(id) { return User.findOne({ _id: id, role: 'moderator', deletedAt: null }).select('-password').exec(); }
}
module.exports = new ModeratorRepository();
