const User = require('../models/user.model');
const jwtUtils = require('../utils/jwt.utils');

exports.getAllUsers = async () => {
  return await User.find({});
};

exports.getUserById = async (id) => {
  return await User.findById(id);
};

exports.createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

exports.updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, { new: true });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

exports.getUserByToken = async (token) => {
  // Assuming you have a method to decode the token and get user ID
  const userId = jwtUtils.getUserIdByToken(token);
  return await User.findById(userId);
}
