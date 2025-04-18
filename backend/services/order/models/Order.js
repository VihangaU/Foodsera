
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      specialInstructions: {
        type: String
      }
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'in-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  tip: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'paypal'],
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  estimatedDeliveryTime: {
    type: String
  },
  assignedDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  driverLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
