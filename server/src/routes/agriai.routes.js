const express = require('express');
const router = express.Router();

const {
  getAgriAIHealth,
  recommendCropFromAI,
  predictPriceFromAI,
  getPriceForecasterMetadata,
  getToolDefinitions,
  executeTool,
} = require('../controllers/agriai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/health', getAgriAIHealth);
router.post('/recommend/crop', recommendCropFromAI);
router.post('/predict/price', predictPriceFromAI);
router.get('/price-forecaster/metadata', getPriceForecasterMetadata);
router.get('/tools', getToolDefinitions);
router.post('/tools/execute', executeTool);

module.exports = router;
