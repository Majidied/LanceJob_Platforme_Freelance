const mongoose = require('mongoose');

const recommendationSystemSchema = new mongoose.Schema({
  // Peut contenir des configurations ou des statistiques
}, { timestamps: true });

module.exports  = mongoose.model('RecommendationSystem', recommendationSystemSchema);