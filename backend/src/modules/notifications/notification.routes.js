'use strict';
const express = require('express');
const router = express.Router();
let _c; const c = () => { if (!_c) _c = require('./notification.controller'); return _c; };

router.get('/',                       (req,res,next) => c().getNotifications(req,res,next));
router.get('/unread-count',           (req,res,next) => c().getUnreadCount(req,res,next));
router.get('/preferences',            (req,res,next) => c().getPreferences(req,res,next));
router.get('/:id',                    (req,res,next) => c().getNotificationById(req,res,next));
router.put('/preferences',            (req,res,next) => c().updatePreferences(req,res,next));
router.put('/read-all',               (req,res,next) => c().markAllRead(req,res,next));
router.post('/push/subscribe',        (req,res,next) => c().subscribePush(req,res,next));
router.delete('/push/unsubscribe',    (req,res,next) => c().unsubscribePush(req,res,next));
router.put('/:id/read',               (req,res,next) => c().markRead(req,res,next));
router.delete('/:id',                 (req,res,next) => c().deleteNotification(req,res,next));
router.delete('/',                    (req,res,next) => c().clearAll(req,res,next));
module.exports = router;
