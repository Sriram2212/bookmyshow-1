const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./utils/database');
// Redis disabled - using MongoDB only
// const { connectRedis } = require('./utils/redisClient');

// Import models to ensure they are registered
require('./models/User');
require('./models/Movie');
require('./models/Theater');
require('./models/Show');
require('./models/Booking');

// Import routes
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api/booking', bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Initialize connections and start server
const startServer = async () => {
  try {
    // Connect to MongoDB (blocking - required)
    await connectDB();

    // Redis is disabled - using MongoDB only
    console.log('ℹ️  Redis disabled - using MongoDB only mode');

    // Start server (always, as long as MongoDB is up)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log('✅ MongoDB-only mode active');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();

module.exports = app;

