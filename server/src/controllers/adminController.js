const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { generateToken } = require('../utils/jwt');

// Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple hardcoded admin credentials
    if (username !== 'admin' || password !== '123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      adminId: 'admin-001',
      username: 'admin',
      isAdmin: true
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        username: 'admin',
        isAdmin: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Movie Management
exports.createMovie = async (req, res) => {
  try {
    const { title, description, genre, duration, releaseDate, rating, posterUrl, language } = req.body;

    const movie = new Movie({
      title,
      description,
      genre: Array.isArray(genre) ? genre : [genre],
      duration,
      releaseDate,
      rating,
      posterUrl,
      language,
      isActive: true
    });

    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create movie',
      error: error.message
    });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
      error: error.message
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update movie',
      error: error.message
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error.message
    });
  }
};

// Theater Management
exports.createTheater = async (req, res) => {
  try {
    const { name, address, totalScreens, amenities } = req.body;

    const theater = new Theater({
      name,
      address,
      totalScreens,
      amenities: Array.isArray(amenities) ? amenities : [],
      isActive: true
    });

    await theater.save();

    res.status(201).json({
      success: true,
      message: 'Theater created successfully',
      data: theater
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create theater',
      error: error.message
    });
  }
};

exports.getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.json({
      success: true,
      data: theaters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theaters',
      error: error.message
    });
  }
};

exports.updateTheater = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const theater = await Theater.findByIdAndUpdate(id, updates, { new: true });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.json({
      success: true,
      message: 'Theater updated successfully',
      data: theater
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update theater',
      error: error.message
    });
  }
};

exports.deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findByIdAndDelete(id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.json({
      success: true,
      message: 'Theater deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete theater',
      error: error.message
    });
  }
};

// Show Management
exports.createShow = async (req, res) => {
  try {
    const { movie, theater, screen, showTime, endTime, basePrice, seats } = req.body;

    const show = new Show({
      movie,
      theater,
      screen,
      showTime,
      endTime,
      basePrice,
      seats: seats || [],
      isActive: true
    });

    await show.save();

    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      data: show
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create show',
      error: error.message
    });
  }
};

exports.getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('movie', 'title duration')
      .populate('theater', 'name address');
    
    res.json({
      success: true,
      data: shows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shows',
      error: error.message
    });
  }
};

exports.updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const show = await Show.findByIdAndUpdate(id, updates, { new: true })
      .populate('movie', 'title duration')
      .populate('theater', 'name address');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.json({
      success: true,
      message: 'Show updated successfully',
      data: show
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update show',
      error: error.message
    });
  }
};

exports.deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    const show = await Show.findByIdAndDelete(id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.json({
      success: true,
      message: 'Show deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete show',
      error: error.message
    });
  }
};

// Statistics
exports.getStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalTheaters = await Theater.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalMovies,
        totalTheaters,
        totalShows,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};
