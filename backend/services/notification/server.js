
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const smsRoutes = require('./route/sms');

// Initialize express app
const app = express();
const PORT = 5007;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', smsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Foodix API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
