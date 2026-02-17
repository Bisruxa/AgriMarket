const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByFarmer
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { productValidation, validate } = require('../middleware/validation.middleware');

// Public routes
router.get('/', getProducts);
router.get('/farmer/:farmerId', getProductsByFarmer);
router.get('/:id', getProduct);

// Protected routes (Farmer only)
router.post('/', protect, authorize('FARMER', 'ADMIN'), productValidation, validate, createProduct);
router.put('/:id', protect, authorize('FARMER', 'ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('FARMER', 'ADMIN'), deleteProduct);

module.exports = router;
