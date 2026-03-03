const { prisma } = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../models/User.model');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      phone,
      region,
      woreda,
      farmSize,
      crops,
      experience
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with all fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role ? role.toUpperCase() : 'BUYER',
        phone: phone || null,
        region: region || null,
        woreda: woreda || null,
        farmSize: farmSize || null,
        crops: crops || null,
        experience: experience || null
      }
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Check if email is available
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    res.status(200).json({
      success: true,
      available: !existingUser  // true if email is not in use
    });
  } catch (error) {
    next(error);
  }
};
// Helper function to send token response with cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_EXPIRE) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Cross-site cookie settings
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};
