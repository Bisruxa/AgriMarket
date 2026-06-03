const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} = require('../controllers/notifications.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllNotificationsRead);
router.patch('/:key/read', protect, markNotificationRead);
router.delete('/:key', protect, dismissNotification);

module.exports = router;
