
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, authorize } = require('../middleware/auth');

// Protected routes
// router.use(authMiddleware);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/user/:id', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

// Restaurant routes
router.get(
  '/restaurant/:restaurantId',
  orderController.getRestaurantOrders
);

router.put(
  '/:id/status',
  orderController.updateOrderStatus
);

router.put(
  '/:id/assign-driver',
  orderController.assignDriver
);

// Delivery driver routes
router.get(
  '/driver/orders',
  orderController.getDriverOrders
);

router.put(
  '/driver/location',
  orderController.updateDriverLocation
);

module.exports = router;
