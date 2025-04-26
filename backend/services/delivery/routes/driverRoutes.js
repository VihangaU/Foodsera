const express = require('express');
const router = express.Router();
const { 
  getAvailableDrivers, 
  updateDriverStatus, 
  getDriverProfile, 
  updateDriverProfile ,
  createDriver
} = require('../controllers/driverController');

// Public routes
router.get('/available', getAvailableDrivers);

router.get('/profile/:id', getDriverProfile);
router.put('/profile', updateDriverProfile);
router.put('/status', updateDriverStatus);
router.post('/create', createDriver);
module.exports = router; 