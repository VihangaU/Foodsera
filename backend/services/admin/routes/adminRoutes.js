const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Dashboard statistics
// router.get('/stats', adminController.getDashboardStats);

// Customer management
router.get('/customers', adminController.getAllCustomers);

// Driver management
router.get('/drivers', adminController.getAllDrivers);
// router.put('/drivers/:id/approve', adminController.approveDriver);
// router.put('/drivers/:id/suspend', adminController.suspendDriver);

// Restaurant management
// router.put('/restaurants/:id/approve', adminController.approveRestaurant);
// router.put('/restaurants/:id/suspend', adminController.suspendRestaurant);

// Category management
router.post('/categories', upload.single('image'), adminController.createCategory);
// router.get('/categories', adminController.getAllCategories);
// router.put('/categories/:id', upload.single('image'), adminController.updateCategory);
// router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
