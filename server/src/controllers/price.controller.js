const priceService = require('../services/price.service');

exports.getPriceTrends = async (req, res, next) => {
  try {
    const { cropName, region, limit } = req.query;
    const trends = await priceService.getPriceTrends({
      cropName: cropName || undefined,
      region: region || undefined,
      limit: limit ? parseInt(limit) : 300,
    });
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

exports.getCrops = async (req, res, next) => {
  try {
    const crops = await priceService.getAvailableCrops();
    res.status(200).json({ success: true, data: crops });
  } catch (error) {
    next(error);
  }
};

exports.getRegions = async (req, res, next) => {
  try {
    const regions = await priceService.getAvailableRegions();
    res.status(200).json({ success: true, data: regions });
  } catch (error) {
    next(error);
  }
};

exports.getYearRange = async (req, res, next) => {
  try {
    const range = await priceService.getYearRange();
    res.status(200).json({ success: true, data: range });
  } catch (error) {
    next(error);
  }
};

exports.getSalesTiming = async (req, res, next) => {
  try {
    const { cropName, region } = req.query;
    const result = await priceService.getSalesTiming({
      cropName: cropName || undefined,
      region: region || undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getMultiCropProfitability = async (req, res, next) => {
  try {
    const farmId = req.query.farmId || undefined;
    const result = await priceService.getMultiCropProfitability({
      userId: req.user.id,
      farmId,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};