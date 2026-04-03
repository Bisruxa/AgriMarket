const userService = require('../services/user.service');

// @desc    Get all users (excludes soft-deleted by default)
// @route   GET /api/user
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Query param: ?includeDeleted=true to see deleted users
    const includeDeleted = req.query.includeDeleted === 'true';

    const users = await userService.getUsers({ includeDeleted });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/user/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/user/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    await userService.updatePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete user (Admin)
// @route   DELETE /api/user/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUserById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete own account
// @route   DELETE /api/user/me
// @access  Private
exports.deleteMyAccount = async (req, res, next) => {
  try {
    await userService.deleteMyAccount(req.user.id);

    // Clear the auth cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Your account has been deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore soft-deleted user (Admin)
// @route   PUT /api/user/:id/restore
// @access  Private/Admin
exports.restoreUser = async (req, res, next) => {
  try {
    await userService.restoreUser(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User restored successfully'
    });
  } catch (error) {
    next(error);
  }
};
