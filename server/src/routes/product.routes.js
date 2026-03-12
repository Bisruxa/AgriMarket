const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByFarmer,
  getMyProducts
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { productValidation, validate } = require('../middleware/validation.middleware');

// Trader routes (requires approved trader)
router.get('/', protect, authorize('TRADER', 'ADMIN'), getProducts);

// Public route - view farmer's products
router.get('/farmer/:farmerId', getProductsByFarmer);

// Farmer routes
router.get('/my-products', protect, authorize('FARMER'), getMyProducts);
router.post('/', protect, authorize('FARMER', 'ADMIN'), productValidation, validate, createProduct);
router.put('/:id', protect, authorize('FARMER', 'ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('FARMER', 'ADMIN'), deleteProduct);

// This must be last (catches :id pattern)
router.get('/:id', getProduct);

module.exports = router;
