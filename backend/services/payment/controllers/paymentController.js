
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

const Order_SERVICE_URL = 'http://order-service:5004';

// Create a payment intent with Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, orderId, userId } = req.body;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      currency: 'usd',
      metadata: {
        orderId,
        userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Verify payment intent exists
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment intent is successful
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Update order payment status
    const order = await axios.get(`${Order_SERVICE_URL}/api/orders/${orderId}`);
    // const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'completed';
    await order.save();

    res.json({ message: 'Payment confirmed', order });
  } catch (error) {
    console.error('Error confirming payment:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment methods for a user
exports.getPaymentMethods = async (req, res) => {
  try {
    // In a real app, you would retrieve saved payment methods from Stripe
    // For this demo, we'll return mock data
    const paymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025
        },
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5555',
          expMonth: 6,
          expYear: 2024
        },
        isDefault: false
      }
    ];

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error getting payment methods:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    // Find order
    const order = await axios.get(`${Order_SERVICE_URL}/api/orders/${orderId}`);
    // const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized (customer or restaurant owner)
    if (req.user.role !== 'admin' &&
      order.userId.toString() !== req.user.id &&
      req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if order is already refunded
    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'Order already refunded' });
    }

    // Process refund with Stripe (in a real app)
    // For this demo, we'll just update the order status
    order.paymentStatus = 'refunded';
    await order.save();

    res.json({ message: 'Refund processed successfully', order });
  } catch (error) {
    console.error('Error processing refund:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
