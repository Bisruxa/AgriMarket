const { getMarketTrends } = require('../services/marketTrend.service');

// @desc    Aggregated market trends from product listings
// @route   GET /api/market/trends?weeks=8&region=&category=
// @access  Private
exports.getMarketTrends = async (req, res, next) => {
  try {
    const data = await getMarketTrends(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    next(error);
  }
};
