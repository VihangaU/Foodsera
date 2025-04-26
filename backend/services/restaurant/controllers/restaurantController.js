const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const { uploadImage } = require('../utils/uploadImage');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    console.error('Error getting restaurants:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Error getting restaurant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create restaurant (for restaurant owners)
exports.createRestaurant = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { name, description, categories, deliveryFee, deliveryTime, address } = req.body;
    
    // Upload images
    let logoUrl, imageUrl;
    
    if (!req.files || !req.files.logo || !req.files.image) {
      console.error('Missing files in request:', req.files);
      return res.status(400).json({ message: 'Logo and image are required' });
    }
    
    try {
      if (req.files.logo) {
        logoUrl = await uploadImage(
          req.files.logo[0].buffer,
          'restaurants/logos',
          `logo-${Date.now()}`
        );
      }
      
      if (req.files.image) {
        imageUrl = await uploadImage(
          req.files.image[0].buffer,
          'restaurants/images',
          `image-${Date.now()}`
        );
      }
    } catch (uploadError) {
      console.error('Error uploading images:', uploadError);
      return res.status(500).json({ message: 'Error uploading images' });
    }
    
    if (!logoUrl || !imageUrl) {
      return res.status(400).json({ message: 'Logo and image are required' });
    }
    
    // Process categories (ensure it's an array)
    let categoryArray = [];
    if (categories) {
      categoryArray = categories.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
    }
    
    const restaurant = new Restaurant({
      owner: req.user.id,
      name,
      description,
      logo: logoUrl,
      image: imageUrl,
      categories: categoryArray,
      deliveryFee,
      deliveryTime,
      address,
      isOpen: true
    });
    
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, description, categories, deliveryFee, deliveryTime, address, isOpen } = req.body;
    const restaurantFields = {};
    
    if (name) restaurantFields.name = name;
    if (description) restaurantFields.description = description;
    if (categories) restaurantFields.categories = categories.split(',').map(cat => cat.trim());
    if (deliveryFee) restaurantFields.deliveryFee = deliveryFee;
    if (deliveryTime) restaurantFields.deliveryTime = deliveryTime;
    if (address) restaurantFields.address = address;
    if (isOpen !== undefined) restaurantFields.isOpen = isOpen === 'true';
    
    // Upload new images if provided
    if (req.files) {
      if (req.files.logo) {
        restaurantFields.logo = await uploadImage(
          req.files.logo[0].buffer,
          'restaurants/logos',
          `logo-${Date.now()}`
        );
      }
      
      if (req.files.image) {
        restaurantFields.image = await uploadImage(
          req.files.image[0].buffer,
          'restaurants/images',
          `image-${Date.now()}`
        );
      }
    }
    
    // Check if restaurant exists and user is owner
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Verify ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: restaurantFields },
      { new: true }
    );
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Verify ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete all menu items associated with this restaurant
    await MenuItem.deleteMany({ restaurantId: req.params.id });
    
    // Delete the restaurant
    await Restaurant.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    console.error('Error deleting restaurant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all menu items for a restaurant
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.params.id });
    res.json(menuItems);
  } catch (error) {
    console.error('Error getting menu items:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add menu item
exports.addMenuItem = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { name, description, price, categories, popular, available } = req.body;
    
    // Check if restaurant exists and user is owner
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Verify ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Upload image
    let imageUrl;
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'Image is required' });
    }
    
    try {
      imageUrl = await uploadImage(
        req.file.buffer,
        'menu-items',
        `menu-${Date.now()}-${req.file.originalname}`
      );
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
      return res.status(500).json({ message: 'Error uploading image' });
    }
    
    if (!imageUrl) {
      return res.status(500).json({ message: 'Failed to upload image' });
    }
    
    const menuItem = new MenuItem({
      restaurantId: req.params.id,
      name,
      description,
      price,
      image: imageUrl,
      categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
      popular: popular === 'true',
      available: available === 'true'
    });
    
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error adding menu item:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, categories, popular, available } = req.body;
    const menuItemFields = {};
    
    if (name) menuItemFields.name = name;
    if (description) menuItemFields.description = description;
    if (price) menuItemFields.price = price;
    if (categories) menuItemFields.categories = categories.split(',').map(cat => cat.trim());
    if (popular !== undefined) menuItemFields.popular = popular === 'true';
    if (available !== undefined) menuItemFields.available = available === 'true';
    
    // Upload new image if provided
    if (req.file) {
      menuItemFields.image = await uploadImage(
        req.file.buffer,
        'menu-items',
        `menu-${Date.now()}`
      );
    }
    
    // Check if menu item exists
    let menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Check if user is restaurant owner
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Verify ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.itemId,
      { $set: menuItemFields },
      { new: true }
    );
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    // Check if menu item exists
    const menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Check if user is restaurant owner
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Verify ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await MenuItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    console.error('Error deleting menu item:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add category (admin only)
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    // Upload image
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadImage(
        req.file.buffer,
        'categories',
        `category-${Date.now()}`
      );
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const category = new Category({
      name,
      image: imageUrl
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error adding category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
