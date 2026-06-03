const { generateToken } = require('../models/User.model');
const authService = require('../services/auth.service');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { user, emailSent } = await authService.registerUser(req.body);

    let message =
      'Registration successful. Please check your email to verify your account before signing in.';

    if (!emailSent) {
      message =
        'Account created, but we could not send the verification email. Use "Resend verification" on the sign-in screen.';
    }

    if (user.role === 'TRADER' && user.approvalStatus === 'PENDING') {
      message = emailSent
        ? 'Registration submitted. Verify your email first, then wait for admin approval before you can sign in.'
        : 'Registration submitted. We could not send the verification email — use Resend verification on sign-in, then wait for admin approval.';
    }

    return res.status(201).json({
      success: true,
      message,
      emailSent,
      requiresEmailVerification: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
        isVerified: user.isVerified,
      },
    });
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
    const user = await authService.loginUser(email, password);

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
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
      token: generateToken(user)
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

    const available = await authService.checkEmailAvailability(email);

    res.status(200).json({
      success: true,
      available
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message:
        'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with token from email
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with token from verification link
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const raw = req.body?.token ?? req.query?.token;
    const token = Array.isArray(raw) ? raw[0] : raw;
    const result = await authService.verifyEmail(token);

    let message = 'Email verified successfully. You can now sign in.';
    if (result.alreadyVerified) {
      message = 'Email is already verified. You can sign in.';
    } else if (result.role === 'TRADER' && result.approvalStatus === 'PENDING') {
      message =
        'Email verified. Your trader account is still pending admin approval before you can sign in.';
    }

    res.status(200).json({
      success: true,
      message,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { sent } = await authService.resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      emailSent: sent,
      message: sent
        ? 'If an account exists with that email and is not yet verified, a verification link has been sent.'
        : 'We could not send the verification email right now. Please try again in a moment.',
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
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region || null,
        woreda: user.woreda || null,
        farmSize: user.farmSize || null,
        crops: user.crops || null,
        experience: user.experience || null,
        approvalStatus: user.approvalStatus || null,
        isVerified: user.isVerified ?? true,
      },
    });
};
