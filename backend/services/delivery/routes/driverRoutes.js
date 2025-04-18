const express = require('express');
const router = express.Router();
const { auth } = require('../../../services/auth/middleware/auth');
const { 
  getAvailableDrivers, 
  updateDriverStatus, 
  getDriverProfile, 
  updateDriverProfile 
} = require('../controllers/driverController');

// Public routes
router.get('/available', getAvailableDrivers);

// Protected routes (require authentication)
router.get('/profile', auth, getDriverProfile);
router.put('/profile', auth, updateDriverProfile);
router.put('/status', auth, updateDriverStatus);

module.exports = router; 