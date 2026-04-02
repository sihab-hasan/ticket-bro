'use strict';
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  city:    { type: String, trim: true, index: true },
  state:   { type: String, trim: true },
  country: { type: String, trim: true, index: true },
  zipCode: { type: String, trim: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  placeId:  { type: String, trim: true }, // Google Place ID
  timezone: { type: String, trim: true },
  capacity: { type: Number, min: 0 },
  isVirtual:{ type: Boolean, default: false },
  website:  { type: String, trim: true },
  phone:    { type: String, trim: true },
  deletedAt:{ type: Date, default: null },
}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ city: 1, country: 1 });

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
