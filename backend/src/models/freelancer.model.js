const mongoose = require('mongoose');
const User = require('./user.model');

const freelancerSchema = new mongoose.Schema({
    phone: [{
    type: String
  }],
  rating: [{
    type: Number
  }],
    bio: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  title: [{
    type: String
  }],
  earned: [{
    type: Number
  }],
  success: [{
    type: Number
  }],
  address: [{
    type: String
  }],
  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],
  appliedMissions: [{
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }]
});

module.exports  = User.discriminator('freelancer', freelancerSchema);