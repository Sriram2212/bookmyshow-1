const Movie = require('../models/Movie');

const movieRepository = {
  async findAll(filters = {}) {
    const query = { isActive: true, ...filters };
    return await Movie.find(query).sort({ releaseDate: -1 });
  },

  async findById(id) {
    return await Movie.findOne({ _id: id, isActive: true });
  },

  async create(movieData) {
    const movie = new Movie(movieData);
    return await movie.save();
  },

  async update(id, updateData) {
    return await Movie.findByIdAndUpdate(id, updateData, { new: true });
  }
};

module.exports = movieRepository;

