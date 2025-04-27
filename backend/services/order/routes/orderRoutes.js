
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize } = require('../middleware/auth');

// Protected routes
// router.use(authMiddleware);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/user', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

// Restaurant routes
router.get(
  '/restaurant/:restaurantId',
  orderController.getRestaurantOrders
);

router.put(
  '/:id/status',
  authorize(['restaurant', 'delivery', 'admin']),
  orderController.updateOrderStatus
);

router.put(
  '/:id/assign-driver',
  authorize(['restaurant', 'admin']),
  orderController.assignDriver
);

// Delivery driver routes
router.get(
  '/driver/orders',
  authorize(['delivery']),
  orderController.getDriverOrders
);

router.put(
  '/driver/location',
  authorize(['delivery']),
  orderController.updateDriverLocation
);

module.exports = router;
