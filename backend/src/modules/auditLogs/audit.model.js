'use strict';
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userEmail:  { type: String, trim: true },
  userRole:   { type: String, trim: true },
  action:     { type: String, required: true, trim: true, index: true },
  resource:   { type: String, trim: true, index: true },
  resourceId: { type: String, trim: true },
  method:     { type: String, trim: true },
  path:       { type: String, trim: true },
  statusCode: { type: Number },
  ipAddress:  { type: String, trim: true },
  userAgent:  { type: String, trim: true },
  body:       { type: mongoose.Schema.Types.Mixed },
  changes:    { type: mongoose.Schema.Types.Mixed },
  metadata:   { type: mongoose.Schema.Types.Mixed },
  duration:   { type: Number },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
// 6-month TTL
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
