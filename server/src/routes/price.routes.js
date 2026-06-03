const express = require('express');
const router = express.Router();
const priceController = require('../controllers/price.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/trends', priceController.getPriceTrends);
router.get('/crops', priceController.getCrops);
router.get('/regions', priceController.getRegions);
router.get('/year-range', priceController.getYearRange);
router.get('/sales-timing', priceController.getSalesTiming);
router.get('/multi-crop-profitability', protect, priceController.getMultiCropProfitability);

module.exports = router;