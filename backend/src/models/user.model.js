const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String, // URL ou chemin vers l'image
    default: null
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    default: 'client',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'NOT_VERIFIED', 'SUSPENDED'],
    default: 'NOT_VERIFIED',
  },

},
 {
  discriminatorKey: 'role', 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
