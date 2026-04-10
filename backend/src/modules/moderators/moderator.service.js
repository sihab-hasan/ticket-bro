'use strict';

const User = require('../users/user.model');
const Event = require('../events/event.model');
const Report = require('../reports/report.model');
const AuditLog = require('../auditLogs/audit.model');
const userService = require('../users/user.service');
const notificationService = require('../notifications/notification.service');
const { ROLES, normalizeRole } = require('../../common/constants/roles');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../../common/errors/AppError');
const { socketEvents } = require('../../infrastructure/websocket/socketEvents');

const getId = (user) => user?.id || user?._id?.toString() || user?.userId?.toString();

class ModeratorService {
  async getDashboard() {
    const [openReports, pendingEvents, suspendedUsers, warningCount] = await Promise.all([
      Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      Event.countDocuments({ deletedAt: null, status: 'pending' }),
      User.countDocuments({ deletedAt: null, status: 'suspended' }),
      AuditLog.countDocuments({ action: 'user.warned' }),
    ]);

    return {
      openReports,
      pendingEvents,
      suspendedUsers,
      warningsIssued: warningCount,
    };
  }

  async getUsers({ page = 1, limit = 20, search, status } = {}) {
    const filter = { deletedAt: null };
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email avatar role status statusReason statusUpdatedAt createdAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async suspendUser(moderator, targetUserId, reason) {
    if (!reason) {
      throw new BadRequestError('Reason is required.');
    }

    const target = await User.findOne({ _id: targetUserId, deletedAt: null }).lean();
    if (!target) {
      throw new NotFoundError('User not found.');
    }

    if ([ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(normalizeRole(target.role))) {
      throw new ForbiddenError('Moderators cannot suspend staff members.');
    }

    return userService.setUserStatus(targetUserId, 'suspended', moderator, reason);
  }

  async unsuspendUser(moderator, targetUserId) {
    return userService.setUserStatus(targetUserId, 'active', moderator);
  }

  async warnUser(moderator, targetUserId, warning) {
    if (!warning) {
      throw new BadRequestError('Warning message is required.');
    }

    const target = await User.findOne({ _id: targetUserId, deletedAt: null }).lean();
    if (!target) {
      throw new NotFoundError('User not found.');
    }

    await AuditLog.create({
      userId: getId(moderator),
      userEmail: moderator.email,
      userRole: moderator.role,
      action: 'user.warned',
      resource: 'user',
      resourceId: targetUserId,
      metadata: {
        targetUserId,
        warning,
      },
    });

    return { targetUserId, warning };
  }

  async getReportsQueue({ page = 1, limit = 20, status, entityType, search } = {}) {
    const filter = {};
    // Allow filtering by status; default to open/under_review if not provided
    if (status) filter.status = status;
    if (!status) filter.status = { $in: ['open', 'under_review'] };
    // Filter by entity type (e.g. user, event, review)
    if (entityType) filter.entityType = entityType;

    /**
     * Allow searching within reports by reason, description, or target title.
     * The frontend passes a `search` query param when filtering reports.
     * If provided, apply a case-insensitive regex on multiple fields.
     */
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { description: re },
        { reason: re },
        { targetTitle: re },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reportedBy', 'firstName lastName email')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Report.countDocuments(filter),
    ]);

    return {
      reports: reports.map((report) => ({
        ...report,
        type: report.entityType,
        reporter: report.reportedBy,
        targetId: report.entityId,
        priority:
          report.reason === 'fraud'
            ? 'high'
            : ['spam', 'fake', 'misleading'].includes(report.reason)
            ? 'medium'
            : 'low',
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async resolveReport(moderator, reportId, resolution) {
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status: resolution.status || 'resolved',
          reviewedBy: getId(moderator),
          reviewedAt: new Date(),
          resolution: resolution.decision || resolution.status || 'resolved',
          resolutionNote: resolution.note || null,
          actionTaken: resolution.action || 'none',
        },
      },
      { new: true },
    ).lean();

    if (!report) {
      throw new NotFoundError('Report not found.');
    }

    // Emit real-time report resolved event to moderators
    try {
      const moderators = await User.find({ role: 'moderator', deletedAt: null })
        .select('_id')
        .lean();
      const moderatorIds = moderators.map(m => getId(m));
      socketEvents.emitModeratorReportResolved(moderatorIds, reportId, resolution);
    } catch (err) {
      console.warn('Failed to emit report socket events', { err: err.message });
    }

    return report;
  }

  async getPendingEvents({ page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find({ deletedAt: null, status: 'pending' })
        .populate('organizer', 'firstName lastName email avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Event.countDocuments({ deletedAt: null, status: 'pending' }),
    ]);

    return {
      events,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async approveEvent(moderator, eventId) {
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          status: 'published',
          publishedAt: new Date(),
          moderatedBy: getId(moderator),
          moderatedAt: new Date(),
          rejectionReason: '',
        },
      },
      { new: true },
    )
      .populate('organizer', 'firstName lastName email avatar')
      .lean({ virtuals: true });

    if (!event) {
      throw new NotFoundError('Event not found.');
    }

    // Notify the event organizer that their event has been approved
    try {
      await notificationService.notify(event.organizer, {
        type: 'event.approved',
        title: 'Event Approved',
        message: `Your event "${event.title}" has been approved and published.`,
        data: { eventId: event._id?.toString(), slug: event.slug },
        link: `/events/${event.slug}`,
      });
      
      // Emit real-time event to organizer
      const organizerId = event.organizer?._id || event.organizer;
      if (organizerId) {
        socketEvents.emitOrganizerDashboardUpdate(organizerId, {
          eventApproved: true,
          eventId: event._id,
          slug: event.slug,
        });
      }
    } catch (err) {
      // Swallow notification errors to not block moderation flow
    }

    return event;
  }

  async rejectEvent(moderator, eventId, reason) {
    if (!reason) {
      throw new BadRequestError('Rejection reason is required.');
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason,
          moderatedBy: getId(moderator),
          moderatedAt: new Date(),
        },
      },
      { new: true },
    )
      .populate('organizer', 'firstName lastName email avatar')
      .lean({ virtuals: true });

    if (!event) {
      throw new NotFoundError('Event not found.');
    }

    // Notify the event organizer that their event has been rejected
    try {
      await notificationService.notify(event.organizer, {
        type: 'event.rejected',
        title: 'Event Rejected',
        message: `Your event "${event.title}" has been rejected.`,
        data: { eventId: event._id?.toString(), slug: event.slug, reason },
        link: `/events/${event.slug}`,
      });
      
      // Emit real-time event to organizer
      const organizerId = event.organizer?._id || event.organizer;
      if (organizerId) {
        socketEvents.emitOrganizerDashboardUpdate(organizerId, {
          eventRejected: true,
          eventId: event._id,
          slug: event.slug,
          reason,
        });
      }
    } catch (err) {
      // Do not block rejection flow on notification errors
    }

    return event;
  }
}

module.exports = new ModeratorService();
