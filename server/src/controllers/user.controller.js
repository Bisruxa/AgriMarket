const { prisma } = require('../config/db');
const { hashPassword, comparePassword } = require('../models/User.model');

// @desc    Get all users (excludes soft-deleted by default)
// @route   GET /api/user
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Query param: ?includeDeleted=true to see deleted users
    const includeDeleted = req.query.includeDeleted === 'true';

    const users = await prisma.user.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        deletedAt: true
      }
    });

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
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        street: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        region: true,
        woreda: true,
        farmSize: true,
        crops: true,
        experience: true,
        isVerified: true,
        createdAt: true,
        deletedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
    const { 
      name, 
      phone, 
      avatar, 
      street, 
      city, 
      state, 
      country, 
      zipCode,
      // Location fields (Ethiopia specific)
      region,
      woreda,
      // Farmer specific fields
      farmSize,
      crops,
      experience
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
        ...(street && { street }),
        ...(city && { city }),
        ...(state && { state }),
        ...(country && { country }),
        ...(zipCode && { zipCode }),
        // Location fields
        ...(region && { region }),
        ...(woreda && { woreda }),
        // Farmer specific fields
        ...(farmSize && { farmSize }),
        ...(crops && { crops }),
        ...(experience && { experience })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        street: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        region: true,
        woreda: true,
        farmSize: true,
        crops: true,
        experience: true,
        isVerified: true,
        createdAt: true
      }
    });

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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await comparePassword(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

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
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'User is already deleted'
      });
    }

    // Soft delete - set deletedAt timestamp
    await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

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
    // Soft delete - set deletedAt timestamp
    await prisma.user.update({
      where: { id: req.user.id },
      data: { deletedAt: new Date() }
    });

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
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'User is not deleted'
      });
    }

    // Restore user - set deletedAt to null
    await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: null }
    });

    res.status(200).json({
      success: true,
      message: 'User restored successfully'
    });
  } catch (error) {
    next(error);
  }
};
