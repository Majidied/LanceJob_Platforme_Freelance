const express = require('express');
const freelancerController = require('../controllers/freelancer.controller');

const router = express.Router();

router.get('/', freelancerController.getAllFreelancers);
router.get('/:id', freelancerController.getFreelancerById);
router.post('/', freelancerController.createFreelancer);
router.put('/:id', freelancerController.updateFreelancer);
router.delete('/:id', freelancerController.deleteFreelancer);
router.get('/profile', freelancerController.isCompleteProfile);

module.exports = router;