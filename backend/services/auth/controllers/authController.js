const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');
const { uploadImage } = require('../utils/uploadImage');
require('dotenv').config();

// Configure delivery service URL from environment variable
const DELIVERY_SERVICE_URL = 'http://host.docker.internal:4000/delivery-proxy';

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, address, phoneNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'customer',
      address,
      phoneNumber
    });

    // Save user to database
    await user.save();

    // If user is a delivery driver, create a driver record through API
    if (role === 'delivery') {
      try {
        await axios.post(`${DELIVERY_SERVICE_URL}/api/delivery/create`, {
          userId: user._id,
          name: user.name,
          phone: user.phoneNumber || '',
          status: 'offline'
        });
      } catch (driverError) {
        console.error('Error creating driver record:', driverError.message);
        // Delete the created user if driver creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ message: 'Error creating driver record' });
      }
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in register:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If user is a delivery driver, ensure a driver record exists
    if (user.role === 'delivery') {
      try {
        const driverResponse = await axios.get(`${DELIVERY_SERVICE_URL}/api/delivery/profile/${user._id}`);

        // If no driver record exists, create one
        if (!driverResponse.data) {
          await axios.post(`${DELIVERY_SERVICE_URL}/api/delivery/create`, {
            userId: user._id,
            name: user.name,
            phone: user.phoneNumber || '',
            status: 'offline'
          });
        }
      } catch (driverError) {
        console.error('Error verifying driver record:', driverError.message);
        return res.status(500).json({ message: 'Error verifying driver status' });
      }
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, address, phoneNumber } = req.body;
    const updateData = { name, address, phoneNumber };

    // Update avatar if provided
    if (req.file) {
      const avatarUrl = await uploadImage(
        req.file.buffer,
        'avatars',
        `${req.user.id}-${Date.now()}`
      );
      updateData.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users by role
exports.getAllUsersByRole = async (req, res) => {
  try {
    // Verify user has admin permissions
    if (req.user.role !== 'main_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
    }

    const role = req.query.role;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {

    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
