const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./utils/database');

// Import models (ensure registration)
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

// ✅ Render provides PORT automatically
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "https://bookmyshow-ftn6nd7x7-sriram2212s-projects.vercel.app",
    "https://bookmyshow-1-three.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- HEALTH CHECK -------------------- */
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api/booking', bookingRoutes);

// ✅ Admin routes (same server, same port)
app.use('/admin', adminRoutes);

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

/* -------------------- START SERVER -------------------- */
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');
    console.log('ℹ️ MongoDB-only mode active');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Base URL: https://bookmyshow-1-1.onrender.com`);
      console.log(`🛡️ Admin API: /admin`);
      console.log(`🔐 Default Admin → admin / 123`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
