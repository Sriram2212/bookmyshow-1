const movieRepository = require('../repositories/movieRepository');
const showRepository = require('../repositories/showRepository');

/**
 * MONGODB-ONLY MODE
 * =================
 * Redis caching is disabled. All data is fetched directly from MongoDB.
 * This simplifies the application and removes Redis dependency.
 */

/**
 * CATALOG SERVICE (MongoDB Only)
 * ===============================
 * Handles movie and show data directly from MongoDB
 */
const catalogService = {
  /**
   * Get all movies from MongoDB
   */
  async getMovies() {
    const movies = await movieRepository.findAll();
    return movies;
  },

  /**
   * Get movie by ID from MongoDB
   */
  async getMovieById(movieId) {
    const movie = await movieRepository.findById(movieId);
    if (!movie) {
      throw new Error('Movie not found');
    }
    return movie;
  },

  /**
   * Get shows for a movie with optional date filter
   */
  async getShowsByMovie(movieId, date = null) {
    const movie = await movieRepository.findById(movieId);
    if (!movie) {
      throw new Error('Movie not found');
    }

    const shows = await showRepository.findByMovieId(movieId, date);
    return { movie, shows };
  },

  /**
   * Get show by ID from MongoDB
   */
  async getShowById(showId) {
    const show = await showRepository.findById(showId);
    if (!show) {
      throw new Error('Show not found');
    }
    return show;
  },

  /**
   * Invalidate show cache (no-op in MongoDB-only mode)
   */
  async invalidateShowCache(showId) {
    // No caching in MongoDB-only mode
    console.log(`ℹ️  No cache to invalidate (MongoDB-only mode)`);
  }
};

module.exports = catalogService;

