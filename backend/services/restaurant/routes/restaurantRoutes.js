const express = require('express');
const router = express.Router();
const multer = require('multer');
const restaurantController = require('../controllers/restaurantController');
const { authMiddleware, authorize } = require('../../../middleware/auth');
const Category = require('../models/Category');
const { uploadImage } = require('../../../utils/uploadImage');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all restaurants (public)
router.get('/', restaurantController.getAllRestaurants);

// Category routes - MUST BE BEFORE /:id route
// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin category management
router.post(
  '/categories',
  authMiddleware,
  authorize(['main_admin', 'admin']),
  upload.single('image'),
  async (req, res) => {
    try {
      const { name } = req.body;
      
      // Check if category already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      
      // Upload image if provided
      let imageUrl = '';
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
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put(
  '/categories/:id',
  authMiddleware,
  authorize(['main_admin', 'admin']),
  upload.single('image'),
  async (req, res) => {
    try {
      const { name } = req.body;
      const categoryId = req.params.id;
      
      const category = await Category.findById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Check if there's another category with the same name
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory && existingCategory._id.toString() !== categoryId) {
          return res.status(400).json({ message: 'Category with this name already exists' });
        }
        category.name = name;
      }
      
      // Upload and update image if provided
      if (req.file) {
        const imageUrl = await uploadImage(req.file, 'categories');
        category.image = imageUrl;
      }
      
      await category.save();
      
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.delete(
  '/categories/:id',
  authMiddleware,
  authorize(['main_admin', 'admin']),
  async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get restaurant by ID (public)
router.get('/:id', restaurantController.getRestaurantById);

// Create a new restaurant (protected, only restaurant owners)
router.post(
  '/',
  authMiddleware,
  authorize(['restaurant']),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  restaurantController.createRestaurant
);

// Update restaurant (protected, only owner of the restaurant)
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  restaurantController.updateRestaurant
);

// Delete restaurant (protected, only owner or admin)
router.delete(
  '/:id',
  authMiddleware,
  restaurantController.deleteRestaurant
);

// Get menu items for a restaurant (public)
router.get('/:id/menu', restaurantController.getMenuItems);

// Add menu item (protected, only owner of the restaurant)
router.post(
  '/:id/menu',
  authMiddleware,
  upload.single('image'),
  restaurantController.addMenuItem
);

// Update menu item (protected, only owner of the restaurant)
router.put(
  '/menu/:id',
  authMiddleware,
  upload.single('image'),
  restaurantController.updateMenuItem
);

// Delete menu item (protected, only owner of the restaurant)
router.delete(
  '/menu/:id',
  authMiddleware,
  restaurantController.deleteMenuItem
);

// Admin routes for restaurant management
router.put(
  '/:id/approve',
  authMiddleware,
  authorize(['main_admin', 'admin']),
  async (req, res) => {
    try {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { isOpen: true },
        { new: true }
      );
      
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error('Error approving restaurant:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put(
  '/:id/suspend',
  authMiddleware,
  authorize(['main_admin', 'admin']),
  async (req, res) => {
    try {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { isOpen: false },
        { new: true }
      );
      
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error('Error suspending restaurant:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
