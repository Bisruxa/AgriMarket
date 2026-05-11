const { prisma } = require('../config/db');
const { fetchForecast } = require('../services/weather.service');

function parseCoord(value, name, min, max) {
  if (value === undefined || value === null || value === '') {
    return { error: `${name} is required` };
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) {
    return { error: `${name} must be a number between ${min} and ${max}` };
  }
  return { value: n };
}

// @desc    Current + 7-day forecast from Open-Meteo for coordinates
// @route   GET /api/weather/forecast?latitude=&longitude=
// @access  Private
exports.getForecastByCoordinates = async (req, res, next) => {
  try {
    const lat = parseCoord(req.query.latitude, 'latitude', -90, 90);
    if (lat.error) {
      return res.status(400).json({ success: false, message: lat.error });
    }
    const lon = parseCoord(req.query.longitude, 'longitude', -180, 180);
    if (lon.error) {
      return res.status(400).json({ success: false, message: lon.error });
    }

    const data = await fetchForecast(lat.value, lon.value);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Forecast for a farm using its stored coordinates
// @route   GET /api/weather/farm/:farmId
// @access  Private (farmer owns farm, or admin)
exports.getForecastForFarm = async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.farmId },
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    if (farm.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this farm',
      });
    }

    if (farm.latitude == null || farm.longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Farm has no latitude/longitude; update the farm location first',
      });
    }

    const data = await fetchForecast(farm.latitude, farm.longitude);
    res.status(200).json({
      success: true,
      data: {
        ...data,
        farmId: farm.id,
        farmName: farm.name,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
