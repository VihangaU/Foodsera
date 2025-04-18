
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, authorize } = require('../../../middleware/auth');

// Protected routes
router.use(authMiddleware);

// Create payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', paymentController.confirmPayment);

// Get payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Process refund
router.post(
  '/refund',
  authorize(['customer', 'restaurant', 'admin']),
  paymentController.processRefund
);

module.exports = router;
