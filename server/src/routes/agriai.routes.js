const express = require('express');
const router = express.Router();

const {
  getAgriAIHealth,
  recommendCropFromAI,
  predictPriceFromAI,
  getPriceForecasterMetadata,
} = require('../controllers/agriai.controller');
const { protect } = require('../middleware/auth.middleware');

// Public: quick check that Node can reach AgriAI (no login required)
router.get('/health', getAgriAIHealth);

router.use(protect);

router.post('/recommend/crop', recommendCropFromAI);
router.post('/predict/price', predictPriceFromAI);
router.get('/price-forecaster/metadata', getPriceForecasterMetadata);

module.exports = router;
