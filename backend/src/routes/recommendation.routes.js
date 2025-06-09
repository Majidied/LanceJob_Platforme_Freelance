/**
 * Recommendation Routes
 * 
 * Defines the API routes for the recommendation system.
 */

const express = require('express');
const recommendationController = require('../controllers/recommendation.controller');

const router = express.Router();

// Get recommendations for a freelancer
router.get('/:freelancerId', recommendationController.getRecommendations);

// Track user interaction with a recommendation
router.post('/interactions', recommendationController.trackInteraction);

// Batch track multiple interactions
router.post('/interactions/batch', recommendationController.batchTrackInteractions);

// Get similar freelancers
router.get('/similar-freelancers/:freelancerId', recommendationController.getSimilarFreelancers);

// Get analytics for a freelancer
router.get('/analytics/:freelancerId', recommendationController.getFreelancerAnalytics);

// Health check for recommendation service
router.get('/health', recommendationController.healthCheck);

// Admin routes - these should be protected with admin authentication middleware
router.post('/retrain', recommendationController.retrainModels);
router.get('/stats', recommendationController.getSystemStats);

module.exports = router;
