const showRepository = require('../repositories/showRepository');
const bookingRepository = require('../repositories/bookingRepository');
const catalogService = require('./catalogService');

/**
 * BOOKING SERVICE (MongoDB Only)
 * ===============================
 * Handles seat locking and booking confirmation using MongoDB only
 * 
 * SEAT LOCKING FLOW:
 * 1. User selects seats → lockSeats() → Seats locked in MongoDB
 * 2. User completes payment → confirmBooking() → Booking created
 * 3. User cancels/timeout → releaseLocks() → Seats unlocked, available again
 * 
 * MONGODB LOCK MECHANISM:
 * - Seat status: 'available', 'locked', 'booked'
 * - Lock expiry: 5 minutes (stored in MongoDB)
 * - Lock ownership: userId stored with lock
 */

const LOCK_EXPIRY = 300; // 5 minutes in seconds

const bookingService = {
  /**
   * LOCK SEATS FOR BOOKING (MongoDB Only)
   * ======================================
   * Locks selected seats for a user during payment process
   * 
   * PROCESS:
   * 1. Verify seat availability in MongoDB
   * 2. Update MongoDB seat status to 'locked' with expiry time
   * 3. Return locked seat details for payment page
   * 
   * RETURNS: { lockedSeats, failedSeats, lockExpiry }
   * THROWS: Error if no seats could be locked
   */
  async lockSeats(showId, seatIds, userId) {
    const lockedSeats = [];
    const failedSeats = [];

    // Process each seat individually with fresh data
    for (const seatId of seatIds) {
      try {
        // Get fresh show data for each seat to avoid stale data
        const show = await showRepository.findById(showId);
        if (!show) {
          throw new Error('Show not found');
        }

        // Find seat in show
        const seat = show.seats.id(seatId);
        if (!seat) {
          failedSeats.push({
            seatId,
            reason: 'Seat not found'
          });
          continue;
        }

        // Check if seat is already booked
        if (seat.status === 'booked') {
          failedSeats.push({
            seatId,
            seatNumber: seat.seatNumber,
            reason: 'Seat is already booked'
          });
          continue;
        }

        // Check if seat is locked
        if (seat.status === 'locked') {
          // Check if lock expired
          if (seat.lockedUntil && new Date(seat.lockedUntil) < new Date()) {
            // Lock expired, can proceed
            console.log(`Lock expired for seat ${seat.seatNumber}, re-locking`);
          } else if (seat.lockedBy && seat.lockedBy.toString() !== userId.toString()) {
            // Locked by different user and not expired
            failedSeats.push({
              seatId,
              seatNumber: seat.seatNumber,
              reason: 'Seat is currently locked by another user'
            });
            continue;
          }
        }

        // Lock seat in MongoDB with expiry time
        const updateResult = await showRepository.updateSeatStatus(showId, [seatId], 'locked', userId);
        
        if (updateResult.modifiedCount > 0) {
          // Add to locked seats
          lockedSeats.push({
            seatId,
            seatNumber: seat.seatNumber,
            price: seat.price,
            expiresAt: new Date(Date.now() + LOCK_EXPIRY * 1000)
          });
          
          console.log(`✅ Seat ${seat.seatNumber} locked for user ${userId}`);
        } else {
          failedSeats.push({
            seatId,
            seatNumber: seat.seatNumber,
            reason: 'Failed to lock seat - may have been taken'
          });
        }
        
      } catch (error) {
        console.error(`Error locking seat ${seatId}:`, error.message);
        failedSeats.push({
          seatId,
          reason: 'Failed to lock seat'
        });
      }
    }

    if (lockedSeats.length === 0) {
      throw new Error('No seats could be locked. All seats may be unavailable.');
    }

    return {
      lockedSeats,
      failedSeats,
      lockExpiry: LOCK_EXPIRY
    };
  },

  /**
   * CONFIRM BOOKING AFTER PAYMENT (MongoDB Only)
   * =============================================
   * Finalizes booking after successful payment
   * 
   * PROCESS:
   * 1. Verify all seats are still locked by this user in MongoDB
   * 2. Calculate total amount
   * 3. Create booking record in MongoDB
   * 4. Update seat status from 'locked' to 'booked'
   * 
   * RETURNS: Populated booking with show and movie details
   * THROWS: Error if any seat is no longer locked by this user
   */
  async confirmBooking(userId, showId, seatIds, paymentId) {
    // Verify show exists
    const show = await showRepository.findById(showId);
    if (!show) {
      throw new Error('Show not found');
    }

    const bookingSeats = [];
    let totalAmount = 0;

    // Verify all seats are still locked by this user
    for (const seatId of seatIds) {
      const seat = show.seats.id(seatId);
      if (!seat) {
        throw new Error(`Seat ${seatId} not found`);
      }

      // Check if seat is locked by this user
      if (seat.status !== 'locked' || seat.lockedBy?.toString() !== userId.toString()) {
        throw new Error(
          `Seat ${seat.seatNumber} is no longer locked by you. Lock may have expired.`
        );
      }

      if (seat.status === 'booked') {
        throw new Error(`Seat ${seat.seatNumber} is already booked`);
      }

      // Collect seat details for booking
      bookingSeats.push({
        seatId: seat._id,
        seatNumber: seat.seatNumber,
        price: seat.price
      });

      totalAmount += seat.price;
    }

    // Create booking record in MongoDB
    const booking = await bookingRepository.create({
      user: userId,
      show: showId,
      seats: bookingSeats,
      totalAmount,
      paymentStatus: 'completed',
      paymentId: paymentId || `PAY_${Date.now()}`,
      bookingStatus: 'confirmed'
    });

    if (!booking || !booking._id) {
      throw new Error('Failed to create booking');
    }

    console.log(`📝 Booking created: ${booking._id} for user ${userId}`);

    // Update seats to booked status in MongoDB
    await showRepository.updateSeatsToBooked(showId, seatIds);

    // Populate booking details with show and movie info
    const populatedBooking = await bookingRepository.findById(booking._id);

    if (!populatedBooking) {
      throw new Error('Failed to retrieve booking details');
    }

    console.log(`✅ Booking confirmed: ${booking._id}`);
    return populatedBooking;
  },

  /**
   * RELEASE LOCKS (MongoDB Only)
   * =============================
   * Releases seat locks when user cancels or payment fails
   * 
   * PROCESS:
   * 1. Update MongoDB seat status back to 'available'
   * 
   * USAGE:
   * - User clicks "Cancel" on payment page
   * - Payment fails or times out
   * - User navigates away (frontend should call this)
   */
  async releaseLocks(showId, seatIds, userId) {
    // Update MongoDB seat status back to available
    await showRepository.updateSeatStatus(showId, seatIds, 'available');

    console.log(`✅ Released ${seatIds.length} locks for show ${showId}`);
    return { 
      success: true, 
      message: 'Locks released successfully',
      releasedCount: seatIds.length
    };
  },

  /**
   * GET USER BOOKINGS
   * =================
   * Retrieves all bookings for a user
   * 
   * RETURNS: Array of bookings with populated show and movie details
   * USAGE: Display user's booking history
   */
  async getUserBookings(userId) {
    const bookings = await bookingRepository.findByUserId(userId);
    console.log(`📋 Retrieved ${bookings.length} bookings for user ${userId}`);
    return bookings;
  },

  /**
   * GET BOOKING BY ID
   * =================
   * Retrieves a specific booking with full details
   * 
   * RETURNS: Booking with populated show, movie, and theater details
   * USAGE: Display booking confirmation page
   */
  async getBookingById(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify booking belongs to user (security check)
    if (booking.user._id.toString() !== userId.toString()) {
      throw new Error('Unauthorized: This booking does not belong to you');
    }

    return booking;
  }
};

module.exports = bookingService;

