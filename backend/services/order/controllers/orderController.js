const Order = require('../models/Order');
const axios = require('axios');

const DELIVERY_SERVICE_URL = 'http://delivery-service:5003';
const Restaurant_SERVICE_URL = 'http://restaurent-service:5006';

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      restaurantId,
      items,
      subtotal,
      tax,
      deliveryFee,
      tip,
      total,
      paymentMethod,
      deliveryAddress,
      customerLocation
    } = req.body;


    // Verify restaurant exists
    const restaurant = await axios.get(`${Restaurant_SERVICE_URL}/api/restaurants/${restaurantId}`);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Verify menu items and their prices
    const itemsWithDetails = [];
    for (const item of items) {
      const menuItem = await axios.get(`${Restaurant_SERVICE_URL}/api/restaurants/menu/${item.menuItemId}`);
      // const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      // Verify the restaurant is the one that offers this menu item
      if (menuItem.data.restaurantId.toString() !== restaurantId) {
        return res.status(400).json({ message: `Menu item ${item.menuItemId} does not belong to the selected restaurant` });
      }

      itemsWithDetails.push({
        menuItemId: menuItem.data._id,
        name: menuItem.data.name,
        price: menuItem.data.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    // Create order
    const order = new Order({
      userId,
      restaurantId,
      items: itemsWithDetails,
      subtotal,
      tax,
      deliveryFee,
      tip: tip || 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
      deliveryAddress,
      customerLocation,
      status: 'pending'
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id })

    res.json(orders);
  } catch (error) {
    console.error('Error getting user orders:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get restaurant orders
exports.getRestaurantOrders = async (req, res) => {
  try {
    // Verify restaurant ownership
    const restaurant = await axios.get(`${Restaurant_SERVICE_URL}/api/restaurants/${req.params.restaurantId}`);
    // const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }


    const orders = await Order.find({ restaurantId: req.params.restaurantId })
    // if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    // const { status } = req.query;
    // const query = { restaurantId: req.params.restaurantId };

    // if (status) {
    //   query.status = status;
    // }

    // const orders = await Order.find(query)
    //   .sort({ createdAt: -1 })
    //   .populate('userId', 'name phoneNumber');

    res.json(orders);
  } catch (error) {
    console.error('Error getting restaurant orders:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (for restaurant owner)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status based on role
    const validStatusesForRestaurant = ['confirmed', 'preparing', 'ready', 'cancelled'];
    const validStatusesForDelivery = ['in-delivery', 'delivered'];

    if (req.user.role === 'restaurant' && !validStatusesForRestaurant.includes(status)) {
      return res.status(400).json({ message: 'Invalid status for restaurant owner' });
    }

    if (req.user.role === 'delivery' && !validStatusesForDelivery.includes(status)) {
      return res.status(400).json({ message: 'Invalid status for delivery driver' });
    }

    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'restaurant') {
      const restaurant = await axios.get(`${Restaurant_SERVICE_URL}/api/restaurants/${order.restaurantId}`);
      // const restaurant = await Restaurant.findById(order.restaurantId);
      if (!restaurant || restaurant.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'delivery') {
      if (order.assignedDriverId?.toString() !== req.user.id && status !== 'delivered') {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Update order status
    order.status = status;

    // If status is "ready", estimate delivery time
    if (status === 'ready') {
      order.estimatedDeliveryTime = `${Math.floor(Math.random() * 20) + 20} min`; // Random time between 20-40 min
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign driver to order
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    // Verify driver exists
    const driver = await axios.get(`${DELIVERY_SERVICE_URL}/api/delivery/profile/${driverId}`);
    if (!driver) {
      return res.status(400).json({ message: 'Invalid driver' });
    }

    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order is ready for delivery
    if (order.status !== 'ready') {
      return res.status(400).json({ message: 'Order is not ready for delivery' });
    }

    // Assign driver
    order.assignedDriverId = driverId;
    order.status = 'in-delivery';
    await order.save();

    // Update driver status
    driver.status = 'busy';
    await driver.save();

    res.json(order);
  } catch (error) {
    console.error('Error assigning driver:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get orders for a delivery driver
exports.getDriverOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedDriverId: req.user.id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('restaurantId', 'name address logo')
      .populate('userId', 'name phoneNumber');

    res.json(orders);
  } catch (error) {
    console.error('Error getting driver orders:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update driver location
exports.updateDriverLocation = async (req, res) => {
  try {
    const { orderId, latitude, longitude } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify driver is assigned to this order
    if (order.assignedDriverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update driver location
    order.driverLocation = { latitude, longitude };
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating driver location:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
