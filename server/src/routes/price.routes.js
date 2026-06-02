const express = require('express');
const router = express.Router();
const priceController = require('../controllers/price.controller');

router.get('/trends', priceController.getPriceTrends);
router.get('/crops', priceController.getCrops);
router.get('/regions', priceController.getRegions);
router.get('/year-range', priceController.getYearRange);

module.exports = router;