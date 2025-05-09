const User = require('./user.model');

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  postedMissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }]
});

module.exports  = User.discriminator('client', clientSchema);


