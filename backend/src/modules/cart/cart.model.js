'use strict';
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  event:          { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketType:     { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
  ticketTypeName: { type: String, trim: true },
  quantity:       { type: Number, required: true, min: 1, max: 20 },
  unitPrice:      { type: Number, required: true, min: 0 },
  totalPrice:     { type: Number, required: true, min: 0 },
}, { _id: true, timestamps: true });

const cartSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items:     [cartItemSchema],
  promoCode:      { type: String, trim: true, uppercase: true },
  promoId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
  discountAmount: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date, index: { expireAfterSeconds: 0 }, default: () => new Date(Date.now() + 2*60*60*1000) }, // 2h TTL
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((s, i) => s + i.totalPrice, 0);
});
cartSchema.virtual('total').get(function () {
  return Math.max(0, this.subtotal - (this.discountAmount || 0));
});
cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((s, i) => s + i.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
