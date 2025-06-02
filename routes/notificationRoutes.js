const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/sendPushNotification', notificationController.SendPushNotification);
router.post('/sendBulkNotifications', notificationController.SendBulkNotifications);

module.exports = router;