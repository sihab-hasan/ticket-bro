'use strict';
const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  icon:      { type: String, trim: true },
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const EventType = mongoose.models.EventType || mongoose.model('EventType', eventTypeSchema);

class EventTypeRepository {
  async findAll()     { return EventType.find({ isActive: true }).sort('sortOrder').lean(); }
  async create(data)  { return new EventType(data).save(); }
  async updateById(id, data) { return EventType.findByIdAndUpdate(id, { $set: data }, { new: true }).exec(); }
  async deleteById(id)       { return EventType.findByIdAndDelete(id).exec(); }
}
module.exports = new EventTypeRepository();
