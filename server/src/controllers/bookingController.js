const bookingService = require('../services/bookingService');

const bookingController = {
  async lockSeats(req, res) {
    try {
      const { showId, seatIds } = req.body;
      const userId = req.user.userId;

      if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Show ID and seat IDs array are required'
        });
      }

      const result = await bookingService.lockSeats(showId, seatIds, userId);

      res.status(200).json({
        success: true,
        message: 'Seats locked successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to lock seats'
      });
    }
  },

  async confirmBooking(req, res) {
    try {
      const { showId, seatIds, paymentId } = req.body;
      const userId = req.user.userId;

      console.log('📝 Confirm booking request:', { userId, showId, seatIds: seatIds?.length });

      if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Show ID and seat IDs array are required'
        });
      }

      // Mock payment processing
      // In production, integrate with payment gateway
      const mockPaymentId = paymentId || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const booking = await bookingService.confirmBooking(
        userId,
        showId,
        seatIds,
        mockPaymentId
      );

      if (!booking || !booking._id) {
        throw new Error('Booking was not created properly');
      }

      console.log('✅ Booking confirmed successfully:', booking._id);

      res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } catch (error) {
      console.error('❌ Confirm booking error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to confirm booking'
      });
    }
  },

  async releaseLocks(req, res) {
    try {
      const { showId, seatIds } = req.body;
      const userId = req.user.userId;

      if (!showId || !seatIds || !Array.isArray(seatIds)) {
        return res.status(400).json({
          success: false,
          message: 'Show ID and seat IDs array are required'
        });
      }

      const result = await bookingService.releaseLocks(showId, seatIds, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to release locks'
      });
    }
  },

  async getUserBookings(req, res) {
    try {
      const userId = req.user.userId;
      const bookings = await bookingService.getUserBookings(userId);

      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bookings'
      });
    }
  },

  async getBookingById(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID is required'
        });
      }

      const booking = await bookingService.getBookingById(bookingId, userId);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      const statusCode = error.message.includes('Unauthorized') ? 403 : 
                         error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch booking'
      });
    }
  }
};

module.exports = bookingController;

