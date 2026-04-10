'use strict';
const asyncHandler          = require('../../common/utils/asyncHandler');
const { sendSuccess }       = require('../../common/utils/apiResponse');
const notificationService   = require('./notification.service');
const notificationsConfig   = require('../../config/notifications.config');
const getId = (u) => u?._id || u?.id || u?.userId;

class NotificationController {
  getNotifications = asyncHandler(async (req, res) => { sendSuccess(res, 'Notifications fetched.', await notificationService.getNotifications(getId(req.user), req.query)); });
  getNotificationById = asyncHandler(async (req, res) => { sendSuccess(res, 'Notification fetched.', await notificationService.getNotificationById(req.params.id, req.user)); });
  getUnreadCount   = asyncHandler(async (req, res) => { sendSuccess(res, 'Unread count.', await notificationService.getUnreadCount(getId(req.user))); });
  getPreferences   = asyncHandler(async (req, res) => { sendSuccess(res, 'Preferences fetched.', await notificationService.getPreferences(getId(req.user))); });
  updatePreferences= asyncHandler(async (req, res) => { sendSuccess(res, 'Preferences updated.', await notificationService.updatePreferences(getId(req.user), req.body)); });
  markAllRead      = asyncHandler(async (req, res) => { sendSuccess(res, 'Marked all read.', await notificationService.markAllRead(getId(req.user))); });
  markRead         = asyncHandler(async (req, res) => { sendSuccess(res, 'Marked as read.', { notification: await notificationService.markRead(req.params.id, req.user) }); });
  deleteNotification= asyncHandler(async (req, res) => { sendSuccess(res, 'Deleted.', await notificationService.deleteNotification(req.params.id, getId(req.user))); });
  clearAll         = asyncHandler(async (req, res) => { sendSuccess(res, 'Cleared.', await notificationService.clearAll(getId(req.user))); });
  subscribePush    = asyncHandler(async (req, res) => { sendSuccess(res, 'Subscribed.', await notificationService.subscribePush(getId(req.user), req.body)); });
  unsubscribePush  = asyncHandler(async (req, res) => { sendSuccess(res, 'Unsubscribed.', await notificationService.unsubscribePush(getId(req.user), req.query.endpoint)); });
  getVapidKey      = asyncHandler(async (req, res) => { sendSuccess(res, 'VAPID key.', { publicKey: notificationsConfig.VAPID_PUBLIC_KEY }); });
}
module.exports = new NotificationController();
