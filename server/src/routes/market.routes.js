const express = require('express');
const router = express.Router();
const { getMarketTrends, getBuyingOpportunities } = require('../controllers/market.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/trends', protect, getMarketTrends);
router.get('/opportunities', protect, getBuyingOpportunities);

module.exports = router;
