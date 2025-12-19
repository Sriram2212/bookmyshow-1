const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./utils/database');
const { connectRedis } = require('./utils/redisClient');

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
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const adminApp = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PORT = process.env.ADMIN_PORT || "https://bookmyshow-1-three.vercel.app/admin";

// Middleware for main app
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "https://bookmyshow-ftn6nd7x7-sriram2212s-projects.vercel.app",
    "https://bookmyshow-1-three.vercel.app/admin"
  ],
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

// Middleware for admin app
adminApp.use(cors({
  origin: '*',
  credentials: true
}));
adminApp.use(express.json());
adminApp.use(express.urlencoded({ extended: true }));

// Admin Routes
adminApp.use('/admin', adminRoutes);

// Admin health check
adminApp.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Admin server is running' });
});

// Admin 404 handler
adminApp.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Admin error handler
adminApp.use((err, req, res, next) => {
  console.error('Admin Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

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

    // Start main server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log('✅ MongoDB-only mode active');
    });

    // Start admin server on separate port
    adminApp.listen(ADMIN_PORT, () => {
      console.log(`🛡️  Admin Panel running on port ${ADMIN_PORT}`);
      console.log(`🔐 Admin API available at http://localhost:${ADMIN_PORT}/admin`);
      console.log(`📝 Default credentials - Username: admin, Password: 123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();

module.exports = app;

