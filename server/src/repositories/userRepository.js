const User = require('../models/User');

const userRepository = {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  },

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  },

  async findById(id) {
    return await User.findById(id).select('-password');
  },

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }
};

module.exports = userRepository;

