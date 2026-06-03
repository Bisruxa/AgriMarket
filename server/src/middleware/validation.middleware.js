const { body, validationResult } = require('express-validator');
const {
  isValidEthiopianPhone,
  formatEthiopianPhoneForStorage,
  ETHIOPIAN_PHONE_MESSAGE,
} = require('../utils/phone.util');

// Handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation rules
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .toUpperCase()
    .isIn(['TRADER', 'FARMER', 'ADMIN'])
    .withMessage('Role must be TRADER, FARMER, or ADMIN'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      if (!isValidEthiopianPhone(value)) {
        throw new Error(ETHIOPIAN_PHONE_MESSAGE);
      }
      return true;
    })
    .customSanitizer((value) => formatEthiopianPhoneForStorage(value)),
];

// Login validation rules
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

exports.forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

exports.resetPasswordValidation = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

exports.verifyEmailValidation = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid verification token'),
];

exports.resendVerificationValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

// Product validation rules
exports.productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .toUpperCase()  // Convert to uppercase before validation
    .isIn(['VEGETABLES', 'FRUITS', 'GRAINS', 'DAIRY', 'POULTRY', 'MEAT', 'SEEDS', 'FERTILIZERS', 'EQUIPMENT', 'OTHER'])
    .withMessage('Invalid category. Must be one of: VEGETABLES, FRUITS, GRAINS, DAIRY, POULTRY, MEAT, SEEDS, FERTILIZERS, EQUIPMENT, OTHER'),
  body('unit')
    .optional()
    .toUpperCase()
    .isIn(['KG', 'LB', 'PIECE', 'DOZEN', 'BUNCH', 'BAG', 'CRATE'])
    .withMessage('Invalid unit. Must be one of: KG, LB, PIECE, DOZEN, BUNCH, BAG, CRATE'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be true or false'),
  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Harvest date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];
