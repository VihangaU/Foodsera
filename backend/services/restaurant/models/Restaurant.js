
const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  categories: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
