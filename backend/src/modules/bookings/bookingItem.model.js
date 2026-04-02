'use strict';
// BookingItem is embedded in the Booking document as booking.items[]
// This module re-exports the schema for use in other modules needing the sub-doc shape.
const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  ticketTypeId:   { type: mongoose.Schema.Types.ObjectId },
  ticketTypeName: { type: String },
  quantity:       { type: Number, min: 1 },
  unitPrice:      { type: Number, min: 0 },
  totalPrice:     { type: Number, min: 0 },
  seats:          [{ section: String, row: String, number: String }],
  attendees:      [{ firstName: String, lastName: String, email: String, phone: String }],
});

module.exports = bookingItemSchema;
