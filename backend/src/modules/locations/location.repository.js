'use strict';
const Location = require('./location.model');

class LocationRepository {
  async create(data)      { return new Location(data).save(); }
  async findById(id)      { return Location.findOne({ _id: id, deletedAt: null }).exec(); }
  async search(q, limit=10) {
    const re = new RegExp(q, 'i');
    return Location.find({ deletedAt: null, $or: [{ name: re }, { city: re }, { address: re }] }).limit(limit).lean();
  }
  async findAll({ city, country, page=1, limit=20 }={}) {
    const filter = { deletedAt: null };
    if (city)    filter.city    = new RegExp(city,    'i');
    if (country) filter.country = new RegExp(country, 'i');
    const skip = (Number(page)-1)*Number(limit);
    const [locations, total] = await Promise.all([
      Location.find(filter).sort('name').skip(skip).limit(Number(limit)).lean(),
      Location.countDocuments(filter),
    ]);
    return { locations, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
  async updateById(id, data) { return Location.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec(); }
  async deleteById(id)       { return Location.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec(); }
}
module.exports = new LocationRepository();
