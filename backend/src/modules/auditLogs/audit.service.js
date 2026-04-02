'use strict';
const AuditLog = require('./audit.model');
const logger   = require('../../infrastructure/logger/logger');

class AuditService {
  async log(data) {
    try {
      return await new AuditLog(data).save();
    } catch (err) {
      logger.warn(`Audit log failed: ${err.message}`);
    }
  }

  async findAll({ userId, action, resource, page=1, limit=50, sort='-createdAt' }={}) {
    const filter = {};
    if (userId)   filter.userId   = userId;
    if (action)   filter.action   = action;
    if (resource) filter.resource = resource;
    const skip = (Number(page)-1)*Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      AuditLog.countDocuments(filter),
    ]);
    return { logs, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
}
module.exports = new AuditService();
