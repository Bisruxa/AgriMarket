const express = require('express');
const router = express.Router();
const { getMarketTrends } = require('../controllers/market.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/trends', protect, getMarketTrends);

module.exports = router;
