const mongoose = require('mongoose');
const User = require('./user.model');

const freelancerSchema = new mongoose.Schema({
  phone: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  },
  bio: {
    type: String
  },
  skills: [{
    type: String
  }],
  title: {
    type: String
  },
  earned: {
    type: Number,
    default: 0
  },
  success: {
    type: Number,
    default: 0
  },
  address: {
    type: String
  },
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
    },
    proposal: {
      type: String
    }
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],
  offers: [{
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'client'
    },
    offerDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    price: {
      type: Number
    },
    message: {
      type: String
    }
  }]
}, { timestamps: true });

module.exports = User.discriminator('freelancer', freelancerSchema);