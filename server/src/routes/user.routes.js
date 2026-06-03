const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  getFarmerProfile,
  updateProfile,
  updatePassword,
  deleteUser,
  deleteMyAccount,
  restoreUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protected routes
router.use(protect);

// User routes
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/me', deleteMyAccount);  // User deletes own account
router.get('/farmers/:id/profile', authorize('TRADER', 'ADMIN'), getFarmerProfile);

// Admin only routes
router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', authorize('ADMIN'), getUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);
router.put('/:id/restore', authorize('ADMIN'), restoreUser);  // Restore deleted user

module.exports = router;
