const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  checkEmail,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  validate
} = require('../middleware/validation.middleware');

router.post('/check-email', checkEmail);
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.post('/verify-email', verifyEmailValidation, validate, verifyEmail);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, validate, resendVerification);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
