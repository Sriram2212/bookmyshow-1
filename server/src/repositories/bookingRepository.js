const Booking = require('../models/Booking');

const bookingRepository = {
  async create(bookingData) {
    try {
      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      console.log(`✅ Booking saved to DB: ${savedBooking._id}`);
      return savedBooking;
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  },

  async findByUserId(userId) {
    return await Booking.find({ user: userId })
      .populate('show', 'showTime showDate')
      .populate({
        path: 'show',
        populate: {
          path: 'movie',
          select: 'title posterUrl'
        }
      })
      .populate({
        path: 'show',
        populate: {
          path: 'theater',
          select: 'name address'
        }
      })
      .sort({ bookingDate: -1 });
  },

  async findById(id) {
    try {
      const booking = await Booking.findById(id)
        .populate('user', 'name email')
        .populate({
          path: 'show',
          populate: [
            {
              path: 'movie',
              select: 'title posterUrl duration'
            },
            {
              path: 'theater',
              select: 'name address'
            }
          ]
        });
      
      if (!booking) {
        console.log(`❌ Booking not found: ${id}`);
        return null;
      }
      
      console.log(`✅ Booking found: ${id}`);
      return booking;
    } catch (error) {
      console.error(`❌ Error finding booking ${id}:`, error);
      throw new Error(`Failed to find booking: ${error.message}`);
    }
  },

  async findByShowId(showId) {
    return await Booking.find({ show: showId, bookingStatus: 'confirmed' });
  }
};

module.exports = bookingRepository;

