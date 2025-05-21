const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authenticate = async (req, res, next) => {
  try {
    // Check if token exists in headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with the token
    const user = await User.findOne({ 
      _id: decoded.id,
      'tokens.token': token 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please authenticate.' 
      });
    }
    
    // Add user and token to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token. Please authenticate.',
      error: error.message
    });
  }
};

// Check if user is a freelancer
exports.isFreelancer = (req, res, next) => {
  if (req.user && req.user.__t === 'freelancer') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Freelancer access required.' 
    });
  }
};

// Check if user is a client
exports.isClient = (req, res, next) => {
  if (req.user && req.user.__t === 'client') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Client access required.' 
    });
  }
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin access required.' 
    });
  }
};