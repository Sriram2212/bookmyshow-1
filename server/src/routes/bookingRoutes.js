const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

// All booking routes require authentication
router.use(authenticate);

// Lock seats for booking (start payment process)
router.post('/lock', bookingController.lockSeats);

// Confirm booking after payment
router.post('/confirm', bookingController.confirmBooking);

// Release locks (cancel booking)
router.post('/release', bookingController.releaseLocks);

// Get all bookings for logged-in user
router.get('/my-bookings', bookingController.getUserBookings);

// Get specific booking by ID
router.get('/:bookingId', bookingController.getBookingById);

module.exports = router;

