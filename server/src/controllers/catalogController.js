const catalogService = require('../services/catalogService');

const catalogController = {
  async getMovies(req, res) {
    try {
      const movies = await catalogService.getMovies();
      res.status(200).json({
        success: true,
        data: movies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch movies'
      });
    }
  },

  async getMovieById(req, res) {
    try {
      const { id } = req.params;
      const movie = await catalogService.getMovieById(id);
      res.status(200).json({
        success: true,
        data: movie
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Movie not found'
      });
    }
  },

  async getShowsByMovie(req, res) {
    try {
      const { movieId } = req.params;
      const { date } = req.query; // Optional date filter
      
      const result = await catalogService.getShowsByMovie(movieId, date);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to fetch shows'
      });
    }
  },

  async getShowById(req, res) {
    try {
      const { showId } = req.params;
      const show = await catalogService.getShowById(showId);
      res.status(200).json({
        success: true,
        data: show
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Show not found'
      });
    }
  }
};

module.exports = catalogController;

