const express = require('express');
const router = express.Router();
const {
  getMyFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmsByFarmer
} = require('../controllers/farm.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Farmer routes - only farmers can manage their farms
router.get('/', authorize('FARMER'), getMyFarms);
router.post('/', authorize('FARMER'), createFarm);
router.get('/:id', authorize('FARMER', 'ADMIN'), getFarm);
router.put('/:id', authorize('FARMER', 'ADMIN'), updateFarm);
router.delete('/:id', authorize('FARMER', 'ADMIN'), deleteFarm);

// Admin route - get farms by farmer ID
router.get('/farmer/:farmerId', authorize('ADMIN'), getFarmsByFarmer);

module.exports = router;
