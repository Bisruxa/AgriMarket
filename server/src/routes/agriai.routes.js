const express = require('express');
const router = express.Router();

const {
  getAgriAIHealth,
  recommendCropFromAI,
  predictPriceFromAI,
} = require('../controllers/agriai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/health', getAgriAIHealth);
router.post('/recommend/crop', recommendCropFromAI);
router.post('/predict/price', predictPriceFromAI);

module.exports = router;
