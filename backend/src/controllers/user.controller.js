const userService = require('../services/user.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserByToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await userService.getUserByToken(token);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.status(200).json({ data: userData });
  } catch (error) {
    next(error);
  }
}

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
