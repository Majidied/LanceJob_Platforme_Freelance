const User = require('./user.model');

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  phone: [{
    type: String
  }],
  rating: [{
    type: Number
  }],
    description: [{
    type: String
  }],
  postedMissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }]
});

module.exports  = User.discriminator('client', clientSchema);


