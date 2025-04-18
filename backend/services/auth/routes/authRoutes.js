
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../../../middleware/auth');

// Setup multer for file uploads (store in memory for Firebase upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile (protected route)
router.get('/profile', authMiddleware, authController.getUserProfile);

// Update user profile (protected route)
router.put(
  '/profile',
  authMiddleware,
  upload.single('avatar'),
  authController.updateUserProfile
);

// Get all users by role (for admin)
router.get('/users', authMiddleware, authController.getAllUsersByRole);

module.exports = router;
