require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/foodix',
  jwtSecret: process.env.JWT_SECRET || 'foodix-secret-key',
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development'
}; 