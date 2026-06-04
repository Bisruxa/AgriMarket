const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getPendingTraders,
  approveTrader,
  rejectTrader,
  getStatistics,
  getTraderDetails,
  getSystemHealth,
  getSystemSettings,
  updateSystemSettings,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard & Statistics
router.get('/stats', getStatistics);
router.get('/system/health', getSystemHealth);
router.get('/system/settings', getSystemSettings);
router.put('/system/settings', updateSystemSettings);

// User management
router.get('/users', getAllUsers);

// Trader management
router.get('/traders/pending', getPendingTraders);
router.get('/traders/:id', getTraderDetails);
router.put('/traders/:id/approve', approveTrader);
router.put('/traders/:id/reject', rejectTrader);

module.exports = router;
