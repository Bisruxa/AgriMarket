const express = require('express');
const router = express.Router();
const {
  getForecastByCoordinates,
  getForecastForFarm,
} = require('../controllers/weather.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/forecast', getForecastByCoordinates);
router.get('/farm/:farmId', getForecastForFarm);

module.exports = router;
