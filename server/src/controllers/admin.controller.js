const adminService = require('../services/admin.service');

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { users, total, page, pages } = await adminService.getAllUsers(req.query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending traders awaiting approval
// @route   GET /api/admin/traders/pending
// @access  Private/Admin
exports.getPendingTraders = async (req, res, next) => {
  try {
    const traders = await adminService.getPendingTraders();

    res.status(200).json({
      success: true,
      count: traders.length,
      data: traders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a trader
// @route   PUT /api/admin/traders/:id/approve
// @access  Private/Admin
exports.approveTrader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const updatedUser = await adminService.approveTrader(id, note);

    res.status(200).json({
      success: true,
      message: 'Trader approved successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a trader
// @route   PUT /api/admin/traders/:id/reject
// @access  Private/Admin
exports.rejectTrader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const updatedUser = await adminService.rejectTrader(id, note);

    res.status(200).json({
      success: true,
      message: 'Trader rejected',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStatistics = async (req, res, next) => {
  try {
    const data = await adminService.getStatistics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trader details for review
// @route   GET /api/admin/traders/:id
// @access  Private/Admin
exports.getTraderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trader = await adminService.getTraderDetails(id);

    res.status(200).json({
      success: true,
      data: trader
    });
  } catch (error) {
    next(error);
  }
};
