const express = require('express');
const freelancerController = require('../controllers/freelancer.controller');
const router = express.Router();
const { authenticateJWT, verificationUser} = require('../middleware/auth.middleware');

router.get('/search', freelancerController.searchFreelancers);
// Public route for viewing freelancer profiles
router.get('/public/:id', freelancerController.getFreelancerById);
router.get('/', authenticateJWT, verificationUser, freelancerController.getAllFreelancers);
router.get('/:id', authenticateJWT, verificationUser, freelancerController.getFreelancerById);
router.post('/', authenticateJWT, verificationUser, freelancerController.createFreelancer);
router.put('/:id', authenticateJWT, verificationUser, freelancerController.updateFreelancer);
router.delete('/:id', authenticateJWT, verificationUser, freelancerController.deleteFreelancer);
router.get('/profile', authenticateJWT, verificationUser, freelancerController.isCompleteProfile);

// Job applications
router.post('/apply', authenticateJWT, verificationUser, freelancerController.applyForMission);
router.get('/:id/applications', authenticateJWT, verificationUser, freelancerController.getAppliedMissions);

// Saved jobs
router.post('/save-job', authenticateJWT, verificationUser, freelancerController.saveJob);
router.get('/:id/saved-jobs', authenticateJWT, verificationUser, freelancerController.getSavedJobs);

// Offers
router.get('/:id/offers', authenticateJWT, verificationUser, freelancerController.getOffers);
router.post('/respond-offer', authenticateJWT, verificationUser, freelancerController.respondToOffer);

module.exports = router;
