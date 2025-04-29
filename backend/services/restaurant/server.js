
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const restaurantRoutes = require('./routes/restaurantRoutes');

// Initialize express app
const app = express();
const PORT = 5006;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb+srv://FoodixResta:FoodixRes@foodixresta.r2kvnii.mongodb.net/?retryWrites=true&w=majority&appName=FoodixResta")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/restaurants', restaurantRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Foodix API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
