const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateProfile,
  updatePassword,
  deleteUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protected routes
router.use(protect);

router.put('/profile', updateProfile);
router.put('/password', updatePassword);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
