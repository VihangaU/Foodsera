// const User = require('../../auth/models/User');
// const Restaurant = require('../../restaurant/models/Restaurant');
// const Category = require('../../restaurant/models/Category');
// const Driver = require('../../delivery/models/Driver');
const { uploadImage } = require('../utils/uploadImage');
const axios = require('axios');

const AUTH_SERVICE_URL = 'http://auth-service:5001';
// const AUTH_SERVICE_URL = 'http://localhost:5001';

// Get dashboard statistics
// exports.getDashboardStats = async (req, res) => {
//   try {

//     const customers = await User.countDocuments({ role: 'customer' });
//     const restaurants = await Restaurant.countDocuments();
//     const drivers = await Driver.countDocuments();
//     const categories = await Category.countDocuments();

//     return res.json({
//       // customers,
//       restaurants,
//       drivers,
//       categories
//     });
//   } catch (error) {
//     console.error('Error getting dashboard stats:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

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

// Get all categories
// exports.getAllCategories = async (req, res) => {
//   try {
//     const categories = await Category.find();
//     return res.json(categories);
//   } catch (error) {
//     console.error('Error getting categories:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// // Approve driver
// exports.approveDriver = async (req, res) => {
//   try {

//     const driver = await User.findByIdAndUpdate(
//       req.params.id,
//       { driverStatus: 'available' },
//       { new: true }
//     ).select('-password');

//     if (!driver) {
//       return res.status(404).json({ message: 'Driver not found' });
//     }

//     return res.json(driver);
//   } catch (error) {
//     console.error('Error approving driver:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// Suspend driver
// exports.suspendDriver = async (req, res) => {
//   try {

//     const driver = await User.findByIdAndUpdate(
//       req.params.id,
//       { driverStatus: 'offline' },
//       { new: true }
//     ).select('-password');

//     if (!driver) {
//       return res.status(404).json({ message: 'Driver not found' });
//     }

//     return res.json(driver);
//   } catch (error) {
//     console.error('Error suspending driver:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// Approve restaurant
// exports.approveRestaurant = async (req, res) => {
//   try {
   
//     const restaurant = await Restaurant.findByIdAndUpdate(
//       req.params.id,
//       { isOpen: true },
//       { new: true }
//     );

//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     return res.json(restaurant);
//   } catch (error) {
//     console.error('Error approving restaurant:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// Suspend restaurant
// exports.suspendRestaurant = async (req, res) => {
//   try {
   
//     const restaurant = await Restaurant.findByIdAndUpdate(
//       req.params.id,
//       { isOpen: false },
//       { new: true }
//     );

//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     return res.json(restaurant);
//   } catch (error) {
//     console.error('Error suspending restaurant:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

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

// Update category
// exports.updateCategory = async (req, res) => {
//   try {
   
//     const { name } = req.body;
//     const categoryId = req.params.id;
    
//     const category = await Category.findById(categoryId);
    
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
    
//     // Check if there's another category with the same name
//     if (name && name !== category.name) {
//       const existingCategory = await Category.findOne({ name });
//       if (existingCategory && existingCategory._id.toString() !== categoryId) {
//         return res.status(400).json({ message: 'Category with this name already exists' });
//       }
//       category.name = name;
//     }
    
//     // Upload and update image if provided
//     if (req.file) {
//       const imageUrl = await uploadImage(req.file, 'categories');
//       category.image = imageUrl;
//     }
    
//     await category.save();
    
//     return res.json(category);
//   } catch (error) {
//     console.error('Error updating category:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// Delete category
// exports.deleteCategory = async (req, res) => {
//   try {
  
//     const category = await Category.findByIdAndDelete(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
    
//     // Here you might also want to remove this category from all restaurants that have it
//     // await Restaurant.updateMany({ categories: req.params.id }, { $pull: { categories: req.params.id } });
    
//     return res.json({ message: 'Category deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };
