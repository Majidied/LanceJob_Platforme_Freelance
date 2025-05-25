const mongoose = require('mongoose');

const recommenderSchema = new mongoose.Schema({
  // Peut contenir des paramètres de configuration
}, { timestamps: true });

module.exports = mongoose.model('Recommender', recommenderSchema);