const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Customer management
router.get('/customers', adminController.getAllCustomers);

// Driver management
router.get('/drivers', adminController.getAllDrivers);

// Category management
router.post('/categories', upload.single('image'), adminController.createCategory);

module.exports = router;
