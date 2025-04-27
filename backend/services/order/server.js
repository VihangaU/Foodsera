
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const orderRoutes = require('./routes/orderRoutes');

// Initialize express app
const app = express();
const PORT = 5004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb+srv://chamikadilshan:FoodixDilshan@foodix.3lne8y5.mongodb.net/?retryWrites=true&w=majority&appName=foodix")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/orders', orderRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Foodix API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
