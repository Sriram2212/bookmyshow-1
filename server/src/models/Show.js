const mongoose = require('mongoose');

const showSeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true // e.g., "A1", "B5"
  },
  row: {
    type: String,
    required: true // e.g., "A", "B"
  },
  column: {
    type: Number,
    required: true // e.g., 1, 2, 3
  },
  seatType: {
    type: String,
    enum: ['regular', 'premium', 'vip'],
    default: 'regular'
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'locked', 'booked'],
    default: 'available'
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lockedUntil: {
    type: Date,
    default: null
  }
}, { _id: true });

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: true
  },
  screen: {
    type: String,
    required: true // e.g., "Screen 1"
  },
  showTime: {
    type: Date,
    required: true
  },
  showDate: {
    type: Date,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  seats: {
    type: [showSeatSchema],
    default: []
  },
  basePrice: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
showSchema.index({ movie: 1, showDate: 1 });
showSchema.index({ theater: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);

