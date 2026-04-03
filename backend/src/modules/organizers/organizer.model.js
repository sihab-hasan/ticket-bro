'use strict';
const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  displayName:    { type: String, required: true, trim: true, maxlength: 200 },
  slug:           { type: String, unique: true, lowercase: true, index: true },
  bio:            { type: String, trim: true, maxlength: 2000 },
  logo:           { type: String, trim: true },
  coverImage:     { type: String, trim: true },
  website:        { type: String, trim: true },
  phone:          { type: String, trim: true },
  email:          { type: String, trim: true, lowercase: true },
  socialLinks:    { facebook: String, instagram: String, twitter: String, youtube: String },
  verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified', index: true },
  verificationDoc:{ type: String, trim: true },
  verifiedAt:     { type: Date },
  isActive:       { type: Boolean, default: true, index: true },
  eventCount:     { type: Number, default: 0 },
  totalRevenue:   { type: Number, default: 0 },
  deletedAt:      { type: Date, default: null, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const toSlug = (str) => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

organizerSchema.pre('save', async function() {
  if (!this.isModified('displayName') && this.slug) return;
  let base = toSlug(this.displayName);
  let slug = base;
  let i = 1;
  while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
});

const Organizer = mongoose.model('Organizer', organizerSchema);
module.exports = Organizer;
