const User = require('../../auth/models/User');
const Driver = require('../models/Driver');

// Get all available drivers
exports.getAvailableDrivers = async (req, res) => {
  try {
    // Find all drivers with status 'available'
    const drivers = await Driver.find({ 
      status: 'available',
      isActive: true 
    }).populate('userId', 'name email');
    
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update driver status
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status, currentLocation } = req.body;
    const driverId = req.user.id;

    // Find the driver record
    const driver = await Driver.findOne({ userId: driverId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update driver status
    driver.status = status;
    if (currentLocation) {
      driver.currentLocation = currentLocation;
    }

    await driver.save();
    
    // Also update the user's driverStatus for consistency
    const user = await User.findById(driverId);
    if (user) {
      user.driverStatus = status;
      if (currentLocation) {
        user.currentLocation = currentLocation;
      }
      await user.save();
    }
    
    res.json(driver);
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const driverId = req.params.id;
    
    // Find the driver record
    const driver = await Driver.findOne({ userId: driverId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Get user data
    const user = await User.findById(driverId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Combine driver and user data
    const driverProfile = {
      ...driver.toObject(),
      email: user.email,
      address: user.address,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar
    };
    
    res.json(driverProfile);
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update driver profile
exports.updateDriverProfile = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { name, phone, photo } = req.body;

    // Find the driver record
    const driver = await Driver.findOne({ userId: driverId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update driver fields
    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (photo) driver.photo = photo;

    await driver.save();
    
    // Also update the user data for consistency
    const user = await User.findById(driverId);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phoneNumber = phone;
      if (photo) user.avatar = photo;
      await user.save();
    }
    
    res.json(driver);
  } catch (error) {
    console.error('Error updating driver profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const { userId, name, status } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(409).json({ message: 'Driver already exists' });
    }

    // Create a new driver
    const newDriver = new Driver({
      userId,
      name,
      phone,
      status
    });

    await newDriver.save();

    res.status(201).json(newDriver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Server error' });
  }
};