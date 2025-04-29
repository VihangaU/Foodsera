const { uploadImage } = require('../utils/uploadImage');
const axios = require('axios');

const AUTH_SERVICE_URL = 'http://auth-service:5001';

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/customer`);
    return res.json(response.data);
  } catch (error) {
    console.error('Error getting customers:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {

    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/delivery`);
    return res.json(response.data);

  } catch (error) {
    console.error('Error getting drivers:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



// Create category
exports.createCategory = async (req, res) => {
  try {
  
    const { name } = req.body;
    
    // Check if category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    let imageUrl = '';
    
    // Upload image if provided
    if (req.file) {
      imageUrl = await uploadImage(req.file, 'categories');
    } else {
      return res.status(400).json({ message: 'Category image is required' });
    }
    
    const newCategory = new Category({
      name,
      image: imageUrl
    });
    
    await newCategory.save();
    
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};