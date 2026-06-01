const {
  getHealth,
  recommendCrop,
  predictPrice,
} = require('../services/agriai.service');

function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  return missing;
}

// @desc    Check AgriAI upstream health
// @route   GET /api/agriai/health
// @access  Private
exports.getAgriAIHealth = async (req, res, next) => {
  try {
    const data = await getHealth();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get crop recommendations from AgriAI
// @route   POST /api/agriai/recommend/crop
// @access  Private
exports.recommendCropFromAI = async (req, res, next) => {
  try {
    const requiredFields = [
      'nitrogen',
      'phosphorus',
      'potassium',
      'temperature',
      'humidity',
      'ph',
      'rainfall',
    ];
    const missing = requireFields(req.body, requiredFields);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const payload = {
      nitrogen: Number(req.body.nitrogen),
      phosphorus: Number(req.body.phosphorus),
      potassium: Number(req.body.potassium),
      temperature: Number(req.body.temperature),
      humidity: Number(req.body.humidity),
      ph: Number(req.body.ph),
      rainfall: Number(req.body.rainfall),
      ...(req.body.soil_color && { soil_color: req.body.soil_color }),
    };

    const data = await recommendCrop(payload);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get crop price forecast from AgriAI (single point)
// @route   POST /api/agriai/predict/price
// @access  Private
exports.predictPriceFromAI = async (req, res, next) => {
  try {
    const requiredFields = ['crop_name', 'region', 'year', 'month'];
    const missing = requireFields(req.body, requiredFields);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const payload = {
      crop_name: String(req.body.crop_name),
      region: String(req.body.region),
      year: Number(req.body.year),
      month: Number(req.body.month),
    };

    const data = await predictPrice(payload);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get price forecaster metadata (available crops & regions)
// @route   GET /api/agriai/price-forecaster/metadata
// @access  Private
exports.getPriceForecasterMetadata = async (req, res, next) => {
  try {
    const { getPriceForecasterMetadata: fetchMeta } = require('../services/agriai.service');
    const data = await fetchMeta();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.getToolDefinitions = async (req, res, next) => {
  try {
    const { getToolDefinitions } = require('../services/agriai.service');
    const tools = await getToolDefinitions();
    res.status(200).json({ success: true, data: tools });
  } catch (error) {
    next(error);
  }
};

exports.executeTool = async (req, res, next) => {
  try {
    const { executeToolFunction } = require('../services/agriai.service');
    const { name, args } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tool name is required' });
    }
    const result = await executeToolFunction(name, args || {});
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};
