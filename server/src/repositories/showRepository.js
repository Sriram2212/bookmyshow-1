const Show = require('../models/Show');

const showRepository = {
  async findByMovieId(movieId, date = null) {
    const query = { movie: movieId, isActive: true };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.showDate = { $gte: startOfDay, $lte: endOfDay };
    }
    return await Show.find(query)
      .populate('movie', 'title duration posterUrl')
      .populate('theater', 'name address')
      .sort({ showTime: 1 });
  },

  async findById(id) {
    return await Show.findById(id)
      .populate('movie', 'title duration posterUrl description')
      .populate('theater', 'name address');
  },

  async create(showData) {
    const show = new Show(showData);
    return await show.save();
  },

  async updateSeatStatus(showId, seatIds, status, userId = null) {
    const updateData = {
      'seats.$[elem].status': status
    };
    
    if (status === 'locked') {
      updateData['seats.$[elem].lockedBy'] = userId;
      updateData['seats.$[elem].lockedUntil'] = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    } else if (status === 'available') {
      updateData['seats.$[elem].lockedBy'] = null;
      updateData['seats.$[elem].lockedUntil'] = null;
    }

    return await Show.updateOne(
      { _id: showId },
      {
        $set: updateData
      },
      {
        arrayFilters: [{ 'elem._id': { $in: seatIds } }]
      }
    );
  },

  async updateSeatsToBooked(showId, seatIds) {
    return await Show.updateOne(
      { _id: showId },
      {
        $set: {
          'seats.$[elem].status': 'booked',
          'seats.$[elem].lockedBy': null,
          'seats.$[elem].lockedUntil': null
        }
      },
      {
        arrayFilters: [{ 'elem._id': { $in: seatIds } }]
      }
    );
  }
};

module.exports = showRepository;

