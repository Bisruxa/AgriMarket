const { ensureDbConnection } = require('../config/db');
const notificationService = require('../services/notifications.service');

/**
 * GET /api/notifications — sync role-based alerts to DB and return list
 */
exports.getNotifications = async (req, res) => {
  try {
    await ensureDbConnection();
    const data = await notificationService.syncAndList(req.user);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getNotifications error:', error);
    const msg = error.message || '';
    if (msg.includes('Notification model missing')) {
      return res.status(503).json({
        success: false,
        message: msg,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
    });
  }
};

/**
 * PATCH /api/notifications/:key/read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    await ensureDbConnection();
    const { key } = req.params;
    await notificationService.markAsRead(req.user.id, key);
    const data = await notificationService.listNotifications(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('markNotificationRead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await ensureDbConnection();
    await notificationService.markAllAsRead(req.user.id);
    const data = await notificationService.listNotifications(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notifications',
    });
  }
};

/**
 * DELETE /api/notifications/:key — dismiss (remove from DB)
 */
exports.dismissNotification = async (req, res) => {
  try {
    await ensureDbConnection();
    const { key } = req.params;
    await notificationService.dismissNotification(req.user.id, key);
    const data = await notificationService.listNotifications(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('dismissNotification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dismiss notification',
    });
  }
};
