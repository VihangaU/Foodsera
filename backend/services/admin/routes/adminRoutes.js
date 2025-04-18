const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../../../middleware/auth');

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Dashboard statistics
router.get('/stats', authMiddleware, adminController.getDashboardStats);

// Customer management
router.get('/customers', authMiddleware, adminController.getAllCustomers);

// Driver management
router.get('/drivers', authMiddleware, adminController.getAllDrivers);
router.put('/drivers/:id/approve', authMiddleware, adminController.approveDriver);
router.put('/drivers/:id/suspend', authMiddleware, adminController.suspendDriver);

// Restaurant management
router.put('/restaurants/:id/approve', authMiddleware, adminController.approveRestaurant);
router.put('/restaurants/:id/suspend', authMiddleware, adminController.suspendRestaurant);

// Category management
router.post('/categories', authMiddleware, upload.single('image'), adminController.createCategory);
router.get('/categories', authMiddleware, adminController.getAllCategories);
router.put('/categories/:id', authMiddleware, upload.single('image'), adminController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminController.deleteCategory);

module.exports = router;
