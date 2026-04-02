'use strict';
const AuditLog = require('./audit.model');
class AuditRepository {
  async create(data) { return new AuditLog(data).save(); }
  async findAll(filter={}, page=1, limit=50) {
    const skip=(Number(page)-1)*Number(limit);
    const [logs,total]=await Promise.all([AuditLog.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(), AuditLog.countDocuments(filter)]);
    return { logs, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
}
module.exports = new AuditRepository();
