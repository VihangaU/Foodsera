
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// // Import routes
// const authRoutes = require('./services/auth/routes/authRoutes');
// const restaurantRoutes = require('./services/restaurant/routes/restaurantRoutes');
// const orderRoutes = require('./services/order/routes/orderRoutes');
// const paymentRoutes = require('./services/payment/routes/paymentRoutes');
// const deliveryRoutes = require('./services/delivery/routes/driverRoutes');
// const adminRoutes = require('./services/admin/routes/adminRoutes');

// // Initialize express app
// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Could not connect to MongoDB', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/restaurants', restaurantRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/delivery', deliveryRoutes);
// app.use('/api/admin', adminRoutes);

// // Default route
// app.get('/', (req, res) => {
//   res.send('Foodix API is running');
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
