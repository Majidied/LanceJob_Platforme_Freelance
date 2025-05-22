const express = require('express');
const freelancerController = require('../controllers/freelancer.controller');
const { authenticate } = require('../middleware/auth.middleware.js'); // Import authentication middleware if you have it

const router = express.Router();

// Basic CRUD operations
router.get('/', freelancerController.getAllFreelancers);
router.get('/:id', freelancerController.getFreelancerById);
router.post('/', freelancerController.createFreelancer);
router.put('/:id', freelancerController.updateFreelancer);
router.delete('/:id', freelancerController.deleteFreelancer);

// New routes for job applications, saved jobs, and offers
// You may want to protect these routes with authentication middleware

// Job applications
router.post('/apply', freelancerController.applyForMission);
router.get('/:id/applications', freelancerController.getAppliedMissions);

// Saved jobs
router.post('/save-job', freelancerController.saveJob);
router.get('/:id/saved-jobs', freelancerController.getSavedJobs);

// Offers
router.get('/:id/offers', freelancerController.getOffers);
router.post('/respond-offer', freelancerController.respondToOffer);

module.exports = router;