const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  photo: {
    type: String,
    default: '/images/default-driver.jpg'
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  currentLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Driver', DriverSchema); 