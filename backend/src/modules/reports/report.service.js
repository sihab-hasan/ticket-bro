'use strict';
const { BadRequestError } = require('../../common/errors/AppError');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class ReportService {
  async createReport(data, user) {
    // Placeholder - store in DB
    return { ...data, reporter: getId(user), status: 'pending', createdAt: new Date() };
  }
  async getReports(query={}) { return { reports: [], pagination: { total: 0 } }; }
  async resolveReport(id, data, adminUser) { return { id, ...data, resolvedBy: getId(adminUser), resolvedAt: new Date() }; }
}
module.exports = new ReportService();
