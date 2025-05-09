const mongoose = require('mongoose');
const User = require('./user.model');

const freelancerSchema = new mongoose.Schema({
    phone: [{
    type: String
  }],
    bio: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  address: [{
    type: String
  }],
  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }]
});

module.exports  = User.discriminator('freelancer', freelancerSchema);